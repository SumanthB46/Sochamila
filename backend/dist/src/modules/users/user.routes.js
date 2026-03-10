"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
// GET /api/users/:id
router.get("/:id", user_controller_1.getUser);
// PUT /api/users/:id
router.put("/:id", user_controller_1.updateUser);
exports.default = router;
