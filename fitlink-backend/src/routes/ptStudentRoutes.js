// src/routes/ptStudentRoutes.js
import express from 'express'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { ptStudentController } from '~/controllers/ptStudentController'

const router = express.Router()

// PT xem danh sách học viên của mình, lọc theo packageId / status
router.get(
  '/students',
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptStudentController.listMyStudents
)

// Lấy danh sách session của 1 StudentPackage (cả PT & Student đều có thể xem)
router.get(
  '/students/:studentPackageId/sessions',
  authMiddleware.authenTokenCookie,
  ptStudentController.listSessionsByStudentPackage
)

// Tạo 1 session cho 1 StudentPackage (PT)
router.post(
  '/students/:studentPackageId/sessions',
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptStudentController.createSessionForStudentPackage
)

export default router
