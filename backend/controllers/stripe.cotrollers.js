import { prisma } from "../lib/prisma.js";
import Stripe from "stripe";
import { success, error } from "../lib/response.js";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover", // pin API version
});

// ─── CREATE STRIPE CHECKOUT SESSION ─────────────
export const stripeSubscribe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) return error(res, 404, "Subscription not found");

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: subscription.name,
            },
            unit_amount: subscription.priceMonthly * 100,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        subscriptionId,
      },
      success_url: `${process.env.FRONTEND_URL}/user/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/user/payment-cancel`,
    });

    return success(res, 200, "Checkout session created", {
      url: session.url,
    });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Stripe error");
  }
};

// STRIPE WEBHOOK
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

  // ─── PAYMENT SUCCESS ─────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const userId = session.metadata.userId;
    const subscriptionId = session.metadata.subscriptionId;

    const stripeSubscriptionId = session.subscription;
    const stripeCustomerId = session.customer;

    // Expire previous active subscription
    const activeSub = await prisma.userSubscription.findFirst({
      where: { userId, status: "active" },
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
        stripeSubscriptionId,
        stripeCustomerId,
        startDate: new Date(),
        status: "active",
      },
    });
  }

  // ─── SUBSCRIPTION CANCELLED ─────────────
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
};
