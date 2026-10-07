import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getPackagesByPTPublic } from "@/services/packageService";
import { useBooking } from "@/contexts/BookingContext";

export default function BookingPage() {
  const { id: ptId } = useParams();
  const [sp, setSp] = useSearchParams();
  const packageId = sp.get("packageId");

  const [loading, setLoading] = useState(!packageId);
  const [packages, setPackages] = useState([]);

  // 👇 lấy/đặt trạng thái từ BookingContext (v2)
  const { state, set, readyForPreview } = useBooking();

  // Khi vào trang, ghi ptId vào context (để chắc chắn)
  useEffect(() => { set({ ptId }); }, [ptId]);

  useEffect(() => {
    if (packageId) {
      // có packageId trên URL => lưu vào context
      set({ packageId });
      return;
    }
    // chưa có packageId => load danh sách gói để user chọn
    (async () => {
      try {
        setLoading(true);
        const res = await getPackagesByPTPublic(ptId);
        const list = res?.data?.data || res?.data || [];
        setPackages(list);
      } finally {
        setLoading(false);
      }
    })();
  }, [ptId, packageId]);

  // ========== BƯỚC 0: chọn gói ==========
  if (!packageId) {
    if (loading) return <div className="p-6 text-slate-300">Đang tải gói…</div>;
    if (!packages.length)
      return (
        <div className="p-6">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-slate-200">
            PT hiện chưa có gói để đặt.
          </div>
        </div>
      );

    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-xl font-semibold text-slate-100 mb-4">
          Chọn gói để bắt đầu
        </h1>
        <div className="grid sm:grid-cols-2 gap-4">
          {packages.map((p) => (
            <button
              key={p._id}
              onClick={() => {
                // 1) set vào query
                sp.set("packageId", p._id);
                setSp(sp, { replace: true });
                // 2) set vào context (kèm vài field hay dùng)
                set({
                  packageId: p._id,
                  package: {
                    _id: p._id,
                    name: p.name,
                    totalSessions: p.totalSessions,
                    sessionDurationMin: p.sessionDurationMin,
                    // có thể cần recurrence.daysOfWeek, supports...
                    recurrence: p.recurrence,
                    supports: p.supports,
                  },
                });
              }}
              className="text-left rounded-2xl border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-800 transition"
            >
              <div className="font-medium text-slate-100">{p.name}</div>
              <div className="text-sm text-slate-400 mt-1 line-clamp-2">
                {p.description || "—"}
              </div>
              <div className="text-amber-300 font-semibold mt-2">
                {(p.price || 0).toLocaleString("vi-VN")} VND
              </div>
              {p.totalSessions ? (
                <div className="text-xs text-slate-400 mt-1">
                  {p.totalSessions} buổi • {p.sessionDurationMin || 60}'/buổi
                </div>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ========== ĐÃ có packageId: render các bước tiếp ==========
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold text-slate-100">
        Đặt lịch với PT #{ptId} — Package #{packageId}
      </h1>

      {/* GẮN UI thật của Wizard vào đây: mode → pattern → slot → startDate → Preview */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-slate-300 space-y-4">
        {/* ví dụ chọn slot theo context v2 */}
        <div>
          <div className="text-sm mb-2 text-slate-400">Chọn khung giờ</div>
          {["07:00-08:00","08:30-09:30","10:00-11:00"].map((b) => {
            const [start, end] = b.split("-");
            const active = state.slot?.start === start && state.slot?.end === end;
            return (
              <button
                key={b}
                onClick={() => set({ slot: { start, end } })}
                className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${
                  active
                    ? "border-indigo-500 bg-indigo-600/20"
                    : "border-slate-700 bg-slate-900/40"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>

        <div>
          <div className="text-sm mb-2 text-slate-400">Ngày bắt đầu</div>
          <input
            type="date"
            onChange={(e) => set({ startDate: e.target.value })}
            className="px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 text-slate-100"
          />
        </div>

        <pre className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-lg">
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>
    </div>
  );
}
