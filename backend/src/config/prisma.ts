import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  errorFormat: "pretty",
  log: [
    { emit: "stdout", level: "error" },
    { emit: "stdout", level: "warn" },
  ],
});

// Test connection on startup
prisma.$connect()
  .then(() => {
    console.log("[DB] ✅ Connected to database successfully");
  })
  .catch((error) => {
    console.error("[DB] ❌ Database connection failed:", error.message);
    process.exit(1);
  });
