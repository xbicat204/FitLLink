import express from 'express'
import {
  getMyStudentPackages,
  getMyStudentPackageById
} from '../controllers/studentPackageController.js'
import { authMiddleware } from '../middlewares/authMiddleware.js'

const router = express.Router()

// 📦 Xem danh sách tất cả gói
router.get(
  '/my-packages',
  authMiddleware.authenTokenCookie,
  getMyStudentPackages
)

// 🔍 Xem chi tiết 1 gói cụ thể
router.get(
  '/my-packages/:id',
  authMiddleware.authenTokenCookie,
  getMyStudentPackageById
)

export default router
