// src/pages/pt/PTMessagePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import PTMainLayout from "@/layouts/pt/PTMainLayout";
import { getMyStudents } from "@/services/messageService";

const PTMessagePage = () => {
  const { user: pt } = useAuth();
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const peerIdFromUrl = searchParams.get("peer");

  useEffect(() => {
    if (!pt?._id) return;

    getMyStudents()
      .then((items) =>
        setStudents(
          items.map((student) => ({
            ...student,
            name: student.fullName || student.name || "Không rõ tên",
          }))
        )
      )
      .catch((err) =>
        console.error("❌ Lỗi khi tải học viên:", err)
      );
  }, [pt?._id]);

  // Khi đã có list students + peer từ URL -> auto chọn
  useEffect(() => {
    if (!peerIdFromUrl || !students.length) return;
    const found = students.find(
      (s) => String(s._id) === String(peerIdFromUrl)
    );
    if (found) setSelected(found);
  }, [peerIdFromUrl, students]);

  return (
    <PTMainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">
            Messages
          </h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden h-[calc(100vh-180px)]">
          <div className="flex h-full overflow-hidden">
            {/* Sidebar */}
            <div className="w-[30%] border-r border-white/10 overflow-y-auto">
              <ChatSidebar
                list={students}
                role="pt"
                activeId={selected?._id}
                onSelect={setSelected}
              />
            </div>

            {/* Chat window */}
            <div className="flex-1 overflow-hidden">
              <ChatWindow self={pt} peer={selected} role="pt" />
            </div>
          </div>
        </div>
      </div>
    </PTMainLayout>
  );
};

export default PTMessagePage;
