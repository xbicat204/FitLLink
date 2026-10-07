// s@/components/pt/CalendarView.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

const HOUR_HEIGHT = 64; // px
const STATUS_STYLES = {
  scheduled: "bg-orange-500/80 hover:bg-orange-500 text-white",
  completed: "bg-green-600/80 hover:bg-green-600 text-white",
  missed: "bg-rose-600/80 hover:bg-rose-600 text-white",
  cancelled: "bg-gray-500/70 hover:bg-gray-500 text-white",
};

// Mon=0..Sun=6
function startOfWeekMonday(d = new Date()) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}
const addDays = (d, n) => {
  const nd = new Date(d);
  nd.setDate(d.getDate() + n);
  return nd;
};
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const roundToStep = (date, step) => {
  const d = new Date(date);
  const mins = d.getMinutes();
  const rounded = Math.round(mins / step) * step;
  d.setMinutes(rounded, 0, 0);
  return d;
};
const formatTime = (d) =>
  `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes()
    .toString()
    .padStart(2, "0")}`;

// nhận Date hoặc Number
function minutesBetween(a, b) {
  const toMs = (x) => (x instanceof Date ? x.getTime() : Number(x));
  return Math.round((toMs(b) - toMs(a)) / 60000);
}

// panel resize
function useResizable(initial = 360, min = 260, max = 560) {
  const [width, setWidth] = useState(initial);
  const draggingRef = useRef(false);
  const onMouseDown = () => (draggingRef.current = true);
  const onMouseUp = () => (draggingRef.current = false);
  const onMouseMove = useCallback(
    (e) => {
      if (!draggingRef.current) return;
      setWidth((prev) => clamp(prev + e.movementX, min, max));
    },
    [min, max]
  );
  useEffect(() => {
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMouseMove]);
  return { width, onMouseDown };
}

