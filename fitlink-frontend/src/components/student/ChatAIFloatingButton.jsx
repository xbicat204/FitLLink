import { useState } from "react";
import { FaRobot, FaTimes } from "react-icons/fa";
import ChatAIWindow from "@/components/chat/ChatAIWindow"; // ✅ dùng lại component sẵn có

export default function ChatAIFloatingButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 🔘 Nút mở chat */}
      <button
        onClick={() => setOpen(true)}
        className="
          fixed bottom-6 right-6
          bg-gradient-to-r from-blue-500 to-indigo-600
          hover:from-blue-600 hover:to-indigo-700
          text-white p-4 rounded-full shadow-lg
          flex items-center justify-center
          transition-all duration-300 hover:scale-110
          z-50
        "
        title="Chat với AI"
      >
        <FaRobot className="text-2xl" />
      </button>

      {/* 💬 Popup chat */}
      {open && (
        <div
          className="
            fixed bottom-24 right-6
            w-[380px] h-[480px]
            bg-white border border-gray-300 rounded-2xl shadow-2xl
            z-[9999] flex flex-col overflow-hidden
            animate-fadeIn
          "
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 flex justify-between items-center">
            <h2 className="font-semibold">AI Assistant</h2>
            <button onClick={() => setOpen(false)} className="hover:text-gray-200">
              <FaTimes />
            </button>
          </div>

          {/* Nội dung chat */}
          <div className="flex-1 overflow-y-auto p-2 bg-gray-50">
            <ChatAIWindow />
          </div>
        </div>
      )}
    </>
  );
}
