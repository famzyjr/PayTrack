
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Get the token from the request headers.
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : undefined;

  // 2. Reject requests without a token.
  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
    return;
  }

  // 3. Get the JWT secret from the environment variables.
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    res.status(500).json({
      success: false,
      message: "Authentication is not configured",
    });
    return;
  }

  try {
    // 4. Verify that the token is valid and hasn't expired.
   const decoded = jwt.verify(token, jwtSecret, {
  algorithms: ["HS256"],
});
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

    // 5. Attach the authenticated user's ID to the request.
    req.userId = decoded.sub;

    // 6. Allow the request to continue.
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

export default authenticateToken;
