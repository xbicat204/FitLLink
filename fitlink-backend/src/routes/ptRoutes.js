import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { ptController } from '~/controllers/ptController'
import {
  ptApproveRequest,
  ptRejectRequest,
  ptGetRequests
} from '~/controllers/ptController'
const router = express.Router()

router.get('/me/verification-status', authMiddleware.authenTokenCookie, authMiddleware.isPT, ptController.isPTVerified);

// ✅ Lấy danh sách học viên của PT (đang đăng nhập)
router.get("/me/students", authMiddleware.authenTokenCookie, authMiddleware.isPT, ptController.getMyStudents);

router.get(
  "/me/packages",
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptController.getMyPackages
);
router.get("/requests", authMiddleware.authenTokenCookie, authMiddleware.isPT, ptGetRequests);
router.post("/approve", authMiddleware.authenTokenCookie, authMiddleware.isPT, ptApproveRequest);
router.post("/reject", authMiddleware.authenTokenCookie, authMiddleware.isPT, ptRejectRequest);
router.put(
  "/sessions/:id",
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptController.updateSessionTimeByPT
);

router.get(
  '/me/dashboard',
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptController.getDashboardStats
);
export default router
