"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getAll = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const getAll = () => prisma_1.default.stickerCategory.findMany({
    include: {
        _count: {
            select: { stickers: true },
        },
    },
});
exports.getAll = getAll;
const create = (name) => prisma_1.default.stickerCategory.create({
    data: { name },
    include: {
        _count: {
            select: { stickers: true },
        },
    },
});
exports.create = create;
const update = (id, name) => prisma_1.default.stickerCategory.update({
    where: { id },
    data: { name },
    include: {
        _count: {
            select: { stickers: true },
        },
    },
});
exports.update = update;
const remove = (id) => prisma_1.default.stickerCategory.delete({
    where: { id },
});
exports.remove = remove;
