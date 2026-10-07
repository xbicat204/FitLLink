// s@/components/notifications/NotificationBell.jsx
import { useEffect, useRef, useState } from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import axiosClient from "@/api/axiosClient";
import { ptApprove, ptReject } from "@/services/ptService";
import Lottie from "lottie-react";
import acceptAnim from "@/assets/lotties/Success.json";
import rejectAnim from "@/assets/lotties/Erroranimation.json";

// ⭐ THÊM FORMAT NGÀY CHUẨN (không gây Invalid Date)
const safeDate = (d) => {
  if (!d) return "---";
  try {
    return new Date(d).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "---";
  }
};

export default function NotificationBell({ variant = "light" }) {
  const { items, unread, markAllRead, markOneReadLocal, removeNotificationLocal } = useNotification();
  const { user } = useAuth();
  const bellRef = useRef(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isDark = variant === "dark";
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [pendingRejectNoti, setPendingRejectNoti] = useState(null);

  // Animation state
  const [showAnim, setShowAnim] = useState(null); // "accept" | "reject" | null

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickNotification = (n) => {
    const notiId = n._id || n.id;
    const data = n.meta || n.data || {};

    if (!n.read && notiId) {
      markOneReadLocal(notiId);
      axiosClient.patch(`/notifications/${notiId}/read`).catch(() => { });
    }

    if (data.url) {
      navigate(data.url);
      setOpen(false);
      return;
    }

    if (!user?._id) return;
    const selfId = String(user._id);
    const basePath = user.role === "pt" ? "/pt/chat" : "/chat";

    let peerId = null;
    const roomId = data.room || data.chatId;

    if (roomId) {
      const parts = String(roomId).split("-");
      peerId = parts.find((p) => p && p !== selfId) || parts[0];
    }

    if (!peerId && data.senderId) peerId = String(data.senderId);

    if (peerId) {
      navigate(`${basePath}?peer=${peerId}`);
      setOpen(false);
      return;
    }
  };

  // ⭐ FIX QUAN TRỌNG: XỬ LÝ ACCEPT/REJECT + MARK READ
  const handleSessionAction = async (n, action) => {
    const data = n.meta || n.data || {};
    const sessionId = data.sessionId;
    const studentId = data.studentId || data.senderId;
    const requestType = data.requestType; // <-- LẤY TỪ META, KHÔNG HARD-CODE

    if (!sessionId) return;

    try {
      if (action === "accept") {
        setShowAnim("accept");

        await ptApprove({ sessionId, requestType });

        if (!n.read) {
          markOneReadLocal(n._id);
          axiosClient.patch(`/notifications/${n._id}/read`).catch(() => { });
        }
        // FE xoá luôn thông báo khỏi UI
        removeNotificationLocal(n._id);

        // BE xoá bản ghi luôn (phù hợp logic backend mới)
        axiosClient.delete(`/notifications/${n._id}`).catch(() => { });
        if (studentId) {
          setTimeout(() => {
            navigate(`/pt/chat`);
            setOpen(false);
          }, 600);
        }
      } else {
        setShowAnim("reject");

        try {
          await ptReject({
            sessionId,
            reason: "PT đã từ chối yêu cầu", // gán auto 1 lý do để backend không lỗi
            requestType,
          });

          // Mark read
          if (!n.read) {
            markOneReadLocal(n._id);
            axiosClient.patch(`/notifications/${n._id}/read`).catch(() => { });
          }

          // Xoá FE
          removeNotificationLocal(n._id);

          // Xoá BE
          axiosClient.delete(`/notifications/${n._id}`).catch(() => { });
        } catch (err) {
          console.error(err);
        }
      }

    } catch (err) {
      console.error(err);
      setShowAnim("reject");
    }
  };
  return (
    <>
      {/* Animation overlay */}
      {showAnim && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
          <div className="w-40 h-40">
            <Lottie
              animationData={showAnim === "accept" ? acceptAnim : rejectAnim}
              loop={false}
              autoplay
              onComplete={() => setShowAnim(null)}
            />
          </div>
        </div>
      )}

      {/* Bell + Popover */}
      <div className="relative" ref={bellRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={`relative p-2 rounded-full ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
            }`}
          aria-label="Notifications"
        >
          <svg
            viewBox="0 0 24 24"
            className={`w-6 h-6 fill-current ${isDark ? "text-gray-200" : "text-gray-700"
              }`}
          >
            <path d="M12 2a6 6 0 00-6 6v3.586L4.293 13.293A1 1 0 005 15h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zm0 20a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>

          {unread > 0 && (
            <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white rounded-full px-1.5">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        {open && (
          <div
            className={`absolute right-0 mt-2 w-96 max-h-[70vh] overflow-auto rounded-xl z-50 ${isDark
              ? "border border-white/10 bg-slate-900 text-slate-50"
              : "border border-gray-200 bg-white text-gray-900"
              }`}
          >
            <div
              className={`flex items-center justify-between px-3 py-2 border-b ${isDark ? "border-white/10" : "border-gray-200"
                }`}
            >
              <span className="font-semibold">Thông báo</span>
              <button
                onClick={markAllRead}
                className={`text-sm ${isDark ? "text-orange-400" : "text-blue-600"
                  } hover:underline`}
              >
                Đánh dấu đã đọc
              </button>
            </div>

            <ul className={isDark ? "divide-y divide-white/5" : "divide-y"}>
              {items.length === 0 && (
                <li
                  className={`p-4 text-sm ${isDark ? "text-slate-400" : "text-gray-500"
                    }`}
                >
                  Không có thông báo
                </li>
              )}

              {items.map((n) => {
                const data = n.meta || n.data || {};
                const canAction =
                  user?.role === "pt" &&
                  n.type === "session" &&
                  Array.isArray(data.actions) &&
                  data.actions.includes("accept") &&
                  data.actions.includes("reject");

                return (
                  <li key={n._id}>
                    <div
                      onClick={() => handleClickNotification(n)}
                      className={`p-3 cursor-pointer ${isDark ? "hover:bg-slate-800/60" : "hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-1 h-2 w-2 rounded-full ${n.read
                            ? isDark
                              ? "bg-slate-500"
                              : "bg-gray-300"
                            : isDark
                              ? "bg-orange-400"
                              : "bg-blue-500"
                            }`}
                        />

                        <div className="flex-1">
                          <div className="font-medium">{n.title}</div>

                          <div
                            className={`text-sm ${isDark ? "text-slate-300" : "text-gray-700"
                              }`}
                          >
                            {n.message}
                          </div>

                          {/* ⭐ FIX: HIỂN THỊ THÔNG TIN ĐỔI LỊCH */}
                          {data.requestType === "change" && (
                            <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                              <div>
                                <strong>Thời gian cũ:</strong>{" "}
                                {safeDate(data.oldStartTime)}
                              </div>
                              <div>
                                <strong>Thời gian mới:</strong>{" "}
                                {safeDate(data.newStartTime)} →{" "}
                                {safeDate(data.newEndTime)}
                              </div>
                              <div>
                                <strong>Lý do:</strong> {data.reason}
                              </div>
                            </div>
                          )}

                          {/* ⭐ FIX: HIỂN THỊ THÔNG TIN XIN NGHỈ */}
                          {data.requestType === "absent" && (
                            <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                              <div>
                                <strong>Buổi:</strong>{" "}
                                {safeDate(data.oldStartTime)}
                              </div>
                              <div>
                                <strong>Lý do:</strong> {data.reason}
                              </div>
                            </div>
                          )}

                          <div
                            className={`mt-1 text-xs ${isDark ? "text-slate-500" : "text-gray-400"
                              }`}
                          >
                            {safeDate(n.createdAt)}
                          </div>

                          {/* ⭐ FIX: NÚT ACCEPT / REJECT */}
                          {canAction && (
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSessionAction(n, "accept");
                                }}
                                className="flex-1 rounded-md bg-green-600 text-white py-1 text-xs font-semibold hover:bg-green-700"
                              >
                                Chấp nhận
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSessionAction(n, "reject");
                                }}
                                className="flex-1 rounded-md bg-red-600 text-white py-1 text-xs font-semibold hover:bg-red-700"
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        {/* 🟥 MODAL NHẬP LÝ DO TỪ CHỐI */}
        {showReasonModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-[380px] shadow-2xl animate-fadeIn">
              <h2 className="text-lg font-bold mb-3 text-red-600">
                🛑 Từ chối yêu cầu
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                Nhập lý do từ chối để gửi cho học viên:
              </p>

              <textarea
                className="w-full p-3 border rounded-lg h-28 text-sm"
                placeholder="Ví dụ: Em báo sát giờ quá…"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setRejectReason("");
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Hủy
                </button>

                <button
                  onClick={async () => {
                    if (!rejectReason.trim()) return;

                    const n = pendingRejectNoti;
                    const data = n.meta || n.data || {};
                    const sessionId = data.sessionId;
                    const requestType = data.requestType;

                    setShowReasonModal(false);
                    setShowAnim("reject");
                    setRejectReason("...");
                    try {
                      // Gửi request Reject lên server
                      await ptReject({
                        sessionId,
                        reason: rejectReason.trim(),
                        requestType,
                      });

                      // Đánh dấu đọc local
                      if (!n.read) {
                        markOneReadLocal(n._id);
                        axiosClient.patch(`/notifications/${n._id}/read`).catch(() => { });
                      }

                      // Xoá local
                      removeNotificationLocal(n._id);

                      // Xoá trên backend
                      axiosClient.delete(`/notifications/${n._id}`).catch(() => { });
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Gửi lý do
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
