"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getAll = void 0;
const CategoryService = __importStar(require("./category.service"));
const getAll = async (_req, res) => {
    try {
        const categories = await CategoryService.getAll();
        res.json(categories);
    }
    catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ message: "Failed to get categories" });
    }
};
exports.getAll = getAll;
const create = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }
        const category = await CategoryService.create(name);
        res.status(201).json(category);
    }
    catch (error) {
        console.error("Create category error:", error);
        res.status(500).json({ message: "Failed to create category" });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { name } = req.body;
        const category = await CategoryService.update(id, name);
        res.json(category);
    }
    catch (error) {
        console.error("Update category error:", error);
        res.status(500).json({ message: "Failed to update category" });
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await CategoryService.remove(id);
        res.json({ success: true });
    }
    catch (error) {
        console.error("Delete category error:", error);
        res.status(500).json({ message: "Failed to delete category" });
    }
};
exports.remove = remove;
