// src/pages/booking/Step3Schedule.jsx
import { useEffect, useMemo, useState } from "react";
import axios from "@/api/axiosClient";
import { useBooking } from "@/contexts/BookingContext";

const DOW = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const Chip = (p) => (
  <button
    onClick={p.onClick}
    disabled={p.disabled}
    title={p.title}
    className={`px-3 py-2 rounded-xl border text-sm mr-2 mb-2 transition-all
    ${
      p.active
        ? "bg-red-600/20 border-red-500 text-red-200 shadow-[0_4px_14px_rgba(220,38,38,0.25)]"
        : "bg-neutral-900/60 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
    }
    ${p.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {p.children}
  </button>
);

export default function Step3Schedule({ pt, onBack, onNext }) {
  const { state, set } = useBooking();

  // lấy id PT an toàn (tuỳ bạn map thế nào ở tầng trên)
  const ptId = state.ptId;
  const packageId = state.packageId || state.package?._id;

  // danh sách pattern cho gói (ví dụ [[1,3,5],[2,4,6]])
  const patterns = useMemo(
    () => (state.package?.recurrence?.daysOfWeek || []).map((a) => a),
    [state.package]
  );

  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]); // từ BE: [{start,end,ok,reason?}]
  const [err, setErr] = useState("");

  // gọi BE mỗi khi pattern đổi
  useEffect(() => {
    setSlots([]);
    set({ slot: null }); // clear slot khi đổi pattern
    setErr("");

    if (!ptId || !packageId || !state.pattern?.length) return;

    (async () => {
      try {
        setLoading(true);
        console.table("Step3Schedule: ", [packageId, ptId, state.pattern.join(",")]);

        const patternParam = state.pattern.join(",");
        const res = await axios.get(`/booking/${ptId}/blocks-simple`, {
          params: { packageId, pattern: patternParam },
        });
        const blocks = res?.data?.blocks || [];
        console.log("BLOCKS: ", blocks);

        setSlots(blocks);
      } catch (e) {
        console.error(e);
        setErr("Không tải được khung giờ. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ptId, packageId, state.pattern?.join(",")]);

  const canNext = state.pattern?.length && state.slot;

  return (
    <div className="space-y-4">
      <div className="text-neutral-300">Chọn pattern & khung giờ cố định.</div>

      {/* PATTERN */}
      <div className="text-sm text-neutral-400 mb-1">Pattern</div>
      <div>
        {patterns.map((arr, i) => {
          const active = (state.pattern || []).join(",") === arr.join(",");
          return (
            <Chip
              key={i}
              active={active}
              onClick={() => set({ pattern: arr, slot: null })}
            >
              {arr.map((d) => DOW[d]).join(" • ")}
            </Chip>
          );
        })}
        {!patterns.length && (
          <div className="text-neutral-500 text-sm">Gói này chưa có pattern.</div>
        )}
      </div>

      {/* SLOTS */}
      <div className="text-sm text-neutral-400 mt-3 mb-1">Khung giờ</div>
      {!state.pattern?.length ? (
        <div className="text-neutral-500 text-sm">Hãy chọn pattern trước.</div>
      ) : loading ? (
        <div className="text-neutral-400 text-sm">Đang kiểm tra khả dụng…</div>
      ) : err ? (
        <div className="text-rose-300 text-sm">{err}</div>
      ) : (
        <div>
          {slots.map((s) => {
            const active =
              state.slot && s.start === state.slot.start && s.end === state.slot.end;
            return (
              <Chip
                key={`${s.start}-${s.end}`}
                active={active}
                disabled={s.ok === false}
                onClick={() => s.ok && set({ slot: s })}
                title={s.reason ? "Khung này đã có học viên giữ" : ""}
              >
                {s.start}–{s.end}
              </Chip>
            );
          })}
          {!slots.length && (
            <div className="text-amber-300 text-sm">
              Pattern này không có khung giờ khả dụng.
            </div>
          )}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl border border-neutral-700 text-neutral-200 hover:bg-neutral-800 transition"
        >
          Quay lại
        </button>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
}
