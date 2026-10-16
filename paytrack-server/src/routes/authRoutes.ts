
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "../models/User";

const router = Router();

// Registration request validation
const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .max(254, "Email cannot exceed 254 characters")
    .transform((email) => email.toLowerCase()),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long"),
});

// POST /api/auth/register
router.post(
  "/register",
  async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Validate incoming request data.
      const result = registerSchema.safeParse(req.body);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        console.log("Registration validation errors:", errors);

        res.status(400).json({
          success: false,
          message: "Please check your registration details",
          errors,
        });

        return;
      }

      // Use validated and normalized data.
      const { name, email, password } = result.data;

      // 2. Check whether the email is already registered.
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });

        return;
      }

      // 3. Hash the password before saving it.
      const passwordHash = await bcrypt.hash(password, 12);

      // 4. Create the user in MongoDB.
      const user = await User.create({
        name,
        email,
        passwordHash,
      });

      // 5. Return safe user information.
      // Never return the original password or password hash.
      res.status(201).json({
        success: true,
        message: "Account created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        },
      });
    } catch (error: unknown) {
      // Handle duplicate email index errors from MongoDB.
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        res.status(409).json({
          success: false,
          message: "An account with this email already exists",
        });

        return;
      }

      // Log the actual error on the server for debugging.
      console.error("Registration error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to create account at this time",
      });
    }
  }
);

export default router;
