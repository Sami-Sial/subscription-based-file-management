import express from "express";
import { stripeSubscribe } from "../controllers/stripe.cotrollers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/payment", isLoggedIn, stripeSubscribe);

export default router;
