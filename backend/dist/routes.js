"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const product_routes_1 = __importDefault(require("./modules/products/product.routes"));
const admin_routes_1 = __importDefault(require("./admin/admin.routes"));
const upload_1 = __importDefault(require("./routes/upload"));
const ai_routes_1 = __importDefault(require("./modules/ai/ai.routes"));
const image_tools_1 = __importDefault(require("./routes/image-tools"));
const router = (0, express_1.Router)();
/* ================= API ROUTES ================= */
router.use("/auth", auth_routes_1.default);
router.use("/products", product_routes_1.default);
router.use("/upload", upload_1.default);
router.use("/image", image_tools_1.default);
router.use("/ai", ai_routes_1.default);
router.use("/admin", admin_routes_1.default);
exports.default = router;
