// src/pages/booking/Step4StartDate.jsx
import { useMemo } from "react";
import { useBooking } from "@/contexts/BookingContext";

// Chip đẹp hơn: dark + red active
const Chip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-xl border text-sm mr-2 mb-2 transition-all
      ${active
        ? "bg-red-600/20 border-red-500 text-red-200 shadow-[0_4px_14px_rgba(220,38,38,0.25)]"
        : "bg-neutral-900/60 border-neutral-700 text-neutral-300 hover:bg-neutral-800"
      }`}
  >
    {children}
  </button>
);

// Hàm gợi ý 3 ngày tiếp theo (giữ nguyên)
const next3 = (pattern, from = new Date()) => {
  const out = [];
  const base = new Date(from);
  base.setHours(0, 0, 0, 0);
  let d = new Date(base);

  while (out.length < 3) {
    d.setDate(d.getDate() + 1);
    if (pattern.includes(d.getDay())) out.push(d.toLocaleDateString("en-CA"));
  }
  console.log("NEXT3: ", out);
  return out;
};

export default function Step4StartDate({ onBack, onNext }) {
  const { state, set } = useBooking();
  const options = useMemo(() => next3(state.pattern || []), [state.pattern]);
  const canNext = !!state.startDate;

  return (
    <div className="space-y-4">
      <div className="text-neutral-300">Chọn ngày bắt đầu.</div>

      {/* 3 lựa chọn gợi ý */}
      <div>
        {options.map((d) => (
          <Chip
            key={d}
            active={state.startDate === d}
            onClick={() => set({ startDate: d })}
          >
            {new Date(d).toLocaleDateString("vi-VN", {
              weekday: "short",
              day: "2-digit",
              month: "2-digit",
            })}
          </Chip>
        ))}
      </div>

      {/* Nhập tay */}
      <div>
        {/* <div className="text-sm text-neutral-400 mb-1">Hoặc chọn ngày khác</div> */}
        <input
          hidden={true}
          type="date"
          value={state.startDate || ""}
          onChange={(e) => set({ startDate: e.target.value })}
          className="px-3 py-2 rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-100 focus:ring-2 focus:ring-red-600 focus:outline-none"
        />
      </div>

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
