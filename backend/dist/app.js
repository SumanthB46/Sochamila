"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
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
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
/* ================================
   STATIC FILES (FIXED ✅)
================================ */
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
/* ================================
   API ROUTES
================================ */
app.use("/api", routes_1.default);
exports.default = app;
