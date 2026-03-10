import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function initAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.log("⚠️ ADMIN env not set — skipping admin init");
      return;
    }

    const exists = await prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      console.log("✅ Admin already exists");
      return;
    }

    const hash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "Super Admin",
        email,
        password: hash,
        role: Role.ADMIN,
        isActive: true,
      },
    });

    console.log("✅ Admin created successfully");
  } catch (err) {
    console.error("❌ initAdmin error:", err);
  }
}
