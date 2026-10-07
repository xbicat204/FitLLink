import express from 'express'
import * as sessionController from '../controllers/sessionController.js'
import { protect } from '../middlewares/authMiddleware.js'


const router = express.Router()
router.get('/pt', protect, sessionController.getSessionsByPT)
// dùng sessionController.updateSessionStatus để chắc chắn callback tồn tại
router.put('/:id/status', protect, sessionController.updateSessionStatus)
// routes/sessionRoutes.js


export default router
