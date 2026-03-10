import { Request, Response, NextFunction } from "express";

export function aiAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.headers["x-ai-key"];

  if (!key || key !== process.env.AI_SECRET_KEY) {
    return res.status(401).json({ message: "Invalid AI key" });
  }

  next();
}
