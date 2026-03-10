import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";

export const bootstrapAdmin = async () => {
  const adminExists = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (adminExists) return;

  const hash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD!,
    10
  );

  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL!,
      password: hash,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("✅ Admin account created");
};
