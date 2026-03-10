import { Router } from "express";
import { updateUser, getUser } from "./user.controller";

const router = Router();

// GET /api/users/:id
router.get("/:id", getUser);

// PUT /api/users/:id
router.put("/:id", updateUser);

export default router;
