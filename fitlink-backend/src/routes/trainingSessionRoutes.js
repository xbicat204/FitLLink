import express from 'express'
import { getTrainingSessions } from '../controllers/trainingSessionController.js'

const router = express.Router()

// Gộp 3 loại lịch vào 1 endpoint
router.get('/', getTrainingSessions)

export default router
