import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getPTDetailPublic } from "@/services/ptProfileService";
import { getPackagesByPTPublic } from "@/services/packageService";
import axiosClient from "@/api/axiosClient";
import {
  FaFacebook, FaInstagram, FaTiktok, FaMapMarkerAlt, FaArrowLeft,
  FaCheckCircle, FaRegClock, FaMedal, FaStar, FaPhoneAlt, FaEnvelope,
} from 'react-icons/fa'
import PackageDetailModal from "@/components/student/PackageDetailModel";
import Map from "@/components/Map";
import { toast } from 'react-toastify'

// =============== Helpers ===============
const formatVND = (n) =>
  typeof n === 'number' ? n.toLocaleString('vi-VN')
    : typeof n === 'string' && !Number.isNaN(Number(n)) ? Number(n).toLocaleString('vi-VN')
      : '-'

const Section = ({ title, icon, right, children, className = '' }) => (
  <section className={`bg-slate-900/70 backdrop-blur rounded-2xl shadow-lg p-5 md:p-6 border border-slate-800 ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg md:text-xl font-semibold text-slate-100 flex items-center gap-2">
        {icon}<span>{title}</span>
      </h2>
      {right}
    </div>
    {children}
  </section>
)

const Chip = ({ children, className = '' }) => (
  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-indigo-900/40 text-indigo-200 border border-indigo-800 ${className}`}>
    {children}
  </span>
)

const Stat = ({ label, value }) => (
  <div className="flex flex-col text-center p-3 rounded-xl bg-slate-800/60">
    <span className="text-xs uppercase tracking-wide text-slate-400">{label}</span>
    <span className="text-lg md:text-xl font-semibold text-slate-100">{value}</span>
  </div>
)

const BadgeVerified = ({ verified }) =>
  verified ? (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-300 bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-800">
      <FaCheckCircle className="text-emerald-300" /> Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-300 bg-amber-900/30 px-2.5 py-1 rounded-full border border-amber-800">
      <FaRegClock className="text-amber-300" /> Not verified
    </span>
  )

const DeliveryPills = ({ modes }) => {
  const list = [
    { key: 'atPtGym', label: 'At PT’s Gym' },
    { key: 'atClient', label: 'At Client’s Home/Gym' },
    { key: 'atOtherGym', label: 'At Another Gym' },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((it) => (
        <span
          key={it.key}
          className={`px-3 py-1 rounded-full text-sm border ${modes?.[it.key]
            ? 'bg-emerald-900/30 text-emerald-200 border-emerald-700'
            : 'bg-slate-800/60 text-slate-400 border-slate-700'
            }`}
        >
          {it.label}
        </span>
      ))}
    </div>
  )
}

const SocialLinks = ({ socials }) => {
  if (!socials) return null
  const items = [
    { key: 'facebook', icon: <FaFacebook />, href: socials.facebook },
    { key: 'instagram', icon: <FaInstagram />, href: socials.instagram },
    { key: 'tiktok', icon: <FaTiktok />, href: socials.tiktok },
  ].filter(Boolean).filter((x) => !!x.href)
  if (!items.length) return null
  return (
    <div className="flex items-center gap-3">
      {items.map((it) => (
        <a key={it.key} href={it.href} target="_blank" rel="noopener noreferrer"
          className="text-slate-400 hover:text-slate-100 transition">
          {it.icon}
        </a>
      ))}
    </div>
  )
}

const TravelPolicyCard = ({ policy }) => {
  if (!policy) return null
  const { enabled, freeRadiusKm, maxTravelKm, feePerKm } = policy
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Stat label="Travel Enabled" value={enabled ? 'Yes' : 'No'} />
      <Stat label="Free Radius (km)" value={freeRadiusKm ?? '-'} />
      <Stat label="Max Distance (km)" value={maxTravelKm ?? '-'} />
      <Stat label="Fee / km" value={`${formatVND(feePerKm)} VND`} />
    </div>
  )
}