export default function CalendarView({
  weekStart: _weekStart,
  sessions = [], // [{id,title,note,dayIndex(0..6),start:Date,end:Date,status}]
  hourStart = 6,
  hourEnd = 22,
  stepMinutes = 30,
  onCreateSession,
  onUpdateSession,
  onDeleteSession,
}) {
  const weekStart = useMemo(
    () => (_weekStart ? new Date(_weekStart) : startOfWeekMonday()),
    [_weekStart]
  );
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const [selected, setSelected] = useState(null);
  const { width: sideWidth, onMouseDown: onResizeDown } = useResizable();

  const totalMinutes = (hourEnd - hourStart) * 60;
  const yToMinutes = (y) =>
    clamp(
      Math.round((y / (HOUR_HEIGHT * (hourEnd - hourStart))) * totalMinutes),
      0,
      totalMinutes
    );
  const minutesToY = (m) =>
    (m / totalMinutes) * (HOUR_HEIGHT * (hourEnd - hourStart));

  // tạo block bằng kéo chuột
  const gridRef = useRef(null);
  const [draft, setDraft] = useState(null); // { dayIndex, startY, endY }

  const handleGridMouseDown = (e, dayIndex) => {
    if (e.button !== 0) return;
    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top - 32;
    setDraft({ dayIndex, startY: y, endY: y });
  };
  const handleMouseMove = (e) => {
    if (!draft) return;
    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top - 32;
    setDraft((d) => ({ ...d, endY: y }));
  };
  const handleMouseUp = async () => {
    if (!draft) return;
    const { dayIndex, startY, endY } = draft;
    const topY = Math.min(startY, endY);
    const bottomY = Math.max(startY, endY);

    const base = new Date(days[dayIndex]);
    base.setHours(hourStart, 0, 0, 0); // Date, không phải số

    let start = new Date(base);
    start.setMinutes(start.getMinutes() + yToMinutes(topY));
    start = roundToStep(start, stepMinutes);

    let end = new Date(base);
    end.setMinutes(
      end.getMinutes() + Math.max(stepMinutes, yToMinutes(bottomY))
    );
    end = roundToStep(end, stepMinutes);

    setDraft(null);
    if (onCreateSession) await onCreateSession({ dayIndex, start, end });
  };
  useEffect(() => {
    if (!draft) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draft]);

  // tick giờ
  const hourTicks = useMemo(
    () => Array.from({ length: hourEnd - hourStart + 1 }, (_, i) => hourStart + i),
    [hourStart, hourEnd]
  );
  const dayLabel = (d) =>
    d.toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });

  // tính vị trí block
  const getBlockStyle = (sess) => {
    const base = new Date(days[sess.dayIndex]);
    base.setHours(hourStart, 0, 0, 0); // giữ Date
    const startMinutes = minutesBetween(base, new Date(sess.start));
    const endMinutes = minutesBetween(base, new Date(sess.end));
    const top = minutesToY(startMinutes);
    const height = Math.max(20, minutesToY(endMinutes) - minutesToY(startMinutes));
    return { top, height };
  };

  // drag/resize block
  const dragStateRef = useRef(null); // {mode,id,dayIndex,startY,origStart,origEnd}
  const [tempDrag, setTempDrag] = useState(null);

  const onBlockMouseDown = (e, sess, mode = "move") => {
    e.stopPropagation();
    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top - 32;
    dragStateRef.current = {
      mode,
      id: sess.id,
      dayIndex: sess.dayIndex,
      startY: y,
      origStart: new Date(sess.start),
      origEnd: new Date(sess.end),
    };
  };
  const onWindowMouseMove = (e) => {
    const st = dragStateRef.current;
    if (!st) return;
    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top - 32;
    const dy = y - st.startY;
    const dmins = Math.round(
      (dy / (HOUR_HEIGHT * (hourEnd - hourStart))) * totalMinutes
    );
    const step = stepMinutes;

    if (st.mode === "move") {
      let nStart = new Date(st.origStart);
      let nEnd = new Date(st.origEnd);
      nStart.setMinutes(nStart.getMinutes() + dmins);
      nEnd.setMinutes(nEnd.getMinutes() + dmins);
      nStart = roundToStep(nStart, step);
      nEnd = roundToStep(nEnd, step);
      setTempDrag({ id: st.id, start: nStart, end: nEnd });
    } else if (st.mode === "resizeTop") {
      let nStart = new Date(st.origStart);
      nStart.setMinutes(nStart.getMinutes() + dmins);
      nStart = roundToStep(nStart, step);
      setTempDrag((p) => ({ ...(p || {}), id: st.id, start: nStart }));
    } else if (st.mode === "resizeBottom") {
      let nEnd = new Date(st.origEnd);
      nEnd.setMinutes(nEnd.getMinutes() + dmins);
      nEnd = roundToStep(nEnd, step);
      setTempDrag((p) => ({ ...(p || {}), id: st.id, end: nEnd }));
    }
  };
  const onWindowMouseUp = async () => {
    const st = dragStateRef.current;
    if (!st) return;
    dragStateRef.current = null;

    if (!tempDrag) return;
    const patch = sessions.find((s) => s.id === tempDrag.id);
    if (!patch) return;

    const newSess = {
      ...patch,
      start: tempDrag.start || patch.start,
      end: tempDrag.end || patch.end,
    };
    setTempDrag(null);
    if (onUpdateSession) await onUpdateSession(newSess);
  };
  useEffect(() => {
    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
    };
  }, [tempDrag, sessions]);

  const renderSessionBlock = (sess) => {
    const isSelected = selected?.id === sess.id;
    const merged = tempDrag?.id === sess.id ? { ...sess, ...tempDrag } : sess;
    const style = getBlockStyle(merged);
    const colorCls = STATUS_STYLES[sess.status || "scheduled"];

    return (
      <div
        key={sess.id}
        className={`absolute left-1 right-1 rounded-md shadow-md cursor-grab active:cursor-grabbing ${colorCls} ${
          isSelected ? "ring-2 ring-white" : ""
        }`}
        style={{ top: style.top, height: style.height }}
        onMouseDown={(e) => onBlockMouseDown(e, sess, "move")}
        onClick={(e) => {
          e.stopPropagation();
          setSelected(sess);
        }}
        title={`${sess.title || "Session"} \n${formatTime(
          new Date(merged.start)
        )} - ${formatTime(new Date(merged.end))}`}
      >
        <div
          className="absolute -top-1 left-1/2 h-2 w-10 -translate-x-1/2 cursor-ns-resize rounded bg-white/70"
          onMouseDown={(e) => onBlockMouseDown(e, sess, "resizeTop")}
        />
        <div className="px-2 py-1 text-xs font-semibold leading-tight">
          <div className="truncate">{sess.title || "Session"}</div>
          <div className="text-white/90 text-[11px]">
            {formatTime(new Date(merged.start))} – {formatTime(new Date(merged.end))}
          </div>
        </div>
        <div
          className="absolute -bottom-1 left-1/2 h-2 w-10 -translate-x-1/2 cursor-ns-resize rounded bg-white/70"
          onMouseDown={(e) => onBlockMouseDown(e, sess, "resizeBottom")}
        />
      </div>
    );
  };

  return (
    <div className="flex w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Lịch (75%) */}
      <div className="flex-1 min-w-0">
        {/* Header ngày */}
        <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
          <div className="col-span-1 p-3 text-xs font-medium text-gray-500">Time</div>
          {days.map((d, i) => (
            <div key={i} className="col-span-1 p-3 text-center text-sm font-semibold text-gray-700">
              {dayLabel(d)}
            </div>
          ))}
        </div>

        {/* Body */}
        <div ref={gridRef} className="relative grid grid-cols-8">
          {/* thước thời gian */}
          <div className="relative col-span-1 border-r border-gray-200 bg-white">
            {hourTicks.map((h) => (
              <div key={h} className="relative h-[64px] border-b border-dashed border-gray-100">
                <span className="absolute -top-2 right-2 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                  {`${h.toString().padStart(2, "0")}:00`}
                </span>
              </div>
            ))}
          </div>

          {/* cột ngày */}
          {days.map((_, dayIndex) => (
            <div
              key={dayIndex}
              className="relative col-span-1 border-r border-gray-200 bg-white"
              onMouseDown={(e) => handleGridMouseDown(e, dayIndex)}
              onClick={() => setSelected(null)}
            >
              {hourTicks.map((h, idx) => (
                <div
                  key={h}
                  className={`relative h-[64px] ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } border-b border-dashed border-gray-100`}
                />
              ))}

              <div
                className="absolute left-0 right-0 top-0"
                style={{ height: (hourEnd - hourStart) * HOUR_HEIGHT }}
              >
                {sessions
                  .filter((s) => s.dayIndex === dayIndex)
                  .map(renderSessionBlock)}

                {draft && draft.dayIndex === dayIndex && (
                  <div
                    className="absolute left-1 right-1 rounded-md bg-orange-400/30 ring-1 ring-orange-400"
                    style={{
                      top: Math.min(draft.startY, draft.endY),
                      height: Math.max(8, Math.abs(draft.endY - draft.startY)),
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* thanh kéo chia */}
      <div
        onMouseDown={onResizeDown}
        className="w-1 cursor-col-resize bg-gray-200 hover:bg-gray-300"
        title="Drag to resize details panel"
      />

      {/* Panel chi tiết (25%) */}
      <aside style={{ width: sideWidth }} className="hidden md:block shrink-0 bg-gray-50">
        <div className="h-full p-4">
          {!selected ? (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              Chọn một buổi trên lịch để xem chi tiết
            </div>
          ) : (
            <SessionDetail
              session={selected}
              onClose={() => setSelected(null)}
              onSave={async (patch) => {
                if (onUpdateSession) await onUpdateSession({ ...selected, ...patch });
              }}
              onDelete={async () => {
                if (onDeleteSession) await onDeleteSession(selected.id);
                setSelected(null);
              }}
            />
          )}
        </div>
      </aside>
    </div>
  );
}

function SessionDetail({ session, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(session.title || "Session");
  const [note, setNote] = useState(session.note || "");
  const [status, setStatus] = useState(session.status || "scheduled");

  useEffect(() => {
    setTitle(session.title || "Session");
    setNote(session.note || "");
    setStatus(session.status || "scheduled");
  }, [session]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Chi tiết buổi</h3>
        <button onClick={onClose} className="rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-200">
          Đóng
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Tiêu đề</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            placeholder="Ví dụ: Tập tay – Strength"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Trạng thái</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Ghi chú</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={6}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            placeholder="Nhận xét của PT sau buổi/nhắc nhở đồ ăn..."
          />
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2">
        <button
          onClick={onDelete}
          className="rounded-md border border-rose-300 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
        >
          Xóa buổi
        </button>
        <button
          onClick={() => onSave({ title, note, status })}
          className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
        >
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}