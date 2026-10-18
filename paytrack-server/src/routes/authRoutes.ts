
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import User from "../models/User";
import authenticateToken from "../middleware/authMiddleware";

const router = Router();

// Validation schemas
const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254).transform((email) =>
    email.toLowerCase()
  ),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) =>
    email.toLowerCase()
  ),
  password: z.string().min(8).max(72),
});

// Generate a JWT containing the user's ID in the "sub" claim.
function createToken(userId: string): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign(
    { sub: userId },
    jwtSecret,
    { expiresIn: "1h" },
  );
}

// A consistent public user response.
// Never return passwordHash to the frontend.
function formatUser(user: {
  _id: { toString(): string };
  name: string;
  email: string;
}) {
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

// REGISTER
// POST /api/auth/register
router.post(
  "/register",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = registerSchema.safeParse(req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: "Invalid registration details.",
          errors: result.error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }

      const { name, email, password } = result.data;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
        return;
      }

      // Hash the password before storing it.
      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.create({
        name,
        email,
        passwordHash,
      });

      const token = createToken(user._id.toString());

      res.status(201).json({
        success: true,
        message: "Registration successful.",
        token,
        user: formatUser(user),
      });
    } catch (error: unknown) {
      // Handle duplicate emails, including concurrent registrations.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
        return;
      }

      console.error("Registration error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to register. Please try again.",
      });
    }
  },
);

// LOGIN
// POST /api/auth/login
router.post(
  "/login",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = loginSchema.safeParse(req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: "Please provide a valid email and password.",
        });
        return;
      }

      const { email, password } = result.data;

      // passwordHash is excluded by default in the User model,
      // so explicitly select it for password verification.
      const user = await User.findOne({ email }).select("+passwordHash");

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
        return;
      }

      const passwordMatches = await bcrypt.compare(
        password,
        user.passwordHash,
      );

      if (!passwordMatches) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
        return;
      }

      const token = createToken(user._id.toString());

      res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        user: formatUser(user),
      });
    } catch (error: unknown) {
      console.error("Login error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to log in. Please try again.",
      });
    }
  },
);

// CURRENT USER
// GET /api/auth/me
router.get(
  "/me",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      const user = await User.findById(req.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: formatUser(user),
      });
    } catch (error: unknown) {
      console.error("Fetch current user error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to fetch your account.",
      });
    }
  },
);

export default router;
