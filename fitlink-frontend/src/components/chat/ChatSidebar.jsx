import React from "react";
import { MessageSquare } from "lucide-react";

const ChatSidebar = ({ list, activeId, onSelect, role }) => {
  return (
    <div className="w-80 h-full border-r bg-[#0F172A] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-700">
        <MessageSquare className="text-blue-400" size={20} />
        <h2 className="font-semibold text-lg">Tin nhắn</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {list.length === 0 ? (
          <p className="p-4 text-gray-400 text-sm">
            {role === "pt"
              ? "Chưa có học viên nào nhắn tin."
              : "Chưa có huấn luyện viên nào."}
          </p>
        ) : (
          list.map((item) => {
            const isActive = activeId === item._id;
            const hasUnread = item.unreadCount > 0;
            const lastMessage = item.lastMessage || "Chưa có tin nhắn";
            const displayMessage =
              item.lastMessageSender === (role === "pt" ? "pt" : "student")
                ? `Bạn: ${lastMessage}`
                : lastMessage;

            return (
              <div
                key={item._id}
                onClick={() => onSelect(item)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500/20 border-l-4 border-blue-400"
                    : "hover:bg-blue-950/30"
                }`}
              >
                <img
                  src={item.avatar || "/default-avatar.png"}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-600"
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`truncate font-medium ${
                      hasUnread ? "text-white" : "text-gray-300"
                    }`}
                  >
                    {item.name}
                  </p>
                  <p
                    className={`truncate text-xs ${
                      hasUnread ? "text-blue-300 font-medium" : "text-gray-400"
                    }`}
                  >
                    {displayMessage}
                  </p>
                </div>
                {hasUnread && (
                  <span className="ml-1 bg-blue-500 text-xs rounded-full px-2 py-0.5">
                    {item.unreadCount}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
