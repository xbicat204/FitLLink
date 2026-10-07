// src/pages/calendar/MyCalendar.jsx
import { useEffect, useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from '@fullcalendar/interaction'
import { getMySessions, createSession, updateSession, deleteSession } from '@/services/sessionService'
import { toast } from 'react-toastify'
import PTMainLayout from "@/layouts/pt/PTMainLayout";
import SessionDrawer from "@/components/pt/SessionDrawer";

// Helper: map status → màu
const statusColors = {
  scheduled: '#2563eb',   // blue-600
  completed: '#16a34a',   // green-600
  missed: '#dc2626',      // red-600
  rescheduled: '#f59e0b', // amber-500
  cancelled: '#6b7280'    // gray-500
}

// FullCalendar muốn events = { id, title, start, end, backgroundColor, borderColor, ... }
const mapSessionToEvent = (s) => ({
  id: s._id,
  title: s.title || 'Buổi tập',
  start: s.startTime,
  end: s.endTime,
  extendedProps: {
    session: s,
    // nếu controller populate: studentPackage.package.name
    sessionPackageName: s?.studentPackage?.package?.name
  },
  backgroundColor: statusColors[s.status] || '#2563eb',
  borderColor: statusColors[s.status] || '#2563eb'
})

export default function MyCalendar() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState('pt') // nếu có context user, set từ đó

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerData, setDrawerData] = useState(null)

  // tải dữ liệu
  const load = async () => {
    try {
      setLoading(true)
      const res = await getMySessions()
      const ev = (res?.data || []).map(mapSessionToEvent)
      setEvents(ev)
    } catch (e) {
      toast.error('Không tải được lịch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // quyền kéo-thả/resize: chỉ PT
  const editable = useMemo(() => role === 'pt', [role])

  // Tạo sự kiện khi select (PT) — bạn sẽ thay bằng modal tạo nhanh sau
  const handleSelect = async (info) => {
    if (!editable) return
    const title = prompt('Tiêu đề buổi tập? (VD: Ngực + Tay trước)')
    if (!title) return
    const spId = prompt('Nhập studentPackageId (tạm):')
    if (!spId) return

    try {
      const payload = {
        studentPackageId: spId,
        title,
        startTime: info.startStr,
        endTime: info.endStr
      }
      const res = await createSession(payload)
      const newEv = mapSessionToEvent(res.data)
      setEvents((prev) => [...prev, newEv])
      toast.success('Đã tạo buổi tập')
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Tạo buổi tập thất bại')
    }
  }

  // Kéo-thả thay đổi thời gian (PT)
  const handleEventDrop = async (dropInfo) => {
    if (!editable) return
    const { event } = dropInfo
    try {
      await updateSession(event.id, { startTime: event.start.toISOString(), endTime: event.end.toISOString() })
      toast.success('Đã cập nhật thời gian')
    } catch (e) {
      dropInfo.revert()
      toast.error('Cập nhật thất bại')
    }
  }

  // Resize (PT)
  const handleEventResize = async (resizeInfo) => {
    if (!editable) return
    const { event } = resizeInfo
    try {
      await updateSession(event.id, { startTime: event.start.toISOString(), endTime: event.end.toISOString() })
      toast.success('Đã cập nhật thời lượng')
    } catch (e) {
      resizeInfo.revert()
      toast.error('Cập nhật thất bại')
    }
  }

  // CLICK EVENT → mở Drawer (bỏ window.prompt)
  const handleEventClick = (clickInfo) => {
    const session = clickInfo.event.extendedProps.session
    setDrawerData({
      session,
      start: clickInfo.event.start,
      end: clickInfo.event.end,
      sessionPackageName: clickInfo.event.extendedProps.sessionPackageName
    })
    setDrawerOpen(true)
  }

  return (
    <PTMainLayout>
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Lịch tập</h1>
          <div className="text-xs text-gray-300">
            Chế độ: <span className="font-semibold">{editable ? 'PT (có thể chỉnh)' : 'Student (chỉ xem)'}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white p-2">
          <FullCalendar
            plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            slotMinTime="05:00:00"
            slotMaxTime="22:00:00"
            expandRows
            height="80vh"
            timeZone="local"
            locale="vi"
            firstDay={1}
            nowIndicator={true}
            events={events}
            selectable={editable}
            editable={editable}
            droppable={false}
            eventStartEditable={editable}
            eventDurationEditable={editable}
            select={handleSelect}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventClick={handleEventClick}
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
          />
        </div>
      </div>

      {/* Drawer phải */}
      <SessionDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        eventData={drawerData}
        onChanged={load}
      />
    </PTMainLayout>
  )
}
