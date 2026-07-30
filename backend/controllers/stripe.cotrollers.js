import { prisma } from "../lib/prisma.js";
import Stripe from "stripe";
import { success, error } from "../lib/response.js";
import { sendTemplateMail } from "../lib/mailer.js";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
});

// ─── CREATE STRIPE CHECKOUT SESSION ─────────────
export const stripeSubscribe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body;

    // Fetch requested subscription
    const newPlan = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!newPlan) return error(res, 404, "Subscription not found");

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Find currently active subscription
    const activeSub = await prisma.userSubscription.findFirst({
      where: { userId, status: "active" },
      orderBy: { startDate: "desc" },
    });

    // ─── HANDLE DOWNGRADE / UPGRADE LOGIC ─────────
    if (activeSub) {
      const currentPlan = await prisma.subscription.findUnique({
        where: { id: activeSub.subscriptionId },
      });

      // Check for downgrade
      if (newPlan.priceMonthly < currentPlan.priceMonthly) {
        return error(
          res,
          400,
          `Downgrades are only allowed after your current subscription ends.`
        );
      }

      // For upgrades — switch to the new plan with auto-renewal
      if (newPlan.priceMonthly > currentPlan.priceMonthly) {

        // ── If user has an existing Stripe subscription, upgrade it directly ──
        // This keeps auto-renewal working and Stripe handles proration automatically.
        if (activeSub.stripeSubscriptionId) {
          // Retrieve current Stripe subscription to get the item ID
          const stripeSub = await stripe.subscriptions.retrieve(
            activeSub.stripeSubscriptionId
          );

          const currentItemId = stripeSub.items.data[0]?.id;

          // Create a new recurring price for the new plan on-the-fly
          const newPrice = await stripe.prices.create({
            currency: "usd",
            unit_amount: Math.round(newPlan.priceMonthly * 100),
            recurring: { interval: "month" },
            product_data: { name: newPlan.name },
          });

          // Update the Stripe subscription — proration charges the difference immediately
          await stripe.subscriptions.update(activeSub.stripeSubscriptionId, {
            items: [{ id: currentItemId, price: newPrice.id }],
            proration_behavior: "always_invoice", // charges prorated diff immediately
            metadata: { userId, subscriptionId },
          });

          // Update our DB record to reflect the new plan
          await prisma.userSubscription.update({
            where: { id: activeSub.id },
            data: {
              subscriptionId,   // new plan ID
              status: "active",
            },
          });

          console.log(`[Stripe] Subscription upgraded for user ${userId} to plan ${newPlan.name}`);
          return success(res, 200, "Plan upgraded successfully! Auto-renewal is active.", {});
        }

        // ── No existing Stripe subscription (e.g. was on a free plan) ──
        // Fall through to create a brand-new subscription checkout below.
      }
    }

    // ─── IF NO ACTIVE SUBSCRIPTION OR SAME PRICE PLAN ─────────
    // Regular Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: newPlan.name },
            unit_amount: Math.round(newPlan.priceMonthly * 100),
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId, subscriptionId },
      success_url: `${process.env.FRONTEND_URL}/user/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/user/payment-cancel`,
    });

    console.log(`[Stripe] Subscription checkout session created: ${session.id} for user ${userId}`);
    return success(res, 200, "Checkout session created", { url: session.url });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Stripe error");
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    if (!sig) {
      console.error("[Stripe Webhook] Missing stripe-signature header");
      return res.status(400).send("Webhook Error: Missing stripe-signature header");
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set");
      return res.status(500).send("Webhook Error: Server misconfiguration");
    }
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(`[Stripe Webhook] Event received: ${event.type} (id: ${event.id})`);
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    console.error("[Stripe Webhook] Tip: Make sure STRIPE_WEBHOOK_SECRET matches the endpoint secret in Stripe Dashboard.");
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // ==== CHECKOUT COMPLETED (PAYMENT SUCCESS)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const userId = session.metadata?.userId;
      const subscriptionId = session.metadata?.subscriptionId;
      const isUpgrade = session.metadata?.isUpgrade === "true";

      if (!userId || !subscriptionId) {
        console.log("Missing metadata in checkout session");
        return res.json({ received: true });
      }

      // ─── HANDLE UPGRADE (PAYMENT MODE) ─────────
      if (session.mode === "payment" && isUpgrade) {
        // Expire old active subscription
        const activeSub = await prisma.userSubscription.findFirst({
          where: { userId, status: "active" },
          orderBy: { startDate: "desc" },
        });

        if (activeSub) {
          await prisma.userSubscription.update({
            where: { id: activeSub.id },
            data: {
              status: "expired",
              endDate: new Date(),
            },
          });
        }

        // Create new subscription record
        await prisma.userSubscription.create({
          data: {
            userId,
            subscriptionId,
            stripeCustomerId: session.customer,
            startDate: new Date(),
            status: "active",
          },
        });

        console.log(`Upgrade completed for user ${userId}`);
        return res.json({ received: true });
      }

      // ─── HANDLE REGULAR SUBSCRIPTION (SUBSCRIPTION MODE) ─────────
      if (session.mode === "subscription") {
        const stripeSubscriptionId = session.subscription;
        const stripeCustomerId = session.customer;

        if (!stripeSubscriptionId) {
          console.log("Missing Stripe subscription ID");
          return res.json({ received: true });
        }

        // Expire old active subscription
        const activeSub = await prisma.userSubscription.findFirst({
          where: { userId, status: "active" },
          orderBy: { startDate: "desc" },
        });

        if (activeSub && activeSub.subscriptionId !== subscriptionId) {
          await prisma.userSubscription.update({
            where: { id: activeSub.id },
            data: {
              status: "expired",
              endDate: new Date(),
            },
          });
        }

        // Prevent duplicate creation
        const existingSub = await prisma.userSubscription.findFirst({
          where: { stripeSubscriptionId },
        });

        if (!existingSub) {
          await prisma.userSubscription.create({
            data: {
              userId,
              subscriptionId,
              stripeSubscriptionId,
              stripeCustomerId,
              startDate: new Date(),
              status: "active",
            },
          });
        }

        console.log(`Subscription created for user ${userId}`);
        return res.json({ received: true });
      }

      // If neither upgrade nor subscription mode, just acknowledge
      return res.json({ received: true });
    }

    // =======SUBSCRIPTION UPDATED (RENEWAL / PLAN CHANGE)

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;

      const stripeSubscriptionId = subscription.id;

      const existingSub = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId },
      });

      if (existingSub) {
        await prisma.userSubscription.update({
          where: { id: existingSub.id },
          data: {
            status: subscription.status === "active" ? "active" : "expired",
            cancelAtPeriodEnd: subscription.cancel_at_period_end ?? false,
          },
        });
      }
    }

    // ==== SUBSCRIPTION CANCELLED

    if (event.type === "customer.subscription.deleted") {
      const stripeSubscriptionId = event.data.object.id;

      await prisma.userSubscription.updateMany({
        where: { stripeSubscriptionId },
        data: {
          status: "cancelled",
          endDate: new Date(),
        },
      });

      console.log(`[Stripe Webhook] Subscription cancelled: ${stripeSubscriptionId}`);
    }

    // ==== SUBSCRIPTION CREATED (new subscription via Stripe)
    // Note: For our flow, checkout.session.completed already handles this.
    // This is a safety net for subscriptions created outside of our checkout flow.
    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object;
      const stripeSubscriptionId = subscription.id;

      // Only act if we don't already have this subscription recorded
      const existingSub = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId },
      });

      if (existingSub) {
        console.log(`[Stripe Webhook] subscription.created: already exists, skipping (${stripeSubscriptionId})`);
      } else {
        console.log(`[Stripe Webhook] subscription.created: no matching record found for ${stripeSubscriptionId} — likely handled by checkout.session.completed`);
      }
    }

    // ==== INVOICE PAID (monthly renewal confirmed)
    // Fires every billing cycle when the renewal payment succeeds.
    // Keeps the subscription marked as active and extends the end date.
    if (event.type === "invoice.paid") {
      const invoice = event.data.object;
      const stripeSubscriptionId = invoice.subscription;

      if (stripeSubscriptionId) {
        const existingSub = await prisma.userSubscription.findFirst({
          where: { stripeSubscriptionId },
        });

        if (existingSub) {
          // Extend end date by 30 days from now (monthly renewal)
          const newEndDate = new Date();
          newEndDate.setDate(newEndDate.getDate() + 30);

          await prisma.userSubscription.update({
            where: { id: existingSub.id },
            data: {
              status: "active",
              endDate: newEndDate,
            },
          });
          console.log(`[Stripe Webhook] Invoice paid — subscription renewed for ${stripeSubscriptionId}`);
        }
      }
    }

    // ==== INVOICE PAYMENT FAILED (renewal failed — card declined etc.)
    // IMPORTANT: Mark subscription as expired so the user loses access.
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const stripeSubscriptionId = invoice.subscription;

      if (stripeSubscriptionId) {
        const existingSub = await prisma.userSubscription.findFirst({
          where: { stripeSubscriptionId },
          include: { user: true, subscription: true }
        });

        if (existingSub) {
          await prisma.userSubscription.update({
            where: { id: existingSub.id },
            data: {
              status: "expired",
              endDate: new Date(),
            },
          });
          
          await sendTemplateMail({
            to: existingSub.user.email,
            subject: "Subscription Renewal Failed",
            templateName: "subscription-failed",
            templateData: { 
              name: existingSub.user.name || "User", 
              planName: existingSub.subscription.name,
              billingUrl: `${process.env.FRONTEND_URL}/user/settings`
            },
          });

          console.log(`[Stripe Webhook] Payment failed — subscription expired for ${stripeSubscriptionId}`);
        }
      }
    }

    // ==== INVOICE PAYMENT SUCCEEDED (same as invoice.paid — keep in sync)
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const stripeSubscriptionId = invoice.subscription;

      if (stripeSubscriptionId) {
        const existingSub = await prisma.userSubscription.findFirst({
          where: { stripeSubscriptionId },
        });

        if (existingSub && existingSub.status !== "active") {
          await prisma.userSubscription.update({
            where: { id: existingSub.id },
            data: { status: "active" },
          });
          console.log(`[Stripe Webhook] Invoice payment succeeded — subscription re-activated for ${stripeSubscriptionId}`);
        }
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).send("Webhook processing error");
  }
};

