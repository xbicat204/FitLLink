// src/controllers/aiController.js
import { StatusCodes } from "http-status-codes";
import { chatWithAI } from "../services/aiService.js";

/**
 * POST /api/ai/chat
 * body: { message: string, history?: [{ role, content }] }
 */
export const chatAI = async (req, res) => {
  try {
    const user = req.user; // được gắn từ authMiddleware.authenTokenCookie
    const { message, history } = req.body || {};

    if (!message || !message.trim()) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Message is required" });
    }

    // Build context cho AI
    const messages = [
      {
        role: "system",
        content:
          "Bạn là trợ lý AI của nền tảng FitLink. " +
          "Bạn vừa hỗ trợ về dịch vụ của FitLink như gói tập, tìm PT, booking, thanh toán, contact; vừa có thể trả lời các câu hỏi cơ bản về tập luyện, dinh dưỡng và phục hồi. " +
          "Hãy trả lời ngắn gọn, thực tế, dễ hiểu cho người dùng Việt Nam, không đề cập đến OpenAI hay mô hình ngôn ngữ.",
      },
    ];

    // nếu FE có gửi history cũ thì nối vào
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg?.role && msg?.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }

    // câu hỏi hiện tại
    messages.push({ role: "user", content: message });

    const aiReply = await chatWithAI(messages);

    return res.status(StatusCodes.OK).json({
      reply: aiReply.content,
    });
  } catch (err) {
    console.error("❌ AI chat error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "AI chat failed",
      error: err.message,
    });
  }
};
