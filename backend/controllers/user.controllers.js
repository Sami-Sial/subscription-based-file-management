import { prisma } from "../lib/prisma.js";
import { success, error } from "../lib/response.js";

// ─── SUBSCRIBE / FREE SUBSCRIPTION ─────────────
export const subscribeFree = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body;

    // Fetch requested subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription) return error(res, 404, "Subscription not found");

    // Ensure it's a free plan
    if (subscription.priceMonthly > 0) {
      return error(
        res,
        400,
        "This endpoint is only for subscribing to the free plan"
      );
    }

    const now = new Date();

    // ─── CHECK ACTIVE PAID SUBSCRIPTION ─────────
    const activeSub = await prisma.userSubscription.findFirst({
      where: { userId, status: "active" },
      orderBy: { startDate: "desc" },
    });

    if (activeSub) {
      const activePlan = await prisma.subscription.findUnique({
        where: { id: activeSub.subscriptionId },
      });

      if (activePlan.priceMonthly > 0) {
        const endDate = activeSub.endDate || new Date(activeSub.startDate);
        return error(
          res,
          400,
          `You currently have an active paid subscription. You can downgrade to free plan after ${endDate.toDateString()}. It will automatically expire then.`
        );
      }
    }

    // ─── CHECK TOTAL FREE PLAN USAGE ─────────
    const freeSubs = await prisma.userSubscription.findMany({
      where: { userId, subscriptionId },
      orderBy: { startDate: "asc" },
    });

    let totalUsedDays = 0;
    freeSubs.forEach((sub) => {
      const start = new Date(sub.startDate);
      const end = sub.endDate
        ? new Date(sub.endDate)
        : new Date(sub.updatedAt || now);
      totalUsedDays += Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    });

    if (totalUsedDays >= 30) {
      return error(
        res,
        400,
        `You have already used ${totalUsedDays} days of this free plan. Cannot activate again until next month.`
      );
    }

    // ─── ACTIVATE FREE PLAN ─────────
    await prisma.userSubscription.create({
      data: {
        userId,
        subscriptionId,
        startDate: now,
        status: "active",
      },
    });

    return success(
      res,
      200,
      `Free plan activated successfully. Total used days so far: ${totalUsedDays}`
    );
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};

// ─── GET USER SUBSCRIPTIONS ─────────────
export const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId },
      include: {
        subscription: true, // include plan details
      },
      orderBy: {
        startDate: "desc",
      },
    });

    if (!subscriptions.length) return error(res, 404, "No subscriptions found");

    return success(res, 200, "User subscriptions fetched", subscriptions);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};

// ─── CREATE FOLDER ─────────────
export const createFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, parentId } = req.body;

    // Get active subscription and check expiry (30 days)
    let activeSub = await prisma.userSubscription.findFirst({
      where: { userId, status: "active" },
      include: { subscription: true },
      orderBy: { startDate: "desc" },
    });

    if (!activeSub) return error(res, 403, "No active subscription");

    // ─── CHECK EXPIRY ─────────
    const now = new Date();
    const startDate = new Date(activeSub.startDate);
    const diffDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      // expire the subscription
      await prisma.userSubscription.update({
        where: { id: activeSub.id },
        data: { status: "expired", endDate: now },
      });
      return error(res, 403, "Subscription expired. Please renew your plan.");
    }

    const { maxFolders, maxNesting, priceMonthly } = activeSub.subscription;

    let totalFolders = 0;

    if (priceMonthly == 0) {
      const freeSubs = await prisma.userSubscription.findMany({
        where: {
          userId,
          subscription: { priceMonthly: 0 },
        },
        select: { id: true },
      });

      const freeSubIds = freeSubs.map((sub) => sub.id);

      totalFolders = await prisma.folder.count({
        where: {
          userSubscriptionId: { in: freeSubIds },
        },
      });
    } else {
      totalFolders = await prisma.folder.count({
        where: {
          userSubscriptionId: activeSub.id,
        },
      });
    }

    if (totalFolders >= maxFolders)
      return error(res, 400, "Folder limit reached for current plan");

    let level = 0;

    if (parentId) {
      const parent = await prisma.folder.findUnique({
        where: { id: parentId },
      });

      if (!parent || parent.userId !== userId)
        return error(res, 404, "Parent folder not found");

      level = parent.level + 1;

      if (level >= maxNesting)
        return error(res, 400, "Max nesting level reached");
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        parentId,
        userId,
        level,
        userSubscriptionId: activeSub.id,
      },
    });

    return success(res, 201, "Folder created", folder);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};

