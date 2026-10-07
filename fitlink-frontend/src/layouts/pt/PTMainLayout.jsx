// s../../layouts/pt/PTMainLayout.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PTTopbar from '@/components/pt/PTTopbar'
import PTSidebar from '@/components/pt/PTSidebar'
import { isPTVerified } from '@/services/ptService'

export default function PTMainLayout({ children }) {
  const [openSidebar, setOpenSidebar] = useState(false) // mobile drawer if you use it
  const STORAGE_COLLAPSE = 'pt_sidebar_collapsed_v1'
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(STORAGE_COLLAPSE) === '1'
  })
  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    try { localStorage.setItem(STORAGE_COLLAPSE, next ? '1' : '0') } catch {}
  }

  // ---- verification (rút gọn) ----
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await isPTVerified()
      setStatus(data)
    } catch (err) {
      setError('Failed to load verification status')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { loadStatus() }, [])
  const showBanner = useMemo(() => !loading && !error && status && status.verified === false, [loading, error, status])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      {/* Topbar */}
      <PTTopbar
        onToggleSidebar={() => setOpenSidebar(s => !s)}
        // Optional: show a collapse button in topbar too
        rightExtra={
          <button
            onClick={toggleCollapsed}
            className="hidden md:inline-flex items-center rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? 'Expand' : 'Collapse'}
          </button>
        }
      />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:py-8">
        {/* Sidebar column */}
        <div
          className={`
            relative shrink-0 transition-all duration-200
            ${collapsed ? 'w-[72px]' : 'w-64'}
          `}
        >
          <PTSidebar
            open={openSidebar}
            onClose={() => setOpenSidebar(false)}
            collapsed={collapsed}
            onToggleCollapse={toggleCollapsed}
          />

          {/* Floating collapse toggle for desktop (bottom of sidebar) */}
          <button
            onClick={toggleCollapsed}
            className="
              hidden md:flex absolute -right-3 bottom-4 h-7 w-7 items-center justify-center
              rounded-full border border-slate-700/60 bg-slate-900/80 text-xs text-slate-200
              hover:bg-slate-800 transition
            "
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>

        {/* Main content grows to fill space */}
        <main className="w-full h-[calc(100vh-64px)] overflow-y-auto pr-2">
          {/* Banner / Loading / Error */}
          {loading && (
            <div className="mb-4 rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-slate-200">
              Checking your profile status…
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-xl border border-red-600/30 bg-red-500/10 p-4 text-red-200">
              <div className="font-semibold">Couldn’t load verification status</div>
              <button
                onClick={loadStatus}
                className="mt-2 inline-flex items-center rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 px-3 py-2 text-xs font-semibold"
              >
                Retry
              </button>
            </div>
          )}
          {showBanner && (
            <div className="mb-4 rounded-xl border border-yellow-600/30 bg-yellow-500/10 p-4 text-yellow-200">
              <div className="font-semibold">Complete your PT profile to go live</div>
              <p className="text-sm text-yellow-100/90 mt-1">
                You must complete your profile and submit it for Admin approval before you can create packages or open your schedule.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  to="/pt/profile"
                  className="inline-flex items-center rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 px-3 py-2 text-sm font-semibold"
                >
                  Go to Profile
                </Link>
                <button
                  onClick={loadStatus}
                  className="text-xs text-yellow-200/80 hover:text-yellow-200 underline decoration-dotted"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          {children}

          <div className="py-8 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} FitLink Coach — PT Dashboard
          </div>
        </main>
      </div>
    </div>
  )
}
