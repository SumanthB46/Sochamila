"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const initAdmin_1 = require("./utils/initAdmin");
dotenv_1.default.config();
const PORT = process.env.PORT
    ? Number(process.env.PORT)
    : 5000;
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