// ─── UPDATE FOLDER ─────────────
export const updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    const folder = await prisma.folder.findUnique({ where: { id } });
    if (!folder || folder.userId !== userId)
      return error(res, 404, "Folder not found");

    const updated = await prisma.folder.update({
      where: { id },
      data: { name },
    });
    return success(res, 200, "Folder updated", updated);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};

// ─── DELETE FOLDER ─────────────
export const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const folder = await prisma.folder.findUnique({ where: { id } });
    if (!folder || folder.userId !== userId)
      return error(res, 404, "Folder not found");

    await prisma.folder.delete({ where: { id } });
    return success(res, 200, "Folder deleted");
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};

// ─── CREATE FILE / UPLOAD ─────────────
export const uploadFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId, name, url, publicId, format, sizeMB } = req.body;

    // Get active subscription and check expiry (30 days)
    let activeSub = await prisma.userSubscription.findFirst({
      where: { userId, status: "active" },
      include: { subscription: true },
      orderBy: { startDate: "desc" },
    });

    if (!activeSub) return error(res, 403, "No active subscription");

    // ─── CHECK EXPIRY ─────────
    const now = new Date();
    const startDate = new Date(activeSub.startDate);
    const diffDays = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));

    if (diffDays > 30) {
      await prisma.userSubscription.update({
        where: { id: activeSub.id },
        data: { status: "expired", endDate: now },
      });
      return error(res, 403, "Subscription expired. Please renew your plan.");
    }

    const {
      allowedTypes,
      totalFileLimit,
      filesPerFolder,
      maxFileSizeMB,
      priceMonthly,
    } = activeSub.subscription;

    // ✅ Validate type
    if (!allowedTypes.includes(format.toLowerCase()))
      return error(res, 400, "File type not allowed");

    // ✅ Validate size
    if (sizeMB > maxFileSizeMB)
      return error(res, 400, "File size exceeds limit");

    let totalFiles = 0;
    let folderFiles = 0;

    if (priceMonthly === 0) {
      const freeSubs = await prisma.userSubscription.findMany({
        where: {
          userId,
          subscription: { priceMonthly: 0 },
        },
        select: { id: true },
      });

      const freeSubIds = freeSubs.map((sub) => sub.id);

      totalFiles = await prisma.file.count({
        where: { userSubscriptionId: { in: freeSubIds } },
      });

      folderFiles = await prisma.file.count({
        where: { folderId, userSubscriptionId: { in: freeSubIds } },
      });
    } else {
      totalFiles = await prisma.file.count({
        where: { userSubscriptionId: activeSub.id },
      });

      folderFiles = await prisma.file.count({
        where: { folderId, userSubscriptionId: activeSub.id },
      });
    }

    if (totalFiles >= totalFileLimit)
      return error(res, 400, "Total file limit reached for current plan");

    if (folderFiles >= filesPerFolder)
      return error(res, 400, "Folder file limit reached");

    const file = await prisma.file.create({
      data: {
        name,
        url,
        publicId,
        format,
        sizeMB,
        folderId,
        userId,
        userSubscriptionId: activeSub.id,
      },
    });

    return success(res, 201, "File uploaded", file);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};

// ─── UPDATE FILE ─────────────
export const updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    const file = await prisma.file.findUnique({ where: { id } });
    if (!file || file.userId !== userId)
      return error(res, 404, "File not found");

    const updated = await prisma.file.update({ where: { id }, data: { name } });
    return success(res, 200, "File updated", updated);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};

// ─── DELETE FILE ─────────────
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const file = await prisma.file.findUnique({ where: { id } });
    if (!file || file.userId !== userId)
      return error(res, 404, "File not found");

    await prisma.file.delete({ where: { id } });
    return success(res, 200, "File deleted");
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};

