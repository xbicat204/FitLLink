// src/pages/pt/PTSchedule.jsx
import { useEffect, useMemo, useState } from "react";
import PTMainLayout from "@/layouts/pt/PTMainLayout";
import { getMyPackages } from "@/services/packageService";
import { previewSchedule, generateSchedule } from "@/services/scheduleService";

// Quy ước 0..6: 0=CN, 1=T2 … 6=T7 (Mon-first hiển thị T2→CN)
const DOW0 = { 1: "T2", 2: "T3", 3: "T4", 4: "T5", 5: "T6", 6: "T7", 0: "CN" };

const pad = (n) => n.toString().padStart(2, "0");
const toISODate = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const z = new Date(x.getTime() - x.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

// ✅ Tuần bắt đầu từ Thứ 2. JS: 1=Mon → lùi 0 ngày; 0=Sun → lùi 6 ngày; ...
const mondayOf = (dateStr) => {
  const d = new Date(dateStr + "T00:00:00");
  const js = d.getDay();        // 0..6 (0=CN/Sun)
  const delta = (js + 6) % 7;   // 0 nếu là Mon(1), 6 nếu là Sun(0), ...
  d.setDate(d.getDate() - delta);
  return toISODate(d);
};

const addDays = (dateStr, n) => {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// hash -> color stable per pattern
const eventColor = (patternArr = []) => {
  const palettes = ["#1e5a82", "#2c6b39", "#5a2a72", "#8a4b2d", "#5b6f0a", "#7a1e3a", "#3b4a7d", "#7d3b56"];
  const key = (patternArr || []).join(",");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return palettes[h % palettes.length];
};

export default function PTSchedule() {
  const [packages, setPackages] = useState([]);
  const [pkgId, setPkgId] = useState("");
  const [baseStartDate, setBaseStartDate] = useState(toISODate(new Date()));
  const [weekStart, setWeekStart] = useState(() => mondayOf(toISODate(new Date())));
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [err, setErr] = useState("");

  // khung giờ hiển thị
  const minMin = 6 * 60;   // 06:00
  const maxMin = 21 * 60;  // 21:00
  const pxPerMin = 1.2;

  useEffect(() => {
    (async () => {
      try {
        const res = await getMyPackages({ page: 1, limit: 100, isActive: true });
        const items = res?.data || [];
        setPackages(items);
        if (items.length) setPkgId(items[0]._id);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  const reloadPreview = async () => {
    if (!pkgId) return;
    setLoading(true); setErr("");
    try {
      // Bật carryForward theo phương án B; backend sẽ dời slot quá giờ ra cuối dãy
      const res = await previewSchedule({
        packageId: pkgId,
        startDate: baseStartDate,
        carryForward: 1,
        _ts: Date.now()
      });
      console.log(res);
      
      const data = res?.data ?? res;
      setSlots(data?.slots || []);
      setWeekStart(mondayOf(baseStartDate));
    } catch (e) {
      setErr(e?.response?.data?.message || "Preview failed");
    } finally { setLoading(false); }
  };

  const doGenerate = async () => {
    if (!pkgId) return;
    setLoading(true); setErr("");
    try {
      await generateSchedule({
        packageId: pkgId,
        startDate: baseStartDate,
        carryForward: true,
        _ts: Date.now()
      });
      await reloadPreview();
    } catch (e) {
      setErr(e?.response?.data?.message || "Generate failed");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (pkgId) reloadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkgId, baseStartDate]);

  // 7 ngày trong tuần (T2→CN)
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // group slots theo ngày
  const slotsByDate = useMemo(() => {
    const g = {};
    (slots || []).forEach((s) => (g[s.date] ||= []).push(s));
    Object.values(g).forEach((arr) => arr.sort((a, b) => a.start.localeCompare(b.start)));
    return g;
  }, [slots]);

  // legend động theo pattern
  const legendPatterns = useMemo(() => {
    const set = new Set();
    (slots || []).forEach((s) => set.add((s.pattern || []).join("-")));
    return Array.from(set).sort();
  }, [slots]);

  return (
    <PTMainLayout>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-white">Schedule</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Package</label>
            <select
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              value={pkgId}
              onChange={(e) => setPkgId(e.target.value)}
              disabled={loading}
            >
              {packages.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} • {p.totalSessions} buổi • {p.sessionDurationMin}′
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Start date</label>
            <input
              type="date"
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white"
              value={baseStartDate}
              onChange={(e) => setBaseStartDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            onClick={reloadPreview}
            disabled={loading || !pkgId}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 hover:bg-white/10 disabled:opacity-50"
          >
            Preview
          </button>
          <button
            onClick={doGenerate}
            disabled={loading || !pkgId}
            className="rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            Generate & Save
          </button>
        </div>
      </div>

      {err && (
        <div className="mb-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {err}
        </div>
      )}

      {/* ====== Calendar 7 cột (T2→CN) ====== */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        {loading && (
          <div className="mb-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
            Loading schedule…
          </div>
        )}

        {/* Header tuần */}
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Week of <span className="font-medium text-white">{weekDays[0]}</span> –{" "}
            <span className="font-medium text-white">{weekDays[6]}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
              onClick={() => setWeekStart(addDays(weekStart, -7))}
            >
              ◀ Prev
            </button>
            <button
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
              onClick={() => setWeekStart(mondayOf(toISODate(new Date())))}
            >
              ⋯ This week
            </button>
            <button
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10"
              onClick={() => setWeekStart(addDays(weekStart, +7))}
            >
              Next ▶
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Cột giờ */}
          <div className="w-16 shrink-0">
            <div className="h-10" />
            <div className="relative" style={{ height: (maxMin - minMin) * pxPerMin }}>
              {Array.from({ length: (maxMin - minMin) / 60 + 1 }, (_, i) => minMin + i * 60).map((m) => (
                <div
                  key={m}
                  className="absolute right-1 translate-y-[-8px] text-[10px] text-gray-400"
                  style={{ top: (m - minMin) * pxPerMin }}
                >
                  {pad(Math.floor(m / 60))}:{pad(m % 60)}
                </div>
              ))}
            </div>
          </div>

          {/* 7 cột ngày (T2→CN) */}
          <div className="grid flex-1 grid-cols-7 gap-[1px] rounded-lg bg-white/10">
            {weekDays.map((dateStr) => {
              const jsDow = new Date(dateStr + "T00:00:00").getDay(); // 0..6
              const daySlots = slotsByDate[dateStr] || [];

              return (
                <div key={dateStr} className="flex flex-col bg-black/20">
                  {/* header */}
                  <div className="h-10 border-b border-white/10 px-2 py-2">
                    <div className="text-xs font-medium text-white">{DOW0[jsDow]}</div>
                    <div className="text-[11px] text-gray-400">{dateStr}</div>
                  </div>

                  {/* body */}
                  <div className="relative" style={{ height: (maxMin - minMin) * pxPerMin }}>
                    {/* hour guidelines */}
                    {Array.from({ length: (maxMin - minMin) / 60 + 1 }, (_, i) => minMin + i * 60).map((m) => (
                      <div
                        key={m}
                        className="absolute left-0 right-0 border-t border-white/5"
                        style={{ top: (m - minMin) * pxPerMin }}
                      />
                    ))}

                    {/* slots */}
                    {daySlots.map((s, i2) => {
                      const start = Math.max(minMin, toMin(s.start));
                      const end = Math.min(maxMin, toMin(s.end));
                      if (end <= start) return null;
                      const top = (start - minMin) * pxPerMin;
                      const height = (end - start) * pxPerMin;

                      // Nếu backend có flag __carried__, tô khác để dễ nhận biết slot đã được dời ra “cuối dãy”
                      const isCarried = !!s.__carried__;

                      return (
                        <div
                          key={s.startTime || `${i2}-${s.start}`}
                          className="absolute left-1 right-1 rounded-md p-1 text-[11px] text-white shadow"
                          style={{
                            top,
                            height,
                            background: isCarried
                              ? `repeating-linear-gradient(45deg, rgba(255,255,255,0.12) 0 6px, rgba(255,255,255,0.2) 6px 12px), ${eventColor(s.pattern)}`
                              : eventColor(s.pattern),
                            opacity: isCarried ? 0.9 : 0.95,
                            outline: isCarried ? "1px dashed rgba(255,255,255,0.6)" : undefined,
                          }}
                          title={`${s.start}–${s.end} [${(s.pattern || []).join("-")}]${isCarried ? " • carried-forward" : ""}`}
                        >
                          <div className="font-medium">
                            {s.start}–{s.end}
                          </div>
                          <div className="opacity-80">[{(s.pattern || []).join("-")}] {isCarried ? "• carried" : ""}</div>
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
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-gray-400">Legend:</span>
          {legendPatterns.length === 0 ? (
            <>
              <span className="rounded px-2 py-1 text-white" style={{ background: "#1e5a82" }}>
                1-3-5
              </span>
              <span className="rounded px-2 py-1 text-white" style={{ background: "#2c6b39" }}>
                2-4-6
              </span>
              <span className="rounded px-2 py-1 text-white" style={{ background: "#5a2a72" }}>
                Other
              </span>
            </>
          ) : (
            legendPatterns.map((pat) => (
              <span
                key={pat}
                className="rounded px-2 py-1 text-white"
                style={{ background: eventColor(pat.split("-")) }}
              >
                {pat}
              </span>
            ))
          )}
        </div>
      </div>
    </PTMainLayout>
  );
}