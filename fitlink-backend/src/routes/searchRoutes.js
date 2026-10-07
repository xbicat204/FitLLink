import express from 'express'
import { getPTsByAvailableSlot, getPTById } from '../controllers/searchController.js'

const router = express.Router()

// ✅ F4.3 + F4.4 – Tìm PT theo slot & sort
router.get('/pts', getPTsByAvailableSlot)

// ✅ Chi tiết 1 PT theo id
router.get('/pts/:id', getPTById)

export default router
