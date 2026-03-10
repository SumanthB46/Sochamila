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
    const categories = await CategoryService.getAll();
    res.json(categories);
};
exports.getAll = getAll;
const create = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Category name is required" });
    }
    const category = await CategoryService.create(name);
    res.status(201).json(category);
};
exports.create = create;
const update = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const category = await CategoryService.update(id, name);
    res.json(category);
};
exports.update = update;
const remove = async (req, res) => {
    const { id } = req.params;
    await CategoryService.remove(id);
    res.json({ success: true });
};
exports.remove = remove;
