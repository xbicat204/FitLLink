import express from "express";
import { adminStatsController } from "../controllers/adminStatsController.js";

const router = express.Router();

router.get("/revenue", adminStatsController.getRevenueByYear);
router.get("/users", adminStatsController.getUsersByYear);
router.get("/booking-trends", adminStatsController.getBookingTrends);
router.get("/top-pt", adminStatsController.getTopPT);


export default router;
