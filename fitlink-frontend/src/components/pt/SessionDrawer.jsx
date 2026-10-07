// s@/components/pt/SessionDrawer.jsx
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { deleteSession, updateSessionStatus } from "@/services/sessionService";
import { ptApprove, ptReject, ptUpdateSessionTime } from "@/services/ptService";

export default function SessionDrawer({
  open,
  onClose,
  eventData,
  onChanged,
  onStartReschedule,
}) {
  const [loading, setLoading] = useState(false);
  const session = eventData?.session;

  // ✅ PT Note
  const [ptNote, setPtNote] = useState(session?.ptNote || "");

  // ✅ State đổi giờ
  const [editingTime, setEditingTime] = useState(false);
  const [editDate, setEditDate] = useState("");
  const [editStart, setEditStart] = useState(""); // HH:mm
  const [editEnd, setEditEnd] = useState(""); // HH:mm

  const pad = (n) => n.toString().padStart(2, "0");

  // Khi đổi session → cập nhật lại note & default time edit
  useEffect(() => {
    setPtNote(session?.ptNote || "");

    if (session?.startTime && session?.endTime) {
      const st = new Date(session.startTime);
      const en = new Date(session.endTime);

      setEditDate(st.toISOString().slice(0, 10)); // YYYY-MM-DD
      setEditStart(`${pad(st.getHours())}:${pad(st.getMinutes())}`);
      setEditEnd(`${pad(en.getHours())}:${pad(en.getMinutes())}`);
    } else {
      setEditDate("");
      setEditStart("");
      setEditEnd("");
    }
    setEditingTime(false);
  }, [session]);

  const title = session?.title || "Buổi tập";
  const studentName = session?.student?.name || "Student";
  const studentAvatar =
    session?.student?.avatar || "https://placehold.co/100x100?text=Avatar";
  const pkgName = eventData?.sessionPackageName || "";

  const startStr = session?.startTime
    ? new Date(session.startTime).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "—";
  const endStr = session?.endTime
    ? new Date(session.endTime).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    : "—";

  // ✅ Update status + attendance + note
  const setStatus = async (status, attendance) => {
    if (!session?._id) return;
    try {
      setLoading(true);
      await updateSessionStatus(session._id, {
        ...(status ? { status } : {}),
        ...(attendance ? { attendance } : {}),
        ptNote: ptNote || "",
      });
      toast.success("Đã lưu thay đổi");
      onChanged?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    if (!session?._id) return;
    if (!confirm("Xoá buổi này?")) return;
    try {
      setLoading(true);
      await deleteSession(session._id);
      toast.success("Đã xoá");
      onChanged?.();
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Xoá thất bại");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Lưu riêng PT Note khi blur
  const saveNote = async () => {
    if (!session?._id) return;
    try {
      await updateSessionStatus(session._id, { ptNote });
      toast.success("Đã lưu ghi chú");
      onChanged?.();
    } catch {
      toast.error("Không lưu được ghi chú");
    }
  };

  // ✅ Đổi giờ buổi tập
 const handleSaveNewTime = async () => {
  if (!session?._id) return;
  if (!editDate || !editStart || !editEnd) {
    toast.error("Vui lòng nhập đầy đủ ngày, giờ bắt đầu và kết thúc");
    return;
  }

  const start = new Date(`${editDate}T${editStart}:00`);
  const end = new Date(`${editDate}T${editEnd}:00`);

  // 1️⃣ Không quá khứ
  if (start < new Date()) {
    toast.error("Không thể chọn thời gian trong quá khứ");
    return;
  }

  // 2️⃣ Kết thúc phải sau bắt đầu
  if (end <= start) {
    toast.error("Giờ kết thúc phải sau giờ bắt đầu");
    return;
  }

  // 3️⃣ Working hours (06:00 – 22:00)
  const sh = start.getHours();
  const eh = end.getHours();

  if (sh < 6 || eh > 22) {
    toast.error("Giờ buổi tập phải trong khung 06:00 – 22:00");
    return;
  }

  // 4️⃣ Check trùng session
  const overlapping = eventData.allSessions?.some((s) => {
    if (s.id === session._id) return false; // bỏ chính session đang đổi

    const Astart = new Date(s.startTime);
    const Aend = new Date(s.endTime);

    return start < Aend && end > Astart;
  });

  if (overlapping) {
    toast.error("Thời gian này trùng với buổi tập khác");
    return;
  }

  // 5️⃣ (Optional) duration rule
  // const duration = (end - start) / (1000 * 60);
  // if (duration !== 60) { ... }

  try {
    setLoading(true);
    await ptUpdateSessionTime(session._id, start.toISOString(), end.toISOString());
    toast.success("Đã cập nhật giờ buổi tập");
    setEditingTime(false);
    onChanged?.();
  } catch (e) {
    toast.error(
      e?.response?.data?.message || "Không cập nhật được giờ buổi tập"
    );
  } finally {
    setLoading(false);
  }
};

  // ✅ Approve / Reject absent/change request (sửa call API cho đúng)
  const handleApproveRequest = async () => {
    if (!session?._id) return;
    try {
      setLoading(true);
      await ptApprove({ sessionId: session._id });

      toast.success("Đã chấp nhận yêu cầu");
      onChanged?.();
      onClose?.();
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Không chấp nhận được yêu cầu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!session?._id) return;
    const reason = prompt("Nhập lý do từ chối (bắt buộc):");
    if (!reason) return;

    try {
      setLoading(true);
      await ptReject({ sessionId: session._id, reason });

      toast.success("Đã từ chối yêu cầu");
      onChanged?.();
      onClose?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không từ chối được yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* overlay */}
      <div
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={onClose}
      />
      {/* drawer */}
      <aside
        className={`fixed right-0 top-0 z-[61] h-full w-full max-w-md transform bg-gray-900 border-l border-white/10 shadow-2xl transition-transform
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <h3 className="text-white text-lg font-semibold">Chi tiết buổi tập</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-300 hover:bg-white/10"
          >
            <FaTimes />
          </button>
        </div>

        <div className="h-[calc(100vh-56px)] overflow-y-auto p-4 space-y-4">
          {/* Student box */}
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <img
              src={studentAvatar}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <div className="text-white font-medium">{studentName}</div>
              {pkgName && (
                <div className="text-xs text-gray-400">{pkgName}</div>
              )}
            </div>
          </div>

          {/* Title & time */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-sm text-gray-400">Tiêu đề</div>
            <div className="text-white font-semibold">{title}</div>

            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-300">
              <div>
                <span className="text-gray-400">Bắt đầu: </span>
                {startStr}
              </div>
              <div>
                <span className="text-gray-400">Kết thúc: </span>
                {endStr}
              </div>
            </div>

            {/* 🔁 Đổi giờ buổi này */}
            <div className="mt-3">
              {!editingTime ? (
                <button
                  className="rounded-lg border border-orange-500/60 bg-orange-500/10 px-3 py-1.5 text-sm text-orange-200 hover:bg-orange-500/20 disabled:opacity-60"
                  onClick={() => setEditingTime(true)}
                  disabled={loading || !session?._id}
                >
                  Đổi giờ buổi này
                </button>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-2 text-sm text-gray-300">
                    <div>
                      <span className="block mb-1 text-gray-400">Ngày</span>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full rounded-md bg-black/30 border border-white/10 px-2 py-1.5 text-sm text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block mb-1 text-gray-400">
                          Giờ bắt đầu
                        </span>
                        <input
                          type="time"
                          value={editStart}
                          onChange={(e) => setEditStart(e.target.value)}
                          className="w-full rounded-md bg-black/30 border border-white/10 px-2 py-1.5 text-sm text-white"
                        />
                      </div>
                      <div>
                        <span className="block mb-1 text-gray-400">
                          Giờ kết thúc
                        </span>
                        <input
                          type="time"
                          value={editEnd}
                          onChange={(e) => setEditEnd(e.target.value)}
                          className="w-full rounded-md bg-black/30 border border-white/10 px-2 py-1.5 text-sm text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
                      onClick={handleSaveNewTime}
                      disabled={loading}
                    >
                      Lưu giờ mới
                    </button>
                    <button
                      className="rounded-lg border border-white/20 bg-black/30 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10"
                      onClick={() => {
                        // reset lại từ session gốc
                        if (session?.startTime && session?.endTime) {
                          const st = new Date(session.startTime);
                          const en = new Date(session.endTime);
                          setEditDate(st.toISOString().slice(0, 10));
                          setEditStart(
                            `${pad(st.getHours())}:${pad(st.getMinutes())}`
                          );
                          setEditEnd(
                            `${pad(en.getHours())}:${pad(en.getMinutes())}`
                          );
                        }
                        setEditingTime(false);
                      }}
                      disabled={loading}
                    >
                      Huỷ
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-sm text-gray-400">Trạng thái</div>
            <div className="flex flex-wrap gap-2">
              <Badge active={session?.status === "scheduled"}>scheduled</Badge>
              <Badge active={session?.status === "completed"}>completed</Badge>
              <Badge active={session?.status === "missed"}>missed</Badge>
              <Badge active={session?.status === "rescheduled"}>
                rescheduled
              </Badge>
              <Badge active={session?.status === "cancelled"}>cancelled</Badge>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <ActionBtn
                disabled={loading}
                onClick={() => setStatus("completed", "present")}
              >
                Completed
              </ActionBtn>
              <ActionBtn
                disabled={loading}
                onClick={() => setStatus("missed", "absent")}
              >
                Missed
              </ActionBtn>
              <ActionBtn
                disabled={loading}
                onClick={() => setStatus("cancelled")}
              >
                Cancelled
              </ActionBtn>

              <button
                className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-60"
                disabled={loading}
                onClick={onDelete}
              >
                Deleted
              </button>
            </div>
          </div>

          {/* PT Note */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <label className="block text-sm text-gray-300 mb-1">PT Note</label>
            <textarea
              value={ptNote}
              onChange={(e) => setPtNote(e.target.value)}
              onBlur={saveNote}
              placeholder="Enter your note here..."
              className="w-full rounded-md bg-black/20 border border-white/10 p-2 text-sm text-white"
              rows={3}
            />
          </div>

          {!!session?.ptNote && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 text-sm text-gray-400">Ghi chú của PT</div>
              <div className="text-gray-200 text-sm whitespace-pre-wrap">
                {session.ptNote}
              </div>
            </div>
          )}
          {!!session?.studentNote && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="mb-2 text-sm text-gray-400">
                Ghi chú của học viên
              </div>
              <div className="text-gray-200 text-sm whitespace-pre-wrap">
                {session.studentNote}
              </div>
            </div>
          )}
        </div>

        {/* ⭐ Nếu buổi có yêu cầu xin nghỉ */}
        {session?.requestType === "absent" &&
          (session?.status === "absent_request_pending" ||
            session?.requestStatus === "absent_request_pending") && (
            <div className="mt-4 p-4 bg-yellow-100 rounded-lg text-yellow-800 space-y-3">
              <div>Học viên xin nghỉ buổi này</div>
              <div className="flex gap-2">
                <button
                  onClick={handleApproveRequest}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg"
                  disabled={loading}
                >
                  Chấp nhận
                </button>
                <button
                  onClick={handleRejectRequest}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg"
                  disabled={loading}
                >
                  Từ chối
                </button>
              </div>
            </div>
          )}
      </aside>
    </>
  );
}

// Badge component
function Badge({ children, active }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs ${active
        ? "bg-orange-500/30 text-orange-200"
        : "bg-white/10 text-gray-300"
        }`}
    >
      {children}
    </span>
  );
}

// Action button
function ActionBtn({ children, ...props }) {
  return (
    <button
      {...props}
      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-60"
    >
      {children}
    </button>
  );
}
