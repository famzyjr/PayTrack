
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import User from "../models/User";
import authenticateToken from "../middleware/authMiddleware";

const router = Router();

const authSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(72),
});

// REGISTER
router.post(
  "/register",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = authSchema.extend({
        name: z.string().trim().min(2).max(100),
      }).safeParse(req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: "Invalid registration details",
          errors: result.error.issues,
        });
        return;
      }

      const { name, email, password } = result.data;

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash });

      res.status(201).json({
        success: true,
        message: "Registration successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: unknown) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Unable to register",
      });
    }
  }
);

// LOGIN — public route; no authentication middleware here
router.post(
  "/login",
  async (req: Request, res: Response): Promise<void> => {
    try {
      const result = authSchema
        .omit({ name: true })
        .safeParse(req.body);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: "Please provide a valid email and password",
        });
        return;
      }

      const { email, password } = result.data;

      const user = await User.findOne({ email }).select("+passwordHash");

      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        res.status(500).json({
          success: false,
          message: "Authentication is not configured",
        });
        return;
      }

      const token = jwt.sign(
        { sub: user._id.toString() },
        jwtSecret,
        { expiresIn: "1h" }
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: unknown) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Unable to log in",
      });
    }
  }
);

// CURRENT USER — protected route
router.get(
  "/me",
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const user = await User.findById(req.userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error: unknown) {
      console.error("Fetch user error:", error);
      res.status(500).json({
        success: false,
        message: "Unable to fetch user",
      });
    }
  }
);

export default router;
