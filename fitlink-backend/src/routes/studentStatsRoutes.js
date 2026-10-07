import express from "express";
import { studentStatsController } from "../controllers/studentStatsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  authMiddleware.authenTokenCookie,
  studentStatsController.getDashboard
);

router.get(
  "/payment",
  authMiddleware.authenTokenCookie,
  studentStatsController.getPaymentHistory
);

router.get(
  "/sessions-completed",
  authMiddleware.authenTokenCookie,
  studentStatsController.getCompletedSessionsByYear
);

router.get(
  "/progress",
  authMiddleware.authenTokenCookie,
  studentStatsController.getProgressByYear
);

router.get(
  "/history",
  authMiddleware.authenTokenCookie,
  studentStatsController.getSessionHistory
);

export default router;
