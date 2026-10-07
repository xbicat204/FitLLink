// src/pages/booking/Stepper.jsx
// Step indicator dark gym style (red/black), with subtle progress fill and mobile-friendly labels.
import React from "react";

export default function Stepper({ steps = [], current = 0 }) {
  const clx = (...a) => a.filter(Boolean).join(" ");

  // Tính % tiến độ để fill đường nối (0 → cuối step hiện tại)
  const progress =
    steps.length <= 1
      ? 0
      : Math.min(100, Math.max(0, (current / (steps.length - 1)) * 100));

  return (
    <div className="relative w-full select-none">
      {/* Track line */}
      <div className="relative h-1 rounded bg-neutral-800">
        {/* Progress fill */}
        <div
          className="absolute left-0 top-0 h-1 rounded bg-red-600 transition-all duration-500"
          style={{ width: `${progress}%` }}
          aria-hidden
        />
      </div>

      {/* Steps */}
      <ol
        className="mt-3 grid"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0,1fr))` }}
        aria-label="Progress"
      >
        {steps.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li key={i} className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                {/* Circle */}
                <div
                  className={clx(
                    "relative h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                    done
                      ? "bg-rose-600 text-white shadow-[0_6px_18px_rgba(244,63,94,0.35)]"
                      : active
                      ? "bg-red-600 text-white shadow-[0_6px_18px_rgba(220,38,38,0.35)]"
                      : "bg-neutral-800 text-neutral-300"
                  )}
                  role="img"
                  aria-label={`Bước ${i + 1}${active ? " (đang ở bước này)" : done ? " (đã xong)" : ""}`}
                  title={label}
                >
                  {i + 1}
                  {/* Border glow subtle */}
                  <span
                    className={clx(
                      "pointer-events-none absolute inset-0 rounded-full ring-2",
                      done || active ? "ring-white/10" : "ring-white/5"
                    )}
                    aria-hidden
                  />
                </div>

                {/* Label (ẩn trên mobile) */}
                <span
                  className={clx(
                    "hidden sm:block text-sm tracking-tight",
                    done || active ? "text-neutral-100" : "text-neutral-400"
                  )}
                >
                  {label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
