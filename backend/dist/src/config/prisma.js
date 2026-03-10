"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient({
    errorFormat: "pretty",
    log: [
        { emit: "stdout", level: "error" },
        { emit: "stdout", level: "warn" },
    ],
});
// Test connection on startup
exports.prisma.$connect()
    .then(() => {
    console.log("[DB] ✅ Connected to database successfully");
})
    .catch((error) => {
    console.error("[DB] ❌ Database connection failed:", error.message);
    process.exit(1);
});
