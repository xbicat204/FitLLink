import { Link } from "react-router-dom";
import { FaBars, FaUser } from "react-icons/fa";
import NotificationBell from "@/components/notifications/NotificationBell"; // 👈 thêm

export default function PTTopbar({ onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-gray-900/80 backdrop-blur border-b border-white/10">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-300 hover:bg-white/10 md:hidden"
            aria-label="Toggle sidebar"
          >
            <FaBars />
          </button>
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-600">
            FitLink<span className="text-white"> Coach</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* 👇 Chuông thông báo */}
          <NotificationBell variant="dark" /> 
          <button className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10">
            Help
          </button>
          <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <FaUser className="text-gray-300" />
            <span className="text-sm text-gray-200">Coach Minh</span>
          </div>
        </div>
      </div>
    </header>
  );
}
