"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_routes_1 = __importDefault(require("../admin/admin.routes"));
const product_routes_1 = __importDefault(require("../modules/products/product.routes"));
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const graphics_routes_1 = __importDefault(require("../modules/graphics/graphics.routes"));
const sticker_routes_1 = __importDefault(require("../modules/stickers/sticker.routes"));
const category_routes_1 = __importDefault(require("../modules/stickers/category.routes"));
const vendor_routes_1 = __importDefault(require("../modules/vendor/vendor.routes"));
const customer_routes_1 = __importDefault(require("../modules/customer/customer.routes"));
const user_routes_1 = __importDefault(require("../modules/users/user.routes"));
const order_routes_1 = __importDefault(require("../modules/orders/order.routes"));
const imagekit_auth_1 = __importDefault(require("./imagekit-auth"));
const upload_1 = __importDefault(require("./upload"));
const wishlist_routes_1 = __importDefault(require("../modules/wishlist/wishlist.routes"));
const ai_routes_1 = __importDefault(require("../modules/ai/ai.routes"));
const jersey_routes_1 = __importDefault(require("../modules/jersey/jersey.routes"));
console.log("[ROUTES-INDEX] Starting route initialization...");
console.log("[ROUTES-INDEX] vendorRoutes import successful:", vendor_routes_1.default);
const router = (0, express_1.Router)();
console.log("[ROUTES-INDEX] Mounting AI routes...");
router.use("/ai", ai_routes_1.default);
console.log("[ROUTES-INDEX] Mounting authentication routes...");
router.use("/auth", auth_routes_1.default);
console.log("[ROUTES-INDEX] Mounting admin routes...");
router.use("/admin", admin_routes_1.default);
console.log("[ROUTES-INDEX] Mounting product routes...");
router.use("/products", product_routes_1.default); // PUBLIC PRODUCTS
console.log("[ROUTES-INDEX] Mounting graphics routes...");
router.use("/graphics", graphics_routes_1.default);
console.log("[ROUTES-INDEX] Mounting AI routes...");
router.use("/ai", ai_routes_1.default);
console.log("[ROUTES-INDEX] Mounting jersey routes...");
router.use("/jersey", jersey_routes_1.default);
console.log("[ROUTES-INDEX] Mounting sticker routes...");
router.use("/stickers", sticker_routes_1.default);
router.use("/sticker-categories", category_routes_1.default);
console.log("[ROUTES-INDEX] Mounting vendor routes...");
router.use("/vendor", vendor_routes_1.default);
// Add a catch-all middleware for vendor requests to see if they're hitting this
router.use((req, res, next) => {
    if (req.path.includes("vendor")) {
        console.log("[ROUTES-INDEX] Caught vendor request:", {
            path: req.path,
            method: req.method,
            originalUrl: req.originalUrl,
        });
    }
    next();
});
console.log("[ROUTES-INDEX] Mounting customer routes...");
router.use("/customer", customer_routes_1.default);
console.log("[ROUTES-INDEX] Mounting user routes...");
router.use("/users", user_routes_1.default);
console.log("[ROUTES-INDEX] Mounting order routes...");
router.use("/orders", order_routes_1.default);
console.log("[ROUTES-INDEX] Mounting ImageKit auth routes...");
router.use("/imagekit-auth", imagekit_auth_1.default);
console.log("[ROUTES-INDEX] Mounting upload routes...");
router.use("/uploads", upload_1.default);
console.log("[ROUTES-INDEX] Mounting wishlist routes...");
router.use("/wishlist", wishlist_routes_1.default);
// Debug middleware to log all requests
router.use((req, res, next) => {
    console.log("[ROUTES-DEBUG] Incoming request:", {
        method: req.method,
        path: req.path,
        url: req.originalUrl,
        query: req.query,
    });
    next();
});
console.log("[ROUTES-INDEX] All routes mounted successfully!");
exports.default = router;
