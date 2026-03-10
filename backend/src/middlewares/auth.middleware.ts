import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

interface JwtPayload {
  id: string;
  role: string;
  email?: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      console.log("[AUTH] No Bearer token found in headers");
      return res.status(401).json({ 
        success: false,
        statusCode: 401,
        message: "Unauthorized - No token provided" 
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    console.log("[AUTH] Token decoded:", {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
    });

    // ✅ validate role safely
    if (!Object.values(Role).includes(decoded.role as Role)) {
      console.log("[AUTH] Invalid role in token:", decoded.role);
      return res.status(401).json({ 
        success: false,
        statusCode: 401,
        message: "Invalid role in token" 
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role as Role, // ✅ FIX
      email: decoded.email,
    };

    console.log("[AUTH] User authenticated:", req.user);
    next();
  } catch (error: any) {
    console.error("[AUTH] Authentication error:", error.message);
    return res.status(401).json({ 
      success: false,
      statusCode: 401,
      message: "Invalid or expired token",
      error: error.message 
    });
  }
};
