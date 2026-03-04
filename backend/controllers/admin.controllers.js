import { prisma } from "../lib/prisma.js";
import { success, error } from "../lib/response.js";

/* ========================= CREATE SUBSCRIPTION ========================= */
export const createSubscription = async (req, res, next) => {
  try {
    const {
      name,
      maxFolders,
      maxNesting,
      allowedTypes,
      maxFileSizeMB,
      totalFileLimit,
      filesPerFolder,
      isActive,
      priceMonthly,
    } = req.body;

    const subscription = await prisma.subscription.create({
      data: {
        name,
        maxFolders,
        maxNesting,
        allowedTypes,
        maxFileSizeMB,
        totalFileLimit,
        filesPerFolder,
        isActive,
        priceMonthly,
      },
    });

    return success(res, 201, "Subscription created successfully", subscription);
  } catch (err) {
    next(err);
  }
};

/* ========================= GET ALL SUBSCRIPTIONS ========================= */
export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
    });

    return success(res, 200, "Subscriptions fetched successfully", {
      count: subscriptions.length,
      subscriptions,
    });
  } catch (err) {
    next(err);
  }
};

/* ========================= GET SINGLE SUBSCRIPTION ========================= */
export const getSubscriptionById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscription) {
      return error(res, 404, "Subscription not found");
    }

    return success(res, 200, "Subscription fetched successfully", subscription);
  } catch (err) {
    next(err);
  }
};

/* ========================= UPDATE SUBSCRIPTION ========================= */
export const updateSubscription = async (req, res, next) => {
  try {
    const id = req.params.id;
    // Check existence first (important for clean 404)
    const existing = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existing) {
      return error(res, 404, "Subscription not found");
    }

    const subscription = await prisma.subscription.update({
      where: { id },
      data: req.body,
    });

    return success(res, 200, "Subscription updated successfully", subscription);
  } catch (err) {
    next(err);
  }
};

/* ========================= DELETE SUBSCRIPTION ========================= */
export const deleteSubscription = async (req, res, next) => {
  try {
    const id = req.params.id;

    const existing = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!existing) {
      return error(res, 404, "Subscription not found");
    }

    await prisma.subscription.delete({
      where: { id },
    });

    return success(res, 200, "Subscription deleted successfully");
  } catch (err) {
    next(err);
  }
};

/* ========================= GET ALL USERS ========================= */
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return success(res, 200, "Users fetched successfully", {
      count: users.length,
      users,
    });
  } catch (err) {
    next(err);
  }
};

/* ========================= DELETE USER BY ID ========================= */
export const deleteUserById = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return error(res, 404, "User not found");
    }

    // Delete the user
    await prisma.user.delete({
      where: { id },
    });

    return success(res, 200, "User deleted successfully");
  } catch (err) {
    next(err);
  }
};

/* ========================= ADMIN DASHBOARD STATS ========================= */

