"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const initAdmin_1 = require("./utils/initAdmin");
dotenv_1.default.config();
const PORT = process.env.PORT
    ? Number(process.env.PORT)
    : 5000;
/* ======================================================
   STATIC FILES (CRITICAL)
====================================================== */
app_1.default.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
/* ======================================================
   START SERVER
====================================================== */
app_1.default.listen(PORT, "0.0.0.0", async () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
    try {
        await (0, initAdmin_1.initAdmin)();
        console.log("✅ Admin check completed");
    }
    catch (err) {
        console.error("❌ Admin init failed:", err);
    }
});
