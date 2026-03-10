import { Router } from "express";
import { placeOrder, getOrders } from "./order.controller";

const router = Router();

router.post("/", placeOrder);
router.get("/", getOrders);

export default router;
