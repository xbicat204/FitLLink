import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import { useAuth } from "@/contexts/AuthProvider";
import { getMyPTs } from "@/services/messageService";

export default function MessagePage() {
  const { user } = useAuth();
  const [pts, setPts] = useState([]);
  const [active, setActive] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const peerIdFromUrl = searchParams.get("peer");

  useEffect(() => {
    if (!user?._id) return;

    (async () => {
      try {
        const list = (await getMyPTs()).map((pt) => {
          const displayName = pt.fullName || pt.name || "Không rõ tên";
          return {
            ...pt,
            name: displayName,
            fullName: displayName,
            displayName,
          };
        });

        setPts(list);
      } catch (err) {
        console.error("❌ Lỗi khi tải PT:", err);
      }
    })();
  }, [user?._id]);

  useEffect(() => {
    if (!peerIdFromUrl || !pts.length) return;
    const found = pts.find(
      (p) => String(p._id) === String(peerIdFromUrl)
    );
    if (found) setActive(found);
  }, [peerIdFromUrl, pts]);

  return (
    <MainLayout>
      <section className="px-6 pb-10">
        {/* Tiêu đề */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            💬 Tin nhắn của bạn
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Trò chuyện trực tiếp với huấn luyện viên cá nhân của bạn
          </p>
        </div>

        {/* Chat box */}
        <div className="flex rounded-2xl border border-gray-200 shadow-lg overflow-hidden bg-white min-h-[60vh] max-h-[calc(100vh-5rem-3rem)]">
          {/* Sidebar */}
          <div className="w-[300px] border-r border-gray-100 bg-gray-50 overflow-y-auto">
            <ChatSidebar
              list={pts}
              role="student"
              activeId={active?._id}
              onSelect={setActive}
            />
          </div>

          {/* Chat window */}
          <div className="flex-1 min-h-0">
            <ChatWindow self={user} peer={active} role="student" />
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
