// src/pages/pt/PTProfile.jsx
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import PTMainLayout from "@/layouts/pt/PTMainLayout";
import ptProfileService from "@/services/ptProfileService";
import ptApprovalService from "@/services/ptApprovalService";
import { getMyAccount as getUserProfile, updateProfile as updateUserProfile } from "@/services/userService";
import MapPicker from "@/components/MapPicker";
import { cleanWorkingHours } from "@/utils/helper";

const DEFAULT_INTERVALS = [
  { start: '06:00', end: '11:00' },
  { start: '13:00', end: '17:00' }
]

const DEFAULT_DAYS = [1, 2, 3, 4, 5, 6] // T2..T7 (0 = CN)

const emptyProfile = {
  coverImage: '',
  bio: '',
  specialties: [],
  yearsExperience: 0,
  certificates: [], // [{ name, issuer, year, url }]
  primaryGym: {
    name: '',
    address: '',
    location: { type: 'Point', coordinates: [0, 0] }, // [lng, lat]
    photos: []
  },
  deliveryModes: { atPtGym: true, atClient: false, atOtherGym: false },
  travelPolicy: { enabled: true, freeRadiusKm: 6, maxTravelKm: 20, feePerKm: 10000 },
  areaNote: '',
  availableForNewClients: true,
  videoIntroUrl: '',
  // 2 field mới (FE quản lý & gửi lên)
  workingHours: [],
  defaultBreakMin: 0
}

const emptyUser = {
  name: '',
  avatar: '',
  gender: 'other',
  dob: '',
  address: '',
  email: '',
  phone: ''
}

