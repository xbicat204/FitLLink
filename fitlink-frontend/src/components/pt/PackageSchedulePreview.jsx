import { useEffect, useMemo, useRef, useState } from "react";

// 0..6: 0=CN, 1=T2 … 6=T7
const DOW0 = { 1:"T2", 2:"T3", 3:"T4", 4:"T5", 5:"T6", 6:"T7", 0:"CN" };
const pad = n => String(n).padStart(2,"0");
const toMin = (hm) => { const [h,m]=hm.split(":").map(Number); return h*60+m; };
const toISODate = (d) => {
  const x=new Date(d); x.setHours(0,0,0,0);
  const z=new Date(x.getTime()-x.getTimezoneOffset()*60000);
  return z.toISOString().slice(0,10);
};
const addDays = (dateStr,n) => { const d=new Date(dateStr+"T00:00:00"); d.setDate(d.getDate()+n); return toISODate(d); };
const mondayOf = (dateStr) => { const d=new Date(dateStr+"T00:00:00"); const js=d.getDay(); const delta=(js+6)%7; d.setDate(d.getDate()-delta); return toISODate(d); };

const palettes = ["#1e5a82","#2c6b39","#5a2a72","#8a4b2d","#5b6f0a","#7a1e3a","#3b4a7d","#7d3b56"];
const eventColor = (patternArr=[]) => {
  const key=(patternArr||[]).join(","); let h=0;
  for (let i=0;i<key.length;i++) h=(h*31+key.charCodeAt(i))>>>0;
  return palettes[h%palettes.length];
};

export default function PackageSchedulePreview({ open, onClose, slots=[], startDate }) {
  if (!open) return null;

  // khung giờ hiển thị
  const minMin = 6*60;   // 06:00
  const maxMin = 21*60;  // 21:00
  const minutesSpan = maxMin - minMin;

  // tuần điều hướng
  const initialWeek = mondayOf(startDate || toISODate(new Date()));
  const [weekStart, setWeekStart] = useState(initialWeek);

  // dynamic height → fit màn hình
  const gridRef = useRef(null);
  const [pxPerMin, setPxPerMin] = useState(1.2);
  useEffect(() => {
    const resize = () => {
      const el = gridRef.current;
      if (!el) return;
      const h = el.clientHeight;
      if (h > 100) setPxPerMin(h / minutesSpan);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [minutesSpan, open]);

  // 7 ngày của tuần hiện tại
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // group slots theo ngày
  const slotsByDate = useMemo(() => {
    const g={};
    (slots||[]).forEach(s => { (g[s.date] ||= []).push(s); });
    Object.values(g).forEach(arr => arr.sort((a,b)=>a.start.localeCompare(b.start)));
    return g;
  }, [slots]);

  // legend theo pattern
  const legend = useMemo(()=>{
    const set = new Set(); (slots||[]).forEach(s => set.add((s.pattern||[]).join("-")));
    return Array.from(set).sort();
  }, [slots]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70">
      <div className="absolute inset-0 flex flex-col p-4">
        <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="text-sm text-gray-300">
              Week of <span className="text-white">{weekDays[0]}</span> –{" "}
              <span className="text-white">{weekDays[6]}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
                onClick={() => setWeekStart(addDays(weekStart, -7))}
              >◀ Prev</button>
              <button
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
                onClick={() => setWeekStart(mondayOf(toISODate(new Date())))}
              >⋯ This week</button>
              <button
                className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
                onClick={() => setWeekStart(addDays(weekStart, +7))}
              >Next ▶</button>

              <button
                onClick={onClose}
                className="ml-2 rounded-md border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
              >Close</button>
            </div>
          </div>

          {/* Body calendar */}
          <div className="flex h-[calc(100vh-200px)] flex-1 overflow-hidden p-4">
            {/* Cột giờ */}
            <div className="w-16 shrink-0">
              <div className="h-10" />
              <div ref={gridRef} className="relative h-full">
                {Array.from({ length: minutesSpan / 60 + 1 }, (_, i) => minMin + i * 60).map((m) => (
                  <div
                    key={m}
                    className="absolute right-1 -translate-y-2 text-[10px] text-gray-400"
                    style={{ top: (m - minMin) * pxPerMin }}
                  >
                    {pad(Math.floor(m / 60))}:{pad(m % 60)}
                  </div>
                ))}
              </div>
            </div>

            {/* 7 cột ngày */}
            <div className="grid flex-1 grid-cols-7 gap-[1px] overflow-auto rounded-lg bg-white/10">
              {weekDays.map((dateStr) => {
                const jsDow = new Date(dateStr + "T00:00:00").getDay(); // 0..6
                const daySlots = slotsByDate[dateStr] || [];
                return (
                  <div key={dateStr} className="flex flex-col bg-[#0b1220]">
                    {/* header ngày */}
                    <div className="h-10 border-b border-white/10 px-2 py-2">
                      <div className="text-xs font-medium text-white">{DOW0[jsDow]}</div>
                      <div className="text-[11px] text-gray-400">{dateStr}</div>
                    </div>

                    {/* body ngày */}
                    <div className="relative h-full">
                      {/* đường kẻ giờ */}
                      {Array.from({ length: minutesSpan / 60 + 1 }, (_, i) => minMin + i * 60).map((m) => (
                        <div key={m}
                             className="absolute left-0 right-0 border-t border-white/5"
                             style={{ top: (m - minMin) * pxPerMin }} />
                      ))}

                      {/* events */}
                      {daySlots.map((s, i2) => {
                        const start = Math.max(minMin, toMin(s.start));
                        const end   = Math.min(maxMin, toMin(s.end));
                        if (end <= start) return null;
                        const top    = (start - minMin) * pxPerMin;
                        const height = (end - start) * pxPerMin;
                        return (
                          <div key={s.startTime || `${i2}-${s.start}`}
                               className="absolute left-1 right-1 rounded-md p-1 text-[11px] text-white shadow"
                               style={{ top, height, background: eventColor(s.pattern), opacity: .95 }}
                               title={`${s.start}–${s.end} [${(s.pattern||[]).join("-")}]`}>
                            <div className="font-medium">{s.start}–{s.end}</div>
                            <div className="opacity-80">[{(s.pattern||[]).join("-")}]</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="border-t border-white/10 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-gray-400">Legend:</span>
              {legend.length
                ? legend.map(p => (
                    <span key={p} className="rounded px-2 py-1 text-white" style={{ background: eventColor(p.split("-")) }}>
                      {p}
                    </span>
                  ))
                : (
                  <>
                    <span className="rounded px-2 py-1 text-white" style={{ background: "#1e5a82" }}>1-3-5</span>
                    <span className="rounded px-2 py-1 text-white" style={{ background: "#2c6b39" }}>2-4-6</span>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
