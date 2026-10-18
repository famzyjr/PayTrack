
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

function createToken(userId: string): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return jwt.sign({}, secret, {
    subject: userId,
    expiresIn: "1d",
  });
}

// POST /api/auth/register
export async function register(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
      return;
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 100) {
      res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters.",
      });
      return;
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
      return;
    }

    if (password.length < 8 || password.length > 128) {
      res.status(400).json({
        success: false,
        message: "Password must be between 8 and 128 characters.",
      });
      return;
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      passwordHash,
    });

    const token = createToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    // A unique MongoDB index can reject simultaneous duplicate registrations.
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
      message: "Could not create your account. Please try again.",
    });
  }
}

// POST /api/auth/login
export async function login(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
      return;
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+passwordHash");

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
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Could not log in. Please try again.",
    });
  }
}

export async function getMe(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User account not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    console.error("Get current user error:", error);

    res.status(500).json({
      success: false,
      message: "Could not retrieve your account.",
    });
  }
}
