import { prisma } from "../lib/prisma.js";
import { success, error } from "../lib/response.js";

// ─── SUBSCRIBE / CHANGE SUBSCRIPTION ─────────────
export const subscribe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.body;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription) return error(res, 404, "Subscription not found");

    // Find currently active subscription
    const activeSub = await prisma.userSubscription.findFirst({
      where: { userId, status: "active" },
      orderBy: { startDate: "desc" },
    });

    if (activeSub) {
      // End previous subscription
      await prisma.userSubscription.update({
        where: { id: activeSub.id },
        data: {
          status: "expired",
          endDate: new Date(),
        },
      });
    }

    // Create new subscription
    await prisma.userSubscription.create({
      data: {
        userId,
        subscriptionId,
        startDate: new Date(),
        status: "active",
      },
    });

    return success(res, 200, "Subscription updated successfully");
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

    const userSubscription = await prisma.userSubscription.findFirst({
      where: { userId, status: "active" },
      include: { subscription: true },
    });
    if (!userSubscription) return error(res, 403, "No active subscription");

    const { maxFolders, maxNesting } = userSubscription.subscription;

    const totalFolders = await prisma.folder.count({ where: { userId } });
    if (totalFolders >= maxFolders)
      return error(res, 400, "Folder limit reached");

    let level = 0;
    if (parentId) {
      const parent = await prisma.folder.findUnique({
        where: { id: parentId },
      });
      if (!parent) return error(res, 404, "Parent folder not found");
      level = parent.level + 1;
      if (level >= maxNesting)
        return error(res, 400, "Max nesting level reached");
    }

    const folder = await prisma.folder.create({
      data: { name, parentId, userId, level },
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

// ─── CREATE FILE ─────────────
export const uploadFile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId, name, url, publicId, format, sizeMB } = req.body;

    const userSubscription = await prisma.userSubscription.findFirst({
      where: { userId, status: "active" },
      include: { subscription: true },
    });
    if (!userSubscription) return error(res, 403, "No active subscription");

    const { allowedTypes, totalFileLimit, filesPerFolder, maxFileSizeMB } =
      userSubscription.subscription;

    if (!allowedTypes.includes(format.toLowerCase()))
      return error(res, 400, "File type not allowed");
    if (sizeMB > maxFileSizeMB)
      return error(res, 400, "File size exceeds limit");

    const totalFiles = await prisma.file.count({ where: { userId } });
    if (totalFiles >= totalFileLimit)
      return error(res, 400, "Total file limit reached");

    const folderFiles = await prisma.file.count({ where: { folderId } });
    if (folderFiles >= filesPerFolder)
      return error(res, 400, "Folder file limit reached");

    const file = await prisma.file.create({
      data: { name, url, publicId, format, sizeMB, folderId, userId },
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

// ─── GET USER FOLDERS & FILES ─────────────
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

export const checkFileLimits = async (req, res) => {
  const userId = req.user.id;
  const { format, sizeMB, folderId } = req.query;

  const userSubscription = await prisma.userSubscription.findFirst({
    where: { userId, status: "active" },
    include: { subscription: true },
  });
  if (!userSubscription) return error(res, 403, "No active subscription");

  const { allowedTypes, totalFileLimit, filesPerFolder, maxFileSizeMB } =
    userSubscription.subscription;

  if (!allowedTypes.includes(format.toLowerCase()))
    return error(res, 400, `File type "${format}" is not allowed on your plan`);
  if (parseFloat(sizeMB) > maxFileSizeMB)
    return error(res, 400, `File exceeds your ${maxFileSizeMB}MB limit`);

  const totalFiles = await prisma.file.count({ where: { userId } });
  if (totalFiles >= totalFileLimit)
    return error(res, 400, `Total file limit reached (${totalFileLimit} max)`);

  const folderFiles = await prisma.file.count({ where: { folderId } });
  if (folderFiles >= filesPerFolder)
    return error(res, 400, `Folder is full (${filesPerFolder} files max)`);

  return success(res, 200, "File allowed", { allowed: true });
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
