// s@/services/aiChatService.js
import axiosClient from "@/api/axiosClient";

/**
 * frontendMessages: mảng [{ role: 'user' | 'assistant', content: '...' }]
 * Trả về: { role: 'assistant', content: '...' }
 */
export const sendAIChat = async (frontendMessages) => {
  if (!Array.isArray(frontendMessages) || frontendMessages.length === 0) {
    throw new Error("No messages to send");
  }

  // Tin nhắn cuối cùng là câu hỏi hiện tại của user
  const last = frontendMessages[frontendMessages.length - 1];
  const history = frontendMessages.slice(0, -1); // phần còn lại làm history

  const res = await axiosClient.post(
    "/ai/chat",
    {
      message: last.content,
      history, // [{ role, content }]
    },
    {
      skipErrorToast: true,
    }
  );

  // Backend trả về { reply: '...' }
  return {
    role: "assistant",
    content: res.data.reply,
  };
};
