import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("[ERROR] JWT_SECRET is not defined in environment variables!");
  throw new Error("JWT_SECRET environment variable is required");
}

export type JwtPayload = {
  id: string;
  role: Role;
};

export const signToken = (payload: JwtPayload) => {
  console.log("[JWT] Signing token with payload:", payload);
  const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: "7d" });
  console.log("[JWT] Token signed successfully");
  return token;
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET as string) as JwtPayload;
};
