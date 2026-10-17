
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  // Check whether the request contains a Bearer token.
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
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

  try {
    const decoded = jwt.verify(token, jwtSecret);

    // Ensure the token contains the user's ID.
    if (
      typeof decoded === "string" ||
      typeof decoded.sub !== "string"
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    // Attach the authenticated user's ID to the request.
    req.userId = decoded.sub;

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

export default authenticateToken;
