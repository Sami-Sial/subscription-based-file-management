import express from "express";
const router = express.Router();

import * as controller from "../controllers/user.controllers.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../middlewares/validate.middleware.js";

// ─── SUBSCRIBE / CHANGE SUBSCRIPTION
router.post("/subscribe-free", isLoggedIn, controller.subscribeFree);
router.get("/my-subscriptions", isLoggedIn, controller.getUserSubscriptions);
router.get("/all-subscriptions", controller.getActiveSubscriptions);

// ─── FOLDERS
router.post("/folders", isLoggedIn, controller.createFolder);
router.put("/folders/:id", isLoggedIn, controller.updateFolder);
router.delete("/folders/:id", isLoggedIn, controller.deleteFolder);

// ─── FILES
router.get("/files/check-limits", isLoggedIn, controller.checkFileLimits);
router.post("/files", isLoggedIn, controller.uploadFile);
router.put("/files/:id", isLoggedIn, controller.updateFile);
router.delete("/files/:id", isLoggedIn, controller.deleteFile);

// ─── GET FOLDERS & FILES
router.get("/all-folders", isLoggedIn, controller.getFoldersAndFiles);
router.get(
  "/active-subscription-folders",
  isLoggedIn,
  controller.getActivePlanFilesAndFolders
);

export default router;