export const getAdminStats = async (req, res, next) => {
  try {
    // ── Counts ──────────────────────────────────────────────────────────────
    const [
      totalUsers,
      totalSubscriptions,
      totalFolders,
      totalFiles,
      activeUserSubs,
      allUserSubs,
      recentUsers,
      recentUserSubs,
      filesByFormat,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Total subscription plans
      prisma.subscription.count(),

      // Total folders across all users
      prisma.folder.count(),

      // Total files across all users
      prisma.file.count(),

      // Active user subscriptions (for revenue + plan breakdown)
      prisma.userSubscription.findMany({
        where: { status: "active" },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          subscription: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { startDate: "desc" },
      }),

      // All user subscriptions ever (for revenue calculation)
      prisma.userSubscription.findMany({
        include: { subscription: true },
      }),

      // Latest 8 users registered
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          UserSubscription: {
            // ✅ FIXED: was `subscriptions`, must match Prisma schema relation name
            where: { status: "active" },
            select: {
              id: true,
              startDate: true,
              subscription: true,
            },
            take: 1,
          },
        },
      }),

      // Latest 8 subscription activations
      prisma.userSubscription.findMany({
        orderBy: { startDate: "desc" },
        take: 8,
        select: {
          id: true,
          startDate: true,
          endDate: true,
          status: true,
          user: { select: { id: true, name: true, email: true } },
          subscription: true,
        },
      }),

      // Files grouped by format
      prisma.file.groupBy({
        by: ["format"],
        _count: { format: true },
        _sum: { sizeMB: true },
      }),
    ]);

    // ── Revenue ─────────────────────────────────────────────────────────────
    // Monthly Recurring Revenue (MRR) from active subscriptions
    const mrr = activeUserSubs.reduce((sum, s) => {
      return sum + (parseFloat(s.subscription?.priceMonthly) || 0);
    }, 0);

    // Total revenue calculation - sum of all subscription payments
    // Note: This calculates based on subscription duration
    const totalRevenue = allUserSubs.reduce((sum, s) => {
      const price = parseFloat(s.subscription?.priceMonthly) || 0;

      // Calculate months active
      const start = new Date(s.startDate);
      const end = s.endDate ? new Date(s.endDate) : new Date();
      const monthsActive = Math.max(
        1,
        Math.floor((end - start) / (1000 * 60 * 60 * 24 * 30))
      );

      return sum + price * monthsActive;
    }, 0);

    // ── Plan Distribution ────────────────────────────────────────────────────
    const planDist = {};
    for (const s of activeUserSubs) {
      const name = s.subscription?.name || "Unknown";
      planDist[name] = (planDist[name] || 0) + 1;
    }
    const planDistribution = Object.entries(planDist).map(([name, count]) => ({
      name,
      count,
    }));

    // ── File format summary ──────────────────────────────────────────────────
    const formatSummary = filesByFormat.map((f) => ({
      format: f.format,
      count: f._count.format,
      sizeMB: parseFloat((f._sum.sizeMB || 0).toFixed(2)),
    }));

    // ── Users registered per day (last 7 days) ───────────────────────────────
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentUsersAll = await prisma.user.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true },
    });

    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dayMap[d.toISOString().slice(0, 10)] = 0;
    }
    for (const u of recentUsersAll) {
      const key = new Date(u.createdAt).toISOString().slice(0, 10);
      if (dayMap[key] !== undefined) dayMap[key]++;
    }
    const userGrowth = Object.entries(dayMap).map(([date, count]) => ({
      day: new Date(date).toLocaleDateString("en", { weekday: "short" }),
      date,
      users: count,
    }));

    // ── Revenue per day (last 7 days based on subscription start) ────────────
    const recentSubsAll = await prisma.userSubscription.findMany({
      where: { startDate: { gte: sevenDaysAgo } },
      select: {
        startDate: true,
        subscription: { select: { priceMonthly: true } },
      },
    });

    const revMap = {};
    for (const key of Object.keys(dayMap)) revMap[key] = 0;
    for (const s of recentSubsAll) {
      const key = new Date(s.startDate).toISOString().slice(0, 10);
      if (revMap[key] !== undefined) {
        revMap[key] += parseFloat(s.subscription?.priceMonthly || 0);
      }
    }
    const revenueGrowth = Object.entries(revMap).map(([date, revenue]) => ({
      day: new Date(date).toLocaleDateString("en", { weekday: "short" }),
      date,
      revenue: parseFloat(revenue.toFixed(2)),
    }));

    return success(res, 200, "Admin stats fetched", {
      // Counts
      totalUsers,
      totalSubscriptions,
      totalFolders,
      totalFiles,
      activeSubscribersCount: activeUserSubs.length,

      // Revenue
      mrr: parseFloat(mrr.toFixed(2)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),

      // Distributions
      planDistribution,
      formatSummary,

      // Growth charts
      userGrowth,
      revenueGrowth,

      // Recent lists
      recentUsers,
      recentUserSubs,
    });
  } catch (err) {
    next(err);
  }
};
