import express from "express";
import { stripeSubscribe, verifySession } from "../controllers/stripe.cotrollers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/payment", isLoggedIn, stripeSubscribe);
router.post("/verify-session", isLoggedIn, verifySession);

export default router;