// ─── VERIFY SESSION & ACTIVATE PLAN (called by payment-success page) ─────────
// This is a fallback in case the webhook hasn't fired yet or fails.
export const verifySession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.body;

    if (!sessionId) {
      return error(res, 400, "Session ID is required");
    }

    // Retrieve session directly from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return error(res, 404, "Session not found");
    }

    // Only process if payment/checkout was actually completed
    if (session.payment_status !== "paid" && session.status !== "complete") {
      return error(res, 400, "Payment not completed");
    }

    const metaUserId = session.metadata?.userId;
    const subscriptionId = session.metadata?.subscriptionId;
    const isUpgrade = session.metadata?.isUpgrade === "true";

    // Security: ensure session belongs to the requesting user
    if (metaUserId !== userId) {
      return error(res, 403, "Unauthorized: session does not belong to this user");
    }

    if (!subscriptionId) {
      return error(res, 400, "Invalid session: missing subscription info");
    }

    // ── Check if already processed (idempotency) ──
    // For subscription mode: check by stripeSubscriptionId
    if (session.mode === "subscription" && session.subscription) {
      const existingSub = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId: session.subscription },
      });
      if (existingSub) {
        console.log(`[verifySession] Already processed session ${sessionId}`);
        return success(res, 200, "Subscription already active", { alreadyProcessed: true });
      }
    }

    // ── Handle UPGRADE (payment mode) ──
    if (session.mode === "payment" && isUpgrade) {
      // Check if already processed by looking for a sub created after this session
      const checkSub = await prisma.userSubscription.findFirst({
        where: { userId, subscriptionId, status: "active" },
        orderBy: { startDate: "desc" },
      });

      // If there's already an active sub for this plan, it was processed (by webhook or previous call)
      if (checkSub) {
        return success(res, 200, "Upgrade already applied", { alreadyProcessed: true });
      }

      // Expire old active subscription
      const activeSub = await prisma.userSubscription.findFirst({
        where: { userId, status: "active" },
        orderBy: { startDate: "desc" },
      });

      if (activeSub) {
        await prisma.userSubscription.update({
          where: { id: activeSub.id },
          data: { status: "expired", endDate: new Date() },
        });
      }

      // Create new upgraded subscription
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      await prisma.userSubscription.create({
        data: {
          userId,
          subscriptionId,
          stripeCustomerId: session.customer,
          startDate: new Date(),
          endDate,
          status: "active",
        },
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const plan = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
      
      if (user && plan) {
        await sendTemplateMail({
          to: user.email,
          subject: "Subscription Upgraded",
          templateName: "subscription-success",
          templateData: { 
            name: user.name || "User", 
            planName: plan.name,
            dashboardUrl: `${process.env.FRONTEND_URL}/user/dashboard`
          },
        });
      }

      console.log(`[verifySession] Upgrade applied for user ${userId}`);
      return success(res, 200, "Upgrade successful! Your plan has been activated.", {});
    }

    // ── Handle REGULAR SUBSCRIPTION (subscription mode) ──
    if (session.mode === "subscription") {
      const stripeSubscriptionId = session.subscription;
      const stripeCustomerId = session.customer;

      // Expire old active subscription (different plan)
      const activeSub = await prisma.userSubscription.findFirst({
        where: { userId, status: "active" },
        orderBy: { startDate: "desc" },
      });

      if (activeSub && activeSub.subscriptionId !== subscriptionId) {
        await prisma.userSubscription.update({
          where: { id: activeSub.id },
          data: { status: "expired", endDate: new Date() },
        });
      }

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await prisma.userSubscription.create({
        data: {
          userId,
          subscriptionId,
          stripeSubscriptionId,
          stripeCustomerId,
          startDate: new Date(),
          endDate,
          status: "active",
        },
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const plan = await prisma.subscription.findUnique({ where: { id: subscriptionId } });

      if (user && plan) {
        await sendTemplateMail({
          to: user.email,
          subject: "Subscription Confirmed",
          templateName: "subscription-success",
          templateData: { 
            name: user.name || "User", 
            planName: plan.name,
            dashboardUrl: `${process.env.FRONTEND_URL}/user/dashboard`
          },
        });
      }

      console.log(`[verifySession] Subscription created for user ${userId}`);
      return success(res, 200, "Subscription activated successfully!", {});
    }

    return error(res, 400, "Unknown payment mode");
  } catch (err) {
    console.error("[verifySession] Error:", err);
    return error(res, 500, "Failed to verify payment session");
  }
};
// ─── CANCEL SUBSCRIPTION ─────────────
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const activeSub = await prisma.userSubscription.findFirst({
      where: { userId, status: "active" },
      include: { subscription: true }
    });

    if (!activeSub) return error(res, 400, "No active subscription found");
    if (activeSub.subscription.priceMonthly === 0) return error(res, 400, "Cannot cancel a free plan this way");
    if (activeSub.cancelAtPeriodEnd) return error(res, 400, "Subscription is already scheduled to cancel");

    // Tell Stripe to cancel at period end (not immediately — user keeps access)
    if (activeSub.stripeSubscriptionId) {
      await stripe.subscriptions.update(activeSub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    // Calculate end date (keep existing or fallback to 30 days from start)
    const periodEnd = activeSub.endDate
      ? new Date(activeSub.endDate)
      : new Date(new Date(activeSub.startDate).getTime() + 30 * 24 * 60 * 60 * 1000);

    // Mark as pending cancellation — status stays "active" so user keeps access until period ends
    await prisma.userSubscription.update({
      where: { id: activeSub.id },
      data: {
        cancelAtPeriodEnd: true,
        endDate: periodEnd,
      }
    });

    // Send cancellation scheduled email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendTemplateMail({
        to: user.email,
        subject: "Your Subscription is Scheduled to Cancel",
        templateName: "subscription-failed",
        templateData: { 
          name: user.name || "User", 
          planName: activeSub.subscription.name,
          billingUrl: process.env.FRONTEND_URL + "/user/subscriptions"
        },
      });
    }

    return success(res, 200, "Subscription will be cancelled at the end of the billing period", {
      cancelAtPeriodEnd: true,
      endDate: periodEnd,
    });
  } catch (err) {
    console.error("[cancelSubscription] Error:", err);
    return error(res, 500, "Failed to cancel subscription");
  }
};

// ─── KEEP SUBSCRIPTION (undo scheduled cancellation) ─────────────
export const keepSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const activeSub = await prisma.userSubscription.findFirst({
      where: { userId, status: "active", cancelAtPeriodEnd: true },
      include: { subscription: true }
    });

    if (!activeSub) return error(res, 400, "No scheduled cancellation found");

    // Tell Stripe to resume (disable cancel_at_period_end)
    if (activeSub.stripeSubscriptionId) {
      await stripe.subscriptions.update(activeSub.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
    }

    // Clear the flag in DB
    await prisma.userSubscription.update({
      where: { id: activeSub.id },
      data: { cancelAtPeriodEnd: false }
    });

    return success(res, 200, "Subscription renewal resumed successfully");
  } catch (err) {
    console.error("[keepSubscription] Error:", err);
    return error(res, 500, "Failed to resume subscription");
  }
};
