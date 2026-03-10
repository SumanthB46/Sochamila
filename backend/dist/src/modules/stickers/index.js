"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRoutes = exports.stickerRoutes = void 0;
const sticker_routes_1 = __importDefault(require("./sticker.routes"));
exports.stickerRoutes = sticker_routes_1.default;
const category_routes_1 = __importDefault(require("./category.routes"));
exports.categoryRoutes = category_routes_1.default;
