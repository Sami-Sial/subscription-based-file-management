import express from "express";
import { stripeSubscribe, verifySession, cancelSubscription, keepSubscription } from "../controllers/stripe.cotrollers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/payment", isLoggedIn, stripeSubscribe);
router.post("/verify-session", isLoggedIn, verifySession);
router.post("/cancel-subscription", isLoggedIn, cancelSubscription);
router.post("/keep-subscription", isLoggedIn, keepSubscription);

export default router;
