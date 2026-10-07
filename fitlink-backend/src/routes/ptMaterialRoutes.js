// src/routes/ptMaterialRoutes.js
import express from 'express'
import multer from 'multer'
import fs from 'fs'
import path from 'path'

import { authMiddleware } from '~/middlewares/authMiddleware'
import { ptMaterialController } from '~/controllers/ptMaterialController'

const router = express.Router()

/* ------------ Multer config để lưu file uploads/materials ------------ */

const uploadDir = 'uploads/materials'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const name = `${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`
    cb(null, name)
  }
})

const upload = multer({ storage })

/* --------------------------- ROUTES --------------------------- */
/**
 * Tất cả đều bắt đầu bằng /materials ...
 * vì ở server.js ta sẽ mount: app.use("/api/pt", ptMaterialRoutes)
 */

// POST /api/pt/materials/upload
router.post(
  '/materials/upload',
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  upload.single('file'),
  ptMaterialController.uploadFile
)

// GET /api/pt/materials
router.get(
  '/materials',
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptMaterialController.getMyMaterials
)

// POST /api/pt/materials
router.post(
  '/materials',
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptMaterialController.createMaterial
)

// PUT /api/pt/materials/:id
router.put(
  '/materials/:id',
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptMaterialController.updateMaterial
)

// DELETE /api/pt/materials/:id
router.delete(
  '/materials/:id',
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptMaterialController.deleteMaterial
)

// POST /api/pt/materials/:id/share
router.post(
  '/materials/:id/share',
  authMiddleware.authenTokenCookie,
  authMiddleware.isPT,
  ptMaterialController.shareMaterial
)

export default router
