"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = void 0;
const admin_service_1 = require("./admin.service");
const getAdminStats = async (_req, res) => {
    try {
        const stats = await (0, admin_service_1.getAdminStatsService)();
        return res.json(stats);
    }
    catch (error) {
        console.error("ADMIN STATS ERROR:", error);
        return res.status(500).json({
            message: "Failed to load admin stats",
        });
    }
};
exports.getAdminStats = getAdminStats;
