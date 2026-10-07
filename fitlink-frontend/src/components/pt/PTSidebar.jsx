// s@/components/pt/PTSidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome, FaUsers, FaCalendarAlt, FaDumbbell, FaComments,
  FaWallet, FaChartPie, FaSignOutAlt, FaBoxOpen, FaUser, FaChevronLeft, FaChevronRight, FaFileAlt,
} from "react-icons/fa";
import { logout } from "@/services/authService";
import { toast } from "react-toastify";

function SideItem({ to, icon: Icon, label, onClick, collapsed }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center ${collapsed ? "justify-center" : "gap-3"} rounded-xl px-3 py-2.5 text-sm font-medium transition
         ${isActive ? "bg-orange-500 text-white" : "text-gray-300 hover:bg-white/10 hover:text-white"}`
      }
      end
      title={collapsed ? label : undefined}  // native tooltip in collapsed mode
    >
      <Icon className={`text-base shrink-0 ${collapsed ? "" : ""}`} />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function PTSidebar({
  open,
  onClose,
  collapsed = false,
  onToggleCollapse
}) {
  const navigate = useNavigate();

  const handleClickLogout = async () => {
    try {
      await logout();
      toast.success("Logout successful!");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-black/50 md:hidden ${open ? "block" : "hidden"}`}
      />

      <aside
        className={`
          fixed z-40 h-full bg-gray-900/95 backdrop-blur border-r border-white/10 p-4 transition-transform
          md:static md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "w-[72px]" : "w-64"}
        `}
      >
        {/* Header / brand */}
        <div className={`mb-4 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed ? (
            <p className="text-xs uppercase tracking-widest text-gray-400">Navigation</p>
          ) : (
            <span className="text-sm font-semibold text-gray-300"></span>
          )}

          {/* Collapse/Expand (desktop only) */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden md:inline-flex items-center justify-center rounded-lg border border-white/10 text-gray-300 hover:bg-white/10 transition
              ${collapsed ? "h-8 w-8" : "h-8 px-2 ml-2"}`}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FaChevronRight /> : (
              <span className="flex items-center gap-2">
                <FaChevronLeft />
                {/* <span className="text-xs">Collapse</span> */}
              </span>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className={`flex flex-col gap-1 ${collapsed ? "" : ""}`}>
          <SideItem to="/pt/dashboard" icon={FaHome} label="Overview" onClick={onClose} collapsed={collapsed} />
          <SideItem to="/pt/students" icon={FaUsers} label="Students" onClick={onClose} collapsed={collapsed} />
          <SideItem to="/pt/packages" icon={FaBoxOpen} label="Packages" onClick={onClose} collapsed={collapsed} />
          <SideItem to="/pt/materials" icon={FaFileAlt} label="Materials" onClick={onClose} collapsed={collapsed} />
          <SideItem to="/pt/profile" icon={FaUser} label="Profile" onClick={onClose} collapsed={collapsed} />
          <SideItem to="/pt/schedule" icon={FaCalendarAlt} label="Schedule" onClick={onClose} collapsed={collapsed} />
          <SideItem to="/pt/feedback" icon={FaDumbbell} label="Feedback" onClick={onClose} collapsed={collapsed} />
          <SideItem to="/pt/chat" icon={FaComments} label="Messages" onClick={onClose} collapsed={collapsed} />
          <SideItem to="/pt/wallet" icon={FaWallet} label="Wallet" onClick={onClose} collapsed={collapsed} />
          <SideItem to="/pt/approval-request" icon={FaChartPie} label="Approval" onClick={onClose} collapsed={collapsed} />
        </nav>

        {/* Footer actions */}
        <div className="mt-auto pt-6">
          <button
            className={`flex w-full items-center ${collapsed ? "justify-center" : "justify-center gap-2"} rounded-xl bg-white/10 px-3 py-2 text-sm text-gray-200 hover:bg-white/20`}
            onClick={handleClickLogout}
            title={collapsed ? "Logout" : undefined}
          >
            <FaSignOutAlt className="text-base" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