const WorkingHoursTable = ({ workingHours }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] // 0..6 = Sun..Sat
  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-800/70 text-slate-300">
          <tr>
            <th className="text-left px-4 py-2 w-20">Day</th>
            <th className="text-left px-4 py-2">Time slots</th>
          </tr>
        </thead>
        <tbody>
          {(workingHours ?? []).map((d, idx) => (
            <tr key={idx} className="odd:bg-slate-900/40 even:bg-slate-900/20">
              <td className="px-4 py-2 font-medium text-slate-200">{days[d.dayOfWeek ?? 0]}</td>
              <td className="px-4 py-2 text-slate-300">
                {(d.intervals ?? []).length ? (
                  <div className="flex flex-wrap gap-2">
                    {d.intervals.map((itv, i) => (
                      <Chip key={i}>{itv.start} – {itv.end}</Chip>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500">Off</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const CertItem = ({ c }) => (
  <div className="flex items-start justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
    <div>
      <p className="font-medium text-slate-100">{c?.name || 'Certificate'}</p>
      <p className="text-slate-400 text-sm">{[c?.issuer, c?.year].filter(Boolean).join(' • ')}</p>
    </div>
    {c?.url && (
      <a href={c.url} target="_blank" rel="noopener noreferrer"
        className="text-indigo-300 hover:underline text-sm">View →</a>
    )}
  </div>
)

const PackageCard = ({ pkg, onSelect }) => (
  <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-lg p-5 hover:shadow-xl hover:-translate-y-0.5 transition">
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <h3 className="text-indigo-300 text-lg font-semibold">{pkg?.name}</h3>
        <p className="text-slate-300 mt-2 line-clamp-3 text-sm">
          {pkg?.description}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Chip className="bg-amber-900/30 text-amber-200 border-amber-800">
            💰 {formatVND(pkg?.price)} VND
          </Chip>
          {pkg?.durationDays && (
            <Chip>⏱ {pkg.durationDays} days</Chip>
          )}
        </div>
      </div>
      <button
        onClick={() => onSelect?.(pkg)}
        className="mt-4 w-full bg-gradient-to-r from-indigo-700 to-violet-700 hover:from-indigo-600 hover:to-violet-600 text-white py-2.5 rounded-lg font-semibold text-sm"
      >
        View details
      </button>
    </div>
  </div>
);


// =============== Main ===============
const PTDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ptDetail, setPtDetail] = useState(null)
  const [packages, setPackages] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      const [pRes, pkRes] = await Promise.all([
        getPTDetailPublic(id),
        getPackagesByPTPublic(id),
      ])
      setPtDetail(pRes?.data?.data || pRes?.data)
      setPackages(pkRes?.data?.data || pkRes?.data || [])
    } catch (e) {
      console.error(e)
      setError('Failed to load trainer profile. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const u = ptDetail?.user || {}
  const gym = ptDetail?.primaryGym || {}

  const ratingText = useMemo(() => {
    const avg = ptDetail?.ratingAvg || 0
    const cnt = ptDetail?.ratingCount || 0
    return cnt ? `${avg.toFixed(1)} / 5 (${cnt})` : 'No reviews yet'
  }, [ptDetail])

  // Map center (for embedded Map component)
  const mapCenter = (() => {
    const c = gym?.location?.coordinates // [lng, lat]
    if (Array.isArray(c) && c.length === 2) {
      return { lng: c[0], lat: c[1], fullAddress: gym?.address || 'Location' }
    }
    return null
  })()

  if (error) return <div className="max-w-5xl mx-auto px-6 py-16 text-center text-red-400">{error}</div>

  if (loading || !ptDetail) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-slate-800/50 rounded-3xl" />
          <div className="h-8 bg-slate-800/50 rounded w-1/2" />
          <div className="h-4 bg-slate-800/50 rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-800/50 rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-28 text-slate-100">
      {/* HERO: outer container is relative; cover has overflow-hidden, avatar sits outside to avoid clipping */}
      <div className="px-4 md:px-6">
        <div className="relative max-w-6xl mx-auto">
          <div className="relative h-80 md:h-[360px] rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
              className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md"
            >
              <FaArrowLeft className="text-sm" /><span>Back</span>
            </button>

            <img
              src={ptDetail?.coverImage || 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=1600&auto=format&fit=crop'}
              alt={`Cover photo of ${u?.name || 'Trainer'}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          {/* Avatar (outside the cover to prevent clipping) */}
          <div className="absolute -bottom-16 left-8 md:left-16 z-30">
            <img
              src={u?.avatar || 'https://ui-avatars.c@/api/?name=PT&background=1f2937&color=f8fafc'}
              alt={u?.name || 'Trainer'}
              className="w-40 h-40 md:w-44 md:h-44 rounded-full ring-4 ring-slate-950 shadow-2xl object-cover"
            />
          </div>
        </div>
      </div>

      {/* HEADER INFO */}
      <div className="max-w-6xl mx-auto mt-24 px-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-bold">{u?.name || 'Trainer'}</h1>
              <BadgeVerified verified={!!ptDetail?.verified} />
            </div>
            <p className="text-indigo-300 font-medium mt-1 flex items-center gap-2">
              <FaMedal /> Certified Personal Trainer
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-slate-300">
              {u?.email && (
                <a href={`mailto:${u.email}`} className="inline-flex items-center gap-2 hover:text-slate-100"><FaEnvelope /> {u.email}</a>
              )}
              {u?.phone && (
                <a href={`tel:${u.phone}`} className="inline-flex items-center gap-2 hover:text-slate-100"><FaPhoneAlt /> {u.phone}</a>
              )}
              {(gym?.address || ptDetail?.areaNote) && (
                <span className="inline-flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-400" /> {gym?.address || ptDetail?.areaNote}</span>
              )}
              <span className="inline-flex items-center gap-2 text-amber-300"><FaStar /> {ratingText}</span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-3">

             
            <button
              onClick={() => {
                if (!packages?.length) {
                  toast.warn('This trainer has no available packages to book.');
                  return;
                }
                console.log("PTDetail", ptDetail);
                
                navigate(`/booking/${id}`); // không truyền packageId, chọn ở booking
              }}
              className="mt-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow"
            >
              Book
            </button>
            <div className="grid grid-cols-3 gap-4 w-full md:w-[400px]">

              <Stat label="Experience" value={`${ptDetail?.yearsExperience ?? 0} years`} />
              <Stat label="Specialties" value={`${(ptDetail?.specialties || []).length}`} />
              <Stat label="Packages" value={`${packages?.length || 0}`} />

            </div>

          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto mt-8 px-6 grid grid-cols-1 lg:grid-cols-[2.5fr_2fr] gap-6">
        {/* Left */}
        <div className="lg:col-span-1 space-y-6">
          <Section title="Introduction" icon={<span>🧠</span>}>
            <p className="text-slate-300 leading-relaxed">{ptDetail?.bio || 'This trainer has not added an introduction yet.'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip>Experience: {ptDetail?.yearsExperience ?? 0} years</Chip>
              <Chip>Training modes:</Chip>
              <DeliveryPills modes={ptDetail?.deliveryModes} />
            </div>
          </Section>

          <Section title="Specialties" icon={<span>🔥</span>}>
            <div className="flex flex-wrap gap-2">
              {(ptDetail?.specialties ?? []).length ? (
                ptDetail.specialties.map((s, i) => <Chip key={`${s}-${i}`}>{s}</Chip>)
              ) : (
                <span className="text-slate-400">No specialties listed yet.</span>
              )}
            </div>
          </Section>

          <Section title="Certificates" icon={<span>📜</span>}>
            <div className="space-y-3">
              {(ptDetail?.certificates ?? []).length ? (
                ptDetail.certificates.map((c, i) => <CertItem key={i} c={c} />)
              ) : (
                <span className="text-slate-400">No certificates added yet.</span>
              )}
            </div>
          </Section>

          <Section
            title="Working Hours"
            icon={<span>🗓️</span>}
            right={ptDetail?.defaultBreakMin ? <span className="text-sm text-slate-400">Break between sessions: {ptDetail.defaultBreakMin} minutes</span> : null}
          >
            {(ptDetail?.workingHours ?? []).length ? (
              <WorkingHoursTable workingHours={ptDetail.workingHours} />
            ) : (
              <span className="text-slate-400">No working hours provided.</span>
            )}
          </Section>

          <Section title="Training Packages" icon={<span>💪</span>}>
            {packages?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <PackageCard key={pkg._id} pkg={pkg} onSelect={setSelectedPackage} />
                ))}
              </div>
            ) : (
              <span className="text-slate-400">No packages available yet.</span>
            )}
          </Section>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <Section title="Travel Policy" icon={<span>🚗</span>}>
            <TravelPolicyCard policy={ptDetail?.travelPolicy} />
          </Section>

          <Section title="Intro Video" icon={<span>🎬</span>}>
            {ptDetail?.videoIntroUrl ? (
              <div className="aspect-video w-full overflow-hidden rounded-xl">
                <iframe
                  className="w-full h-full"
                  src={ptDetail.videoIntroUrl}
                  title="Intro Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : (
              <span className="text-slate-400">No intro video.</span>
            )}
          </Section>

          <Section title="Gym Information" icon={<span>🏋️</span>}>
            <div className="space-y-2 text-slate-300">
              <div><span className="text-slate-400">Name:</span> {gym?.name || '—'}</div>
              <div><span className="text-slate-400">Address:</span> {gym?.address || '—'}</div>

              {/* Embedded map (requires coordinates + your Map component) */}
              {mapCenter && (
                <div className="mt-3 overflow-hidden rounded-xl border border-slate-800">
                  <Map center={mapCenter} />
                </div>
              )}

              {Array.isArray(gym?.photos) && gym.photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {gym.photos.slice(0, 6).map((url, i) => (
                    <img key={i} src={url} alt={`Gym photo ${i + 1}`} className="w-full h-20 object-cover rounded-lg border border-slate-800" />
                  ))}
                </div>
              ) : null}
            </div>
          </Section>
        </div>
      </div>

      {/* MODAL */}
      {selectedPackage && (
        <PackageDetailModal pkg={selectedPackage} onClose={() => setSelectedPackage(null)} />
      )}
    </div>
  )
}

export default PTDetail
