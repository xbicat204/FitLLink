import { useEffect, useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { messageApi } from "@/api/messageApi";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

const ChatBox = ({ chatId, currentUser }) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!chatId || !socket) return;

    messageApi.getMessages(chatId).then(setMessages).catch((error) => {
      console.error("Failed to load messages:", error);
      setMessages([]);
    });

    socket.emit("joinRoom", chatId);

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.emit("leaveRoom", chatId);
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [chatId, socket]);

  const handleSend = async (text) => {
    if (!text?.trim() || !socket || !currentUser?._id) return;

    socket.emit("sendMessage", {
      room: chatId,
      sender: currentUser._id,
      text: text.trim(),
    });
  };

  return (
    <div className="flex flex-col h-full border rounded-lg bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id || `${msg.sender}-${msg.createdAt}-${msg.text}`}
            message={msg}
            isMine={String(msg.sender?._id || msg.sender) === String(currentUser._id)}
          />
        ))}
      </div>
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default ChatBox;
