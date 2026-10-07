import { useState } from "react";

const ChatInput = ({ onSend }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  return (
    <div className="flex p-2 border-t">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập tin nhắn..."
        className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
      />
      <button
        onClick={handleSend}
        className="ml-2 bg-blue-500 text-white px-4 rounded-full"
      >
        Gửi
      </button>
    </div>
  );
};

export default ChatInput;
