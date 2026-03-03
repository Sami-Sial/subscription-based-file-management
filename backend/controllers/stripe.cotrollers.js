import { prisma } from "../lib/prisma.js";
import Stripe from "stripe";
import { success, error } from "../lib/response.js";

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
          `Downgrades are only allowed after your current subscription ends.
          }`
        );
      }

      // For upgrades, calculate remaining days to adjust fee
      if (newPlan.priceMonthly > currentPlan.priceMonthly) {
        const now = new Date();
        const end = activeSub.endDate || new Date(activeSub.startDate);
        const totalDays =
          (end - activeSub.startDate) / (1000 * 60 * 60 * 24) || 30;
        const remainingDays = (end - now) / (1000 * 60 * 60 * 24) || 0;

        const credit = (currentPlan.priceMonthly / totalDays) * remainingDays;
        const newAmount = newPlan.priceMonthly - credit;

        // Use Stripe Checkout with adjusted price (custom price_data)
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          customer_email: user.email,
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${newPlan.name} (Upgrade)`,
                },
                unit_amount: Math.round(newAmount * 100),
              },
              quantity: 1,
            },
          ],
          metadata: { userId, subscriptionId },
          success_url: `${process.env.FRONTEND_URL}/user/payment-success`,
          cancel_url: `${process.env.FRONTEND_URL}/user/payment-cancel`,
        });

        return success(res, 200, "Checkout session created for upgrade", {
          url: session.url,
        });
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
            unit_amount: newPlan.priceMonthly * 100,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: { userId, subscriptionId },
      success_url: `${process.env.FRONTEND_URL}/user/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/user/payment-cancel`,
    });

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
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // ─── PAYMENT SUCCESS / SUBSCRIPTION CREATED ─────────
    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.updated"
    ) {
      const session = event.data.object;

      const userId = session.metadata.userId;
      const subscriptionId = session.metadata.subscriptionId;
      const stripeSubscriptionId = session.subscription;
      const stripeCustomerId = session.customer;

      // Find currently active subscription
      const activeSub = await prisma.userSubscription.findFirst({
        where: { userId, status: "active" },
        orderBy: { startDate: "desc" },
      });

      // Expire previous subscription if exists and different plan
      if (activeSub && activeSub.subscriptionId !== subscriptionId) {
        await prisma.userSubscription.update({
          where: { id: activeSub.id },
          data: {
            status: "expired",
            endDate: new Date(),
          },
        });
      }

      // Check if subscription already exists to avoid duplicates
      const existingSub = await prisma.userSubscription.findFirst({
        where: { stripeSubscriptionId },
      });
      if (!existingSub) {
        // Create new subscription record
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
    }

    // ─── SUBSCRIPTION CANCELLED BY USER ─────────
    if (event.type === "customer.subscription.deleted") {
      const stripeSubscriptionId = event.data.object.id;

      await prisma.userSubscription.updateMany({
        where: { stripeSubscriptionId },
        data: {
          status: "cancelled",
          endDate: new Date(),
        },
      });
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).send("Webhook processing error");
  }
};
