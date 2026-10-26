
import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Render runs behind a proxy. Trust one proxy hop in production.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Security-related HTTP headers.
app.use(helmet());

// Only allow browser requests from approved frontend origins.
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,https://paytrack-three-phi.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Limit incoming JSON request bodies.
app.use(express.json({ limit: "10kb" }));

// General API rate limit.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// Stricter limit for login and registration endpoints.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/transactions", transactionRoutes);

// Database-aware health check.
app.get("/api/health", (_req, res) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;

  if (!isDatabaseConnected) {
    res.status(503).json({
      success: false,
      message: "Service temporarily unavailable",
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: "PayTrack API is healthy",
    database: "connected",
  });
});

// Start only after the database connection succeeds.
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`PayTrack API running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start PayTrack API:", error);
    process.exit(1);
  }
};

void startServer();
