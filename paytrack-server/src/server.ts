
import "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db";
import "dotenv/config";
import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json({ limit: "10kb" }));

app.use("/api/auth", authRoutes);

app.use("/api/transactions", transactionRoutes);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "PayTrack API is running",
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`PayTrack API running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start PayTrack API:", error);
    process.exit(1);
  }
};

void startServer();
