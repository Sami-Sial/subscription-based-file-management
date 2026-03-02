// index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// ─── Import Routes ─────────────────────────
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import stripeRoutes from "./routes/stripe.routes.js";

// STRIPE WEBHOOK
import { stripeWebhook } from "./controllers/stripe.cotrollers.js";
app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// ─── Middleware ───────────────────────────
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/stripe", stripeRoutes);

// ─── Health Check ─────────────────────────
app.get("/", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

// ─── 404 Not Found Handler ─────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ─── Global Error Handler ─────────────────
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
});

// ─── Start Server ─────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
