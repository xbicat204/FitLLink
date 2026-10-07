// src/pages/pt/PTCalendarPage.jsx
import { useMemo, useState } from "react";
import CalendarView from "@/components/pt/CalendarView";

const startOfWeekMonday = (d = new Date()) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day); x.setHours(0,0,0,0);
  return x;
};
const at = (weekStart, dayIndex, h, m=0) => {
  const d = new Date(weekStart); d.setDate(d.getDate()+dayIndex); d.setHours(h,m,0,0); return d;
};

export default function PTCalendarPage() {
  const weekStart = useMemo(() => startOfWeekMonday(), []);
  const [sessions, setSessions] = useState([
    { id:"s1", title:"Upper Body", dayIndex:0, start:at(weekStart,0,9),  end:at(weekStart,0,10), status:"scheduled" },
    { id:"s2", title:"Leg Day",    dayIndex:2, start:at(weekStart,2,16), end:at(weekStart,2,17), status:"scheduled" },
    { id:"s3", title:"Cardio",     dayIndex:4, start:at(weekStart,4,7,30), end:at(weekStart,4,8,30), status:"completed" },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <CalendarView
        weekStart={weekStart}
        sessions={sessions}
        onCreateSession={async ({ dayIndex, start, end }) => {
          const id = Math.random().toString(36).slice(2);
          setSessions((p) => [...p, { id, dayIndex, start, end, title:"New Session", status:"scheduled" }]);
        }}
        onUpdateSession={async (patch) => {
          setSessions((p) => p.map((s) => (s.id === patch.id ? { ...s, ...patch } : s)));
        }}
        onDeleteSession={async (id) => {
          setSessions((p) => p.filter((s) => s.id !== id));
        }}
      />
    </div>
  );
}
