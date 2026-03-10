"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("[APP] Starting app initialization...");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = require("./middlewares/logger");
const errorHandler_1 = require("./middlewares/errorHandler");
const app = (0, express_1.default)();
/* ================================
   REQUEST TRACKING
================================ */
app.use(logger_1.requestIdMiddleware);
app.use(logger_1.httpLogger);
app.use((0, logger_1.performanceWarning)(1000)); // Warn if request takes > 1 second
/* ================================
   CORS
================================ */
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
/* ================================
   BODY PARSERS
================================ */
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
/* ================================
   STATIC FILES
================================ */
const uploadsPath = path_1.default.join(__dirname, "../../uploads");
console.log("[APP] Serving static files from:", uploadsPath);
console.log("[APP] Uploads folder exists:", require("fs").existsSync(uploadsPath));
// TEST ROUTE
app.get("/test-static", (req, res) => {
    res.json({ message: "test endpoint works" });
});
app.use("/uploads", express_1.default.static(uploadsPath, {
    dotfiles: "allow",
    cacheControl: false,
}));
/* ================================
   API ROUTES
================================ */
app.use("/api", routes_1.default);
/* ================================
   ERROR HANDLING (MUST BE LAST)
================================ */
app.use(errorHandler_1.notFoundHandler);
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
