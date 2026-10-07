const MessageBubble = ({ message, isMine }) => (
  <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
    <div
      className={`px-3 py-2 rounded-2xl text-sm max-w-xs ${
        isMine ? "bg-blue-500 text-white" : "bg-gray-100"
      }`}
    >
      {message.text}
    </div>
  </div>
);
export default MessageBubble;
