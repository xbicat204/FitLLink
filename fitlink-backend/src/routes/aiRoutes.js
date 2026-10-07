// src/routes/aiRoutes.js
import express from "express";
import { chatAI } from "../controllers/aiController.js";

const router = express.Router();

// Public AI chat: dùng được cả khi chưa đăng nhập
router.post("/chat", chatAI);

export default router;