// ─── GET USER FOLDERS & FILES FOR ALL SUBSCRIPTIONS ─────────────
export const getFoldersAndFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const folders = await prisma.folder.findMany({
      where: { userId },
      include: { subfolders: true, files: true },
    });

    return success(res, 200, "Folders & files fetched", folders);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};

// GET USER FOLDER AND FILES FOR ACTIVE SUBSCRIPTION
export const getActivePlanFilesAndFolders = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get active subscription
    const activeSub = await prisma.userSubscription.findFirst({
      where: { userId, status: "active" },
      include: { subscription: true },
      orderBy: { startDate: "desc" },
    });

    if (!activeSub) return error(res, 403, "No active subscription");

    const { priceMonthly } = activeSub.subscription;

    let subscriptionIds = [];

    // ✅ If FREE plan → include ALL free subscriptions
    if (priceMonthly === 0) {
      const freeSubs = await prisma.userSubscription.findMany({
        where: {
          userId,
          subscription: { priceMonthly: 0 },
        },
        select: { id: true },
      });

      subscriptionIds = freeSubs.map((sub) => sub.id);
    } else {
      // ✅ Paid plan → only current subscription
      subscriptionIds = [activeSub.id];
    }

    // Fetch folders and files for selected subscription IDs
    const folders = await prisma.folder.findMany({
      where: {
        userSubscriptionId: { in: subscriptionIds },
      },
      include: {
        subfolders: true,
        files: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return success(res, 200, "Active plan folders & files fetched", folders);
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};

// CHECK FILE LIMITS
export const checkFileLimits = async (req, res) => {
  try {
    const userId = req.user.id;
    const { format, sizeMB, folderId } = req.query;

    const activeSub = await prisma.userSubscription.findFirst({
      where: { userId, status: "active" },
      include: { subscription: true },
      orderBy: { startDate: "desc" },
    });

    if (!activeSub) return error(res, 403, "No active subscription");

    const {
      allowedTypes,
      totalFileLimit,
      filesPerFolder,
      maxFileSizeMB,
      priceMonthly,
    } = activeSub.subscription;

    // ✅ Validate type
    if (!allowedTypes.includes(format.toLowerCase()))
      return error(res, 400, `File type "${format}" not allowed`);

    // ✅ Validate size
    if (parseFloat(sizeMB) > maxFileSizeMB)
      return error(res, 400, `File exceeds ${maxFileSizeMB}MB limit`);

    let totalFiles = 0;
    let folderFiles = 0;

    // ✅ FREE plan → check across ALL free subscriptions
    if (priceMonthly === 0) {
      const freeSubs = await prisma.userSubscription.findMany({
        where: {
          userId,
          subscription: { priceMonthly: 0 },
        },
        select: { id: true },
      });

      const freeSubIds = freeSubs.map((sub) => sub.id);

      totalFiles = await prisma.file.count({
        where: {
          userSubscriptionId: { in: freeSubIds },
        },
      });

      folderFiles = await prisma.file.count({
        where: {
          folderId,
          userSubscriptionId: { in: freeSubIds },
        },
      });
    } else {
      // ✅ Paid plan → only current subscription
      totalFiles = await prisma.file.count({
        where: { userSubscriptionId: activeSub.id },
      });

      folderFiles = await prisma.file.count({
        where: {
          folderId,
          userSubscriptionId: activeSub.id,
        },
      });
    }

    // ✅ Total file limit check
    if (totalFiles >= totalFileLimit)
      return error(res, 400, `Total file limit reached`);

    // ✅ Folder file limit check
    if (folderFiles >= filesPerFolder) return error(res, 400, `Folder is full`);

    return success(res, 200, "File allowed", { allowed: true });
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};

// ─── GET ALL ACTIVE SUBSCRIPTION PLANS ─────────────
export const getActiveSubscriptions = async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        isActive: true, // make sure your Subscription model has status field
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return success(
      res,
      200,
      "Active subscriptions fetched successfully",
      subscriptions
    );
  } catch (err) {
    console.error(err);
    return error(res, 500, "Internal server error");
  }
};
