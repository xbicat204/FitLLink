// src/pages/pt/PTStudents.jsx
import { useEffect, useState } from 'react'
import PTMainLayout from "@/layouts/pt/PTMainLayout";
import { listMyStudents, createSessionForStudentPackage } from "@/services/ptStudentService";
import { getMyPackages } from "@/services/packageService";
import { toast } from 'react-toastify'

function ScheduleModal({ open, onClose, studentPackage, onCreated }) {
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [ptNote, setPtNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle('')
      setStartTime('')
      setEndTime('')
      setPtNote('')
    }
  }, [open])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-gray-900 border border-white/10 p-4">
        <h3 className="text-white font-semibold text-lg mb-3">Tạo lịch cho {studentPackage?.student?.name}</h3>

        <div className="grid gap-3">
          <div>
            <label className="text-sm text-gray-300">Tiêu đề buổi tập</label>
            <input className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-2 text-sm text-white"
              value={title} onChange={e => setTitle(e.target.value)} placeholder="VD: Ngực + Tay trước" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-300">Bắt đầu</label>
              <input type="datetime-local"
                className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-2 text-sm text-white"
                value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-gray-300">Kết thúc</label>
              <input type="datetime-local"
                className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-2 text-sm text-white"
                value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-300">Ghi chú cho PT (tuỳ chọn)</label>
            <textarea rows={3}
              className="mt-1 w-full rounded-md bg-white/5 border border-white/10 p-2 text-sm text-white"
              value={ptNote} onChange={e => setPtNote(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-gray-200 hover:bg-white/10"
            onClick={onClose}>Huỷ</button>
          <button
            className="px-3 py-1.5 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
            disabled={saving}
            onClick={async () => {
              if (!title || !startTime || !endTime) {
                toast.error('Nhập đủ tiêu đề, thời gian')
                return
              }
              setSaving(true)
              try {
                const res = await createSessionForStudentPackage(studentPackage._id, {
                  title,
                  startTime: new Date(startTime).toISOString(),
                  endTime: new Date(endTime).toISOString(),
                  ptNote
                })
                toast.success('Đã tạo lịch')
                onCreated?.(res.data)
                onClose()
              } catch (e) {
                toast.error(e?.response?.data?.message || 'Tạo lịch thất bại')
              } finally {
                setSaving(false)
              }
            }}
          >
            Tạo lịch
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PTStudents() {
  const [packages, setPackages] = useState([])
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [activeSP, setActiveSP] = useState(null)

  const loadPackages = async () => {
    try {
      const r = await getMyPackages({ page: 1, limit: 100, isActive: true })
      setPackages(r?.data || [])
    } catch (e) {
      // ignore
    }
  }

  const loadStudents = async (p = page) => {
    setLoading(true)
    try {
      const r = await listMyStudents({
        packageId: selectedPackageId || undefined,
        status: 'active',
        page: p,
        limit: 10,
        q: q || undefined
      })
      setItems(r?.data || [])
      setPage(r?.pagination?.page || 1)
      setPages(r?.pagination?.pages || 1)
      setTotal(r?.pagination?.total || 0)
    } catch (e) {
      // …
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadPackages() }, [])
  useEffect(() => { loadStudents(1) }, [selectedPackageId, q])

  return (
    <PTMainLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Students</h1>
        <div className="flex items-center gap-2">
          <input
            className="rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
            placeholder="Search name/email…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <select
            className="rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
            value={selectedPackageId}
            onChange={e => setSelectedPackageId(e.target.value)}
          >
            <option value="">— All packages —</option>
            {packages.map(p => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
          <div className="p-6 text-sm text-gray-300">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-gray-300">No students</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th className="px-3 py-2 font-medium">Student</th>
                  <th className="px-3 py-2 font-medium">Package</th>
                  <th className="px-3 py-2 font-medium">Sessions</th>
                  <th className="px-3 py-2 font-medium">Period</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(sp => (
                  <tr key={sp._id} className="border-t border-white/5">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <img src={sp.student?.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <div className="text-white">{sp.student?.name}</div>
                          <div className="text-xs text-gray-400">{sp.student?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-gray-300">{sp.package?.name}</td>
                    <td className="px-3 py-2 text-gray-300">
                      {sp.remainingSessions}/{sp.totalSessions}
                    </td>
                    <td className="px-3 py-2 text-gray-300">
                      {sp.startDate ? new Date(sp.startDate).toLocaleDateString() : '—'} → {sp.endDate ? new Date(sp.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        className="rounded-lg border border-white/10 px-3 py-1 text-xs text-gray-300 hover:bg-white/10"
                        onClick={() => { setActiveSP(sp); setModalOpen(true) }}
                      >
                        Schedule
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* pagination đơn giản */}
            <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-400">
              <div>Total: <span className="text-gray-200">{total}</span></div>
              <div className="flex items-center gap-1">
                <button
                  className="rounded border border-white/10 px-2 py-1 text-gray-300 disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => loadStudents(page - 1)}
                >Prev</button>
                <span className="px-2">Page {page}/{pages}</span>
                <button
                  className="rounded border border-white/10 px-2 py-1 text-gray-300 disabled:opacity-50"
                  disabled={page >= pages}
                  onClick={() => loadStudents(page + 1)}
                >Next</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal tạo lịch */}
      <ScheduleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        studentPackage={activeSP}
        onCreated={() => {}}
      />
    </PTMainLayout>
  )
}
