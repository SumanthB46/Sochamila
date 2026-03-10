import { Request, Response } from "express";
import prisma from "../../lib/prisma";

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!id) return res.status(400).json({ error: "Missing user id" });

    const data: any = {};
    if (typeof name === "string") data.name = name;
    if (typeof email === "string") data.email = email;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const user = await prisma.user.update({
      where: { id: typeof id === 'string' ? id : '' },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({ success: true, user });
  } catch (error: any) {
    console.error("UPDATE USER ERROR:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(500).json({ error: "Failed to update user" });
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing user id" });

    const user = await prisma.user.findUnique({
      where: { id: typeof id === 'string' ? id : '' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ success: true, user });
  } catch (error) {
    console.error("GET USER ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
}
