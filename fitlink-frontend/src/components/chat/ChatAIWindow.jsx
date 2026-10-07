// s@/components/chat/ChatAIWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import { SendHorizonal, Bot, User } from "lucide-react";
import { sendAIChat } from "@/services/aiChatService";

const ChatAIWindow = () => {
  // messages ở FE: { role: 'user' | 'assistant', content: '...' }
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Xin chào, mình là trợ lý AI của FitLink. Bạn có thể hỏi về gói tập, tìm PT, booking, thanh toán hoặc cả lịch tập và dinh dưỡng.",
    },
  ]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content || loading) return;

    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setText("");
    setLoading(true);

    try {
      const reply = await sendAIChat(newMessages);
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error("AI chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Xin lỗi, hiện tại mình không trả lời được. Bạn thử lại sau nhé.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col bg-white text-gray-800 w-full h-full rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Trợ lý AI FitLink</h2>
          <p className="text-xs text-gray-500">
            Hỏi mọi thứ về tập luyện, dinh dưỡng, recovery...
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={idx}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div className={`flex max-w-[75%] items-start gap-2`}>
                {!isUser && (
                  <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white">
                    <Bot size={14} />
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${
                    isUser
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                  }`}
                >
                  {msg.content}
                </div>
                {isUser && (
                  <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-white">
                    <User size={14} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" />
            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-150" />
            <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce delay-300" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Đặt câu hỏi cho trợ lý AI..."
            className="flex-1 resize-none bg-gray-100 text-gray-800 placeholder-gray-500 px-4 py-2 rounded-full outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-500 disabled:opacity-60 hover:bg-blue-600 transition text-white rounded-full px-4 py-2 flex items-center justify-center"
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAIWindow;
