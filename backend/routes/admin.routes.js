// routes/admin.routes.js
import express from "express";
const router = express.Router();

import * as controller from "../controllers/admin.controllers.js";

import { isLoggedIn, isAdmin } from "../middlewares/auth.middleware.js";

import {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  idParamSchema,
} from "../zod-validations/admin.validations.js";

import {
  validateBody,
  validateParams,
} from "../middlewares/validate.middleware.js";

// ─── CREATE ───────────────────────────────
router.post(
  "/subscriptions",
  isLoggedIn,
  isAdmin,
  validateBody(createSubscriptionSchema),
  controller.createSubscription
);

// ─── GET ALL ──────────────────────────────
router.get(
  "/subscriptions",
  isLoggedIn,
  isAdmin,
  controller.getAllSubscriptions
);

// ─── GET SINGLE ───────────────────────────
router.get(
  "/subscriptions/:id",
  isLoggedIn,
  isAdmin,
  validateParams(idParamSchema),
  controller.getSubscriptionById
);

// ─── UPDATE ───────────────────────────────
router.put(
  "/subscriptions/:id",
  isLoggedIn,
  isAdmin,
  validateParams(idParamSchema),
  validateBody(updateSubscriptionSchema),
  controller.updateSubscription
);

// ─── DELETE ───────────────────────────────
router.delete(
  "/subscriptions/:id",
  isLoggedIn,
  isAdmin,
  validateParams(idParamSchema),
  controller.deleteSubscription
);

// GET all users
router.get("/users", isLoggedIn, isAdmin, controller.getAllUsers);

// DELETE user by ID
router.delete("/users/:id", isLoggedIn, isAdmin, controller.deleteUserById);

// GET ADMIN STATS
router.get("/stats", isLoggedIn, isAdmin, controller.getAdminStats);

export default router;
