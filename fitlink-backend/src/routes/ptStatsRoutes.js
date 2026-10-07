import express from "express";
import { ptStatsController } from "../controllers/ptStatsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✔ Dùng middleware đúng function, không dùng object
router.get(
  "/revenue",
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptStatsController.getRevenueByYear
);

router.get(
  "/users",
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptStatsController.getStudentsByYear
);
router.get("/sessions-completed", authMiddleware.authenTokenCookie, authMiddleware.isPT, ptStatsController.getCompletedSessionsByYear);
router.get("/cancel-rate", authMiddleware.authenTokenCookie, authMiddleware.isPT, ptStatsController.getCancelRateByYear);
router.get(
  "/rating",
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptStatsController.getPTRatingStats
);
export default router;