export default function PTProfile() {
  const [form, setForm] = useState(emptyProfile)
  const [user, setUser] = useState(emptyUser)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState('')

  const [reviewLoading, setReviewLoading] = useState(false)
  const [latestRequest, setLatestRequest] = useState(null)

  // === NEW: UI “nhanh” cho Working Hours ===
  const [whDays, setWhDays] = useState(DEFAULT_DAYS)               // danh sách các dayOfWeek đã chọn
  const [whIntervals, setWhIntervals] = useState(DEFAULT_INTERVALS) // intervals dùng chung

  const setField = (key, value) => setForm(p => ({ ...p, [key]: value }))
  const setPG = (key, value) => setForm(p => ({ ...p, primaryGym: { ...(p.primaryGym || {}), [key]: value } }))
  const setDM = (key, value) => setForm(p => ({ ...p, deliveryModes: { ...(p.deliveryModes || {}), [key]: value } }))
  const setTP = (key, value) => setForm(p => ({ ...p, travelPolicy: { ...(p.travelPolicy || {}), [key]: value } }))

  const [lng, lat] = useMemo(
    () => form.primaryGym?.location?.coordinates || [0, 0],
    [form.primaryGym?.location?.coordinates]
  )

  const loadLatestRequest = async () => {
    try {
      const data = await ptApprovalService.getMyLatestRequest()
      setLatestRequest(data || null)
    } catch { }
  }

  useEffect(() => {
    ; (async () => {
      try {
        const [uRes, pRes] = await Promise.all([getUserProfile(), ptProfileService.getMyProfile()])

        if (uRes) setUser({ ...emptyUser, ...uRes.data })

        if (pRes) {
          const d = pRes.data || {}
          console.log("PT Profile: ", d);

          const cleanedWH = cleanWorkingHours(d.workingHours)

          setForm({
            ...emptyProfile,
            ...d,
            primaryGym: {
              ...emptyProfile.primaryGym,
              ...(d.primaryGym || {}),
              location: {
                type: 'Point',
                coordinates:
                  d.primaryGym?.location?.coordinates?.length === 2
                    ? d.primaryGym.location.coordinates
                    : [0, 0]
              },
              photos: Array.isArray(d.primaryGym?.photos) ? d.primaryGym.photos : []
            },
            deliveryModes: { ...emptyProfile.deliveryModes, ...(d.deliveryModes || {}) },
            travelPolicy: { ...emptyProfile.travelPolicy, ...(d.travelPolicy || {}) },
            workingHours: cleanedWH, // ⬅️ dùng bản đã làm sạch
            defaultBreakMin: Number.isFinite(d.defaultBreakMin) ? d.defaultBreakMin : 0
          })

          // Khởi tạo UI “nhanh” từ workingHours đã làm sạch
          if (cleanedWH.length) {
            const days = cleanedWH.map(w => w.dayOfWeek)
            setWhDays([...new Set(days)].sort((a, b) => a - b))       // ⬅️ chỉ có ngày có interval

            const firstIntervals = cleanedWH[0].intervals?.length
              ? cleanedWH[0].intervals
              : DEFAULT_INTERVALS

            setWhIntervals(firstIntervals.map(iv => ({
              start: String(iv.start).slice(0, 5),
              end: String(iv.end).slice(0, 5)
            })))
          } else {
            setWhDays(DEFAULT_DAYS)
            setWhIntervals(DEFAULT_INTERVALS)
          }
        }

        await loadLatestRequest()
      } catch (e) {
        setError('Failed to load profile.')
        toast.error('Failed to load profile.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleSave = async (e) => {
    e?.preventDefault?.()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const payload = { ...form }

      // specialties
      payload.specialties = (payload.specialties || []).map(s => String(s).trim()).filter(Boolean)

      // certificates (giữ những cái có name)
      payload.certificates = (payload.certificates || []).filter(c => c?.name && c.name.trim())

      // primaryGym.location → chuẩn hoá số
      const coords = payload.primaryGym?.location?.coordinates
      if (!Array.isArray(coords) || coords.length !== 2) {
        payload.primaryGym = {
          ...(payload.primaryGym || {}),
          location: { type: 'Point', coordinates: [0, 0] }
        }
      } else {
        payload.primaryGym.location = {
          type: 'Point',
          coordinates: [Number(coords[0]) || 0, Number(coords[1]) || 0]
        }
      }

      // photos: array of strings trimmed
      payload.primaryGym.photos = (payload.primaryGym?.photos || [])
        .map(u => (typeof u === 'string' ? u.trim() : ''))
        .filter(Boolean)

      // numeric guards
      payload.yearsExperience = Math.max(0, Math.min(50, Math.trunc(Number(payload.yearsExperience || 0))))
      payload.travelPolicy = {
        enabled: !!payload.travelPolicy?.enabled,
        freeRadiusKm: Number(payload.travelPolicy?.freeRadiusKm) || 0,
        maxTravelKm: Number(payload.travelPolicy?.maxTravelKm) || 0,
        feePerKm: Number(payload.travelPolicy?.feePerKm) || 0
      }

      // NEW: defaultBreakMin
      payload.defaultBreakMin = Math.max(0, Math.trunc(Number(payload.defaultBreakMin || 0)))

      // NEW: generate workingHours từ UI “nhanh”
      const hhmm = /^([01]\d|2[0-3]):([0-5]\d)$/
      const cleanIntervals = []
        .concat(whIntervals || [])
        .map(iv => ({ start: String(iv?.start || '').trim(), end: String(iv?.end || '').trim() }))
        .filter(iv => hhmm.test(iv.start) && hhmm.test(iv.end) && iv.start < iv.end)

      const cleanDays = [...new Set([...(whDays || [])])]
        .map(n => Number(n))
        .filter(n => Number.isFinite(n) && n >= 0 && n <= 6)
        .sort((a, b) => a - b)

      payload.workingHours =
        cleanDays.length && cleanIntervals.length
          ? cleanDays.map(day => ({ dayOfWeek: day, intervals: cleanIntervals }))
          : []

      // save song song: user + PTProfile
      const [userRes, ptRes] = await Promise.all([
        updateUserProfile(
          { name: user.name, gender: user.gender, dob: user.dob, address: user.address },
          avatarFile
        ),
        ptProfileService.upsertMyProfile(payload)
      ])

      const okUser = userRes?.success || userRes?.message || userRes?._id
      const okPT = ptRes?.success || ptRes?.data || ptRes?._id || ptRes?.user

      if (okUser || okPT) {
        setMessage('Saved account & PT profile successfully.')
        toast.success('Saved account & PT profile successfully.')
      } else {
        toast.info('Saved, but no response body was returned.')
      }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Save failed.'
      setError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitReview = async () => {
    try {
      setReviewLoading(true)
      await handleSave()
      await ptApprovalService.submitReview()
      toast.success('Submitted for review')
      await loadLatestRequest()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Submit failed')
    } finally {
      setReviewLoading(false)
    }
  }

  const handleCancelPending = async () => {
    try {
      setReviewLoading(true)
      await ptApprovalService.cancelMyPending()
      toast.success('Pending request cancelled')
      await loadLatestRequest()
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Cancel failed')
    } finally {
      setReviewLoading(false)
    }
  }

  if (loading) {
    return (
      <PTMainLayout>
        <div className="p-6 text-gray-300">Loading profile…</div>
      </PTMainLayout>
    )
  }

  const statusPill =
    latestRequest?.status === 'pending'
      ? 'bg-yellow-500/20 text-yellow-200'
      : latestRequest?.status === 'approved'
        ? 'bg-green-500/20 text-green-200'
        : latestRequest?.status === 'rejected'
          ? 'bg-red-500/20 text-red-200'
          : 'bg-gray-500/20 text-gray-200'

  const profileLocked = latestRequest?.status === 'pending'

  // Helpers cho UI chọn ngày/interval
  const dayLabel = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const toggleDay = (d) =>
    setWhDays(prev => (prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a, b) => a - b)))

  const addCommonInterval = () =>
    setWhIntervals(prev => [...prev, { start: '06:00', end: '07:00' }])

  const updateCommonInterval = (idx, key, value) =>
    setWhIntervals(prev => prev.map((iv, i) => (i === idx ? { ...iv, [key]: value } : iv)))

  const removeCommonInterval = (idx) =>
    setWhIntervals(prev => prev.filter((_, i) => i !== idx))

  const selectWorkdays_234567 = () => setWhDays([1, 2, 3, 4, 5, 6])
  const selectAllWeek = () => setWhDays([0, 1, 2, 3, 4, 5, 6])
  const clearDays = () => setWhDays([])

  return (
    <PTMainLayout>
      {/* ACCOUNT (USER) */}
      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Account</h2>

        <div className="grid gap-4 md:grid-cols-[160px_1fr]">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="h-28 w-28 overflow-hidden rounded-full border border-white/10 bg-white/10">
              <img
                src={avatarPreview || user.avatar || 'https://placehold.co/200x200?text=Avatar'}
                alt="avatar"
                className="h-full w-full object-cover"
              />
            </div>
            <label className="inline-block cursor-pointer rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-200 hover:bg-white/10">
              Choose avatar
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  setAvatarFile(f || null)
                  setAvatarPreview(f ? URL.createObjectURL(f) : '')
                }}
              />
            </label>
          </div>

          {/* Basic info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300">Name</label>
              <input
                disabled={profileLocked}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                value={user.name || ''}
                onChange={(e) => setUser(p => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300">Gender</label>
              <select
                disabled={profileLocked}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                value={user.gender || 'other'}
                onChange={(e) => setUser(p => ({ ...p, gender: e.target.value }))}
              >
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="other">other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-300">Date of birth</label>
              <input
                disabled={profileLocked}
                type="date"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                value={user.dob ? String(user.dob).substring(0, 10) : ''}
                onChange={(e) => setUser(p => ({ ...p, dob: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm text-gray-300">Address</label>
              <input
                disabled={profileLocked}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                value={user.address || ''}
                onChange={(e) => setUser(p => ({ ...p, address: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4 text-sm text-gray-400">
              <div>Email: <span className="text-gray-200">{user.email || '—'}</span></div>
              <div>Phone: <span className="text-gray-200">{user.phone || '—'}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Header row */}
      <div className="mb-4 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-white">PT Profile</h1>
          {latestRequest?.status && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill}`}>
              {latestRequest.status}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>

          <button
            onClick={handleSubmitReview}
            disabled={reviewLoading || latestRequest?.status === 'pending'}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-60"
            title={latestRequest?.status === 'pending' ? 'You already have a pending request' : undefined}
          >
            {reviewLoading ? 'Submitting…' : 'Submit for review'}
          </button>

          {latestRequest?.status === 'pending' && (
            <button
              onClick={handleCancelPending}
              disabled={reviewLoading}
              className="rounded-xl border border-white/15 px-3 py-2 text-sm text-gray-200 hover:bg-white/10"
            >
              Cancel pending
            </button>
          )}
        </div>
      </div>

      {/* PT PROFILE FORM */}
      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        {/* Cover Image */}
        <div>
          <label className="block text-sm text-gray-300">Cover Image URL</label>
          <input
            disabled={profileLocked}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
            value={form.coverImage || ''}
            onChange={(e) => setField('coverImage', e.target.value)}
            placeholder="https://..."
          />
          {form.coverImage && (
            <img
              src={form.coverImage}
              alt="cover"
              className="mt-2 h-32 w-full rounded-lg object-cover border border-white/10"
            />
          )}
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm text-gray-300">Bio</label>
          <textarea
            disabled={profileLocked}
            rows={4}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
            value={form.bio || ''}
            onChange={(e) => setField('bio', e.target.value)}
            placeholder="Short intro, experience, approach…"
          />
        </div>

        {/* Specialties & Years */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-300">Specialties (comma separated)</label>
            <input
              disabled={profileLocked}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
              value={(form.specialties || []).join(', ')}
              onChange={(e) =>
                setField('specialties', e.target.value.split(',').map(s => s.trim()).filter(Boolean))
              }
              placeholder="fat loss, hypertrophy..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300">Years of experience</label>
            <input
              disabled={profileLocked}
              type="number"
              min={0}
              max={50}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
              value={form.yearsExperience || 0}
              onChange={(e) => setField('yearsExperience', Number(e.target.value || 0))}
            />
          </div>
        </div>

        {/* Certificates */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm text-gray-300">Certificates</label>
            <button
              type="button"
              disabled={profileLocked}
              onClick={() =>
                setField('certificates', [...(form.certificates || []), { name: '', issuer: '', year: '', url: '' }])
              }
              className="rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-200 hover:bg-white/10 disabled:opacity-60"
            >
              + Add
            </button>
          </div>
          <div className="mt-2 space-y-2">
            {(form.certificates || []).map((c, idx) => (
              <div key={idx} className="grid gap-2 md:grid-cols-4">
                <input
                  disabled={profileLocked}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                  placeholder="Name *"
                  value={c.name || ''}
                  onChange={(e) => {
                    const next = [...form.certificates]
                    next[idx] = { ...next[idx], name: e.target.value }
                    setField('certificates', next)
                  }}
                />
                <input
                  disabled={profileLocked}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                  placeholder="Issuer"
                  value={c.issuer || ''}
                  onChange={(e) => {
                    const next = [...form.certificates]
                    next[idx] = { ...next[idx], issuer: e.target.value }
                    setField('certificates', next)
                  }}
                />
                <input
                  disabled={profileLocked}
                  type="number"
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                  placeholder="Year"
                  value={c.year || ''}
                  onChange={(e) => {
                    const next = [...form.certificates]
                    next[idx] = { ...next[idx], year: e.target.value ? Number(e.target.value) : '' }
                    setField('certificates', next)
                  }}
                />
                <div className="flex gap-2">
                  <input
                    disabled={profileLocked}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                    placeholder="URL"
                    value={c.url || ''}
                    onChange={(e) => {
                      const next = [...form.certificates]
                      next[idx] = { ...next[idx], url: e.target.value }
                      setField('certificates', next)
                    }}
                  />
                  <button
                    type="button"
                    disabled={profileLocked}
                    onClick={() => {
                      const next = [...(form.certificates || [])]
                      next.splice(idx, 1)
                      setField('certificates', next)
                    }}
                    className="rounded-lg border border-white/10 px-2 py-1 text-xs text-red-200 hover:bg-red-500/10 disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Gym */}
        <div className="rounded-xl border border-white/10 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white">Primary Gym</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm text-gray-300">Name</label>
              <input
                disabled={profileLocked}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                value={form.primaryGym?.name || ''}
                onChange={(e) => setPG('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Address</label>
              <input
                disabled={profileLocked}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                value={form.primaryGym?.address || ''}
                onChange={(e) => setPG('address', e.target.value)}
              />
            </div>
          </div>

          <div className="mt-3">
            <MapPicker
              value={{
                address: form.primaryGym?.address || '',
                coordinates: form.primaryGym?.location?.coordinates || [106.700981, 10.776889]
              }}
              onChange={({ address, coordinates }) => {
                setForm(p => ({
                  ...p,
                  primaryGym: {
                    ...(p.primaryGym || {}),
                    address,
                    location: { type: 'Point', coordinates }
                  }
                }))
              }}
              countryFilter="countrycode:vn"
              height={400}
            />
          </div>

          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm text-gray-300">Longitude (lng)</label>
              <input
                disabled={profileLocked}
                type="number"
                step="0.000001"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                value={lng}
                onChange={(e) =>
                  setPG('location', { type: 'Point', coordinates: [Number(e.target.value), lat] })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Latitude (lat)</label>
              <input
                disabled={profileLocked}
                type="number"
                step="0.000001"
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                value={lat}
                onChange={(e) =>
                  setPG('location', { type: 'Point', coordinates: [lng, Number(e.target.value)] })
                }
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Gym photos (comma separated URLs)</label>
              <input
                disabled={profileLocked}
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                value={(form.primaryGym?.photos || []).join(', ')}
                onChange={(e) =>
                  setPG(
                    'photos',
                    e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  )
                }
                placeholder="https://img1.jpg, https://img2.jpg"
              />
            </div>
          </div>
        </div>

        {/* Delivery Modes & Travel Policy */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Delivery Modes</h3>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                disabled={profileLocked}
                type="checkbox"
                checked={!!form.deliveryModes?.atPtGym}
                onChange={(e) => setDM('atPtGym', e.target.checked)}
              />
              At PT’s gym
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
              <input
                disabled={profileLocked}
                type="checkbox"
                checked={!!form.deliveryModes?.atClient}
                onChange={(e) => setDM('atClient', e.target.checked)}
              />
              At client’s place/own gym
            </label>
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-300">
              <input
                disabled={profileLocked}
                type="checkbox"
                checked={!!form.deliveryModes?.atOtherGym}
                onChange={(e) => setDM('atOtherGym', e.target.checked)}
              />
              At other gym
            </label>
          </div>

          <div className="rounded-xl border border-white/10 p-4">
            <h3 className="mb-3 text-sm font-semibold text-white">Travel Policy</h3>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                disabled={profileLocked}
                type="checkbox"
                checked={!!form.travelPolicy?.enabled}
                onChange={(e) => setTP('enabled', e.target.checked)}
              />
              Enable travel pricing
            </label>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div>
                <label className="block text-xs text-gray-400">Free radius (km)</label>
                <input
                  disabled={profileLocked}
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                  value={form.travelPolicy?.freeRadiusKm ?? 0}
                  onChange={(e) => setTP('freeRadiusKm', Number(e.target.value || 0))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">Max travel (km)</label>
                <input
                  disabled={profileLocked}
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                  value={form.travelPolicy?.maxTravelKm ?? 0}
                  onChange={(e) => setTP('maxTravelKm', Number(e.target.value || 0))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400">Fee per km</label>
                <input
                  disabled={profileLocked}
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
                  value={form.travelPolicy?.feePerKm ?? 0}
                  onChange={(e) => setTP('feePerKm', Number(e.target.value || 0))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* NEW: Default Break & Working Hours (QUICK) */}
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm text-gray-300">Nghỉ giữa 2 buổi (phút)</label>
            <input
              disabled={profileLocked}
              type="number"
              min={0}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
              value={form.defaultBreakMin ?? 0}
              onChange={(e) => setField('defaultBreakMin', Number(e.target.value || 0))}
            />
          </div>

          <div className="md:col-span-2">
            <div className="rounded-xl border border-white/10 p-4">
              <h3 className="mb-3 text-sm font-semibold text-white">Lịch làm việc (nhanh)</h3>

              {/* Chọn ngày trong tuần */}
              <div className="mb-3">
                <div className="mb-2 text-xs text-gray-400">Chọn ngày làm trong tuần</div>
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map(d => (
                    <button
                      key={d}
                      type="button"
                      disabled={profileLocked}
                      onClick={() => toggleDay(d)}
                      className={`rounded-lg border px-3 py-1 text-sm ${whDays.includes(d)
                          ? 'border-indigo-400 bg-indigo-500/20 text-indigo-100'
                          : 'border-white/10 bg-white/5 text-gray-300'
                        }`}
                    >
                      {dayLabel[d]}
                    </button>
                  ))}
                  <div className="ml-2 flex gap-2">
                    <button
                      type="button"
                      disabled={profileLocked}
                      onClick={selectWorkdays_234567}
                      className="rounded-lg border border-white/10 px-3 py-1 text-xs text-gray-300 hover:bg-white/10"
                    >
                      Chọn 2-7
                    </button>
                    <button
                      type="button"
                      disabled={profileLocked}
                      onClick={selectAllWeek}
                      className="rounded-lg border border-white/10 px-3 py-1 text-xs text-gray-300 hover:bg-white/10"
                    >
                      Chọn CN-7
                    </button>
                    <button
                      type="button"
                      disabled={profileLocked}
                      onClick={clearDays}
                      className="rounded-lg border border-white/10 px-3 py-1 text-xs text-gray-300 hover:bg-white/10"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>
              </div>

              {/* Intervals dùng chung */}
              <div>
                <div className="mb-2 text-xs text-gray-400">Khung giờ áp dụng cho mọi ngày đã chọn</div>
                {(whIntervals || []).map((iv, idx) => (
                  <div key={idx} className="mb-2 flex items-center gap-2">
                    <input
                      disabled={profileLocked}
                      type="time"
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200"
                      value={iv.start || ''}
                      onChange={(e) => updateCommonInterval(idx, 'start', e.target.value)}
                    />
                    <span className="text-gray-400">—</span>
                    <input
                      disabled={profileLocked}
                      type="time"
                      className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200"
                      value={iv.end || ''}
                      onChange={(e) => updateCommonInterval(idx, 'end', e.target.value)}
                    />
                    <button
                      type="button"
                      disabled={profileLocked}
                      onClick={() => removeCommonInterval(idx)}
                      className="text-xs rounded-lg border border-white/10 px-2 py-1 text-red-200 hover:bg-red-500/10 disabled:opacity-60"
                    >
                      Xoá
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  disabled={profileLocked}
                  onClick={addCommonInterval}
                  className="rounded-lg border border-white/10 px-2 py-1 text-xs text-gray-200 hover:bg-white/10 disabled:opacity-60"
                >
                  + Thêm khung giờ
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Area note & Availability & Video */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-300">Area note (where you usually coach)</label>
            <input
              disabled={profileLocked}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
              value={form.areaNote || ''}
              onChange={(e) => setField('areaNote', e.target.value)}
              placeholder="e.g., District 7 & nearby; or Online only"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300">Accepting new clients</label>
            <div className="mt-2">
              <label className="inline-flex items-center gap-2 text-sm text-gray-300">
                <input
                  disabled={profileLocked}
                  type="checkbox"
                  checked={!!form.availableForNewClients}
                  onChange={(e) => setField('availableForNewClients', e.target.checked)}
                />
                Available
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300">Video intro URL</label>
          <input
            disabled={profileLocked}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-gray-200 disabled:opacity-60"
            value={form.videoIntroUrl || ''}
            onChange={(e) => setField('videoIntroUrl', e.target.value)}
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
      </form>

      {(message || error) && (
        <div className={`mt-4 rounded-lg px-3 py-2 text-sm ${message ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
          {message || error}
        </div>
      )}
    </PTMainLayout>
  )
}
