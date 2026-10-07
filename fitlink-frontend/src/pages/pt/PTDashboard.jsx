import { Link } from "react-router-dom";
import { FaUsers, FaCalendarAlt, FaWallet, FaChartPie } from "react-icons/fa";
import PTMainLayout from "@/layouts/pt/PTMainLayout";
import { getMyWallet } from "@/services/ptWalletService";
import { getPTDashboardStats } from "@/services/ptDashboardService";
import { listMyStudents } from "@/services/ptStudentService";
import { getMySessions } from "@/services/sessionService";
import { useEffect, useState } from "react";

function getStartOfWeek(date) {
  const d = new Date(date);
  // JS: Sun=0..Sat=6 → ta muốn Mon=0..Sun=6
  const weekday = (d.getDay() + 6) % 7; // Mon=0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - weekday); // lùi về thứ 2
  return d;
}

const formatVND = (n) => Number(n ?? 0).toLocaleString('vi-VN',  { minimumFractionDigits: 0, maximumFractionDigits: 0 })

// --- helpers ---
function formatTimeRange(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";

  const options = { hour: "2-digit", minute: "2-digit" };
  const day = start.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
  const startTime = start.toLocaleTimeString("vi-VN", options);
  const endTime = end.toLocaleTimeString("vi-VN", options);

  return `${day} ${startTime}–${endTime}`;
}

function getWeekdayIndex(dateStr) {
  const d = new Date(dateStr);
  // JS: Sun=0..Sat=6 -> mình muốn Mon=0..Sun=6
  const day = d.getDay();
  return (day + 6) % 7;
}

// --- small UI components ---
function StatCard({ title, value, sub, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <div className="text-white/80">{children}</div>
      </div>
      <p className="mt-2 text-3xl font-extrabold text-white">{value}</p>
      {sub && <p className="mt-1 text-sm text-gray-400">{sub}</p>}
    </div>
  );
}

// Weekly calendar
function CalendarPlaceholder({ sessions = [] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const grouped = Array.from({ length: 7 }, () => []);

  // 👉 Tính range tuần hiện tại (Mon 00:00 → Mon tuần sau 00:00)
  const now = new Date();
  const weekStart = getStartOfWeek(now); // Thứ 2
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7); // exclusive

  // Lọc sessions chỉ trong tuần hiện tại
  const weekSessions = sessions.filter((s) => {
    const start = new Date(s.startTime);
    return start >= weekStart && start < weekEnd;
  });

  // Group theo thứ
  weekSessions.forEach((s) => {
    const idx = getWeekdayIndex(s.startTime); // dùng hàm bạn đã có
    if (idx >= 0 && idx < 7) grouped[idx].push(s);
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Weekly Calendar</h3>
        <Link to="/pt/schedule" className="text-sm text-orange-400 hover:underline">
          Open calendar
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs text-gray-400">
        {days.map((d, i) => (
          <div key={d} className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="mb-2 font-medium text-gray-300">{d}</p>
            <div className="space-y-2">
              {grouped[i].length === 0 && (
                <p className="text-[11px] text-gray-500">No sessions</p>
              )}
              {grouped[i].map((s) => (
                <div
                  key={s._id}
                  className="rounded-md bg-orange-500/20 px-2 py-1 text-orange-200"
                >
                  {new Date(s.startTime).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  {s.student?.name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentSessions({ sessions = [] }) {
  const rows = sessions
    .slice()
    .sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    )
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Recent Sessions</h3>
        <Link
          to="/pt/schedule"
          className="text-sm text-orange-400 hover:underline"
        >
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-400">
            <tr>
              <th className="px-2 py-2 font-medium">Student</th>
              <th className="px-2 py-2 font-medium">Time</th>
              <th className="px-2 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s._id} className="border-t border-white/5">
                <td className="px-2 py-2 text-white">
                  {s.student?.name || "N/A"}
                </td>
                <td className="px-2 py-2 text-gray-300">
                  {formatTimeRange(s.startTime, s.endTime)}
                </td>
                <td className="px-2 py-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs ${
                      s.status === "completed"
                        ? "bg-green-500/20 text-green-300"
                        : "bg-orange-500/20 text-orange-300"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="px-2 py-4 text-center text-xs text-gray-500"
                >
                  No sessions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentsMini({ students = [] }) {
  const list = students.slice(0, 4);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Students</h3>
        <Link
          to="/pt/students"
          className="text-sm text-orange-400 hover:underline"
        >
          Manage
        </Link>
      </div>
      <ul className="space-y-3">
        {list.map((s) => (
          <li key={s._id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-white/10">
                {s.avatar && (
                  <img
                    src={s.avatar}
                    alt={s.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div>
                <p className="text-sm text-white">{s.name}</p>
                <p className="text-xs text-gray-400">{s.email}</p>
              </div>
            </div>
            <Link
              to={`/pt/students/${s._id}`}
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-gray-300 hover:bg-white/10"
            >
              View
            </Link>
          </li>
        ))}
        {list.length === 0 && (
          <li className="text-xs text-gray-500">Chưa có học viên nào.</li>
        )}
      </ul>
    </div>
  );
}

export default function PTDashboard() {
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState({
    studentCount: 0,
    packageTemplateCount: 0,
    soldPackageCount: 0,
    totalRevenue: 0,
  });
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);

  const fetchWallet = async () => {
    try {
      const data = await getMyWallet();
      console.log("PTDashboard wallet: ", data);
      setBalance(data.available || 0);
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getPTDashboardStats();
      console.log("PTDashboard stats: ", data);
      setStats({
        studentCount: data?.studentCount ?? 0,
        packageTemplateCount: data?.packageTemplateCount ?? 0,
        soldPackageCount: data?.soldPackageCount ?? 0,
        totalRevenue: data?.totalRevenue ?? 0,
      });
    } catch (error) {
      console.error("Failed to fetch pt stats:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await listMyStudents({ page: 1, limit: 50, status: "active" });
      // res = { success, data: [StudentPackage...], pagination }
      const pkgs = res.data || [];

      const rawStudents = pkgs.map((sp) => sp.student).filter(Boolean);

      const uniq = [];
      const seen = new Set();
      for (const s of rawStudents) {
        const id = String(s._id);
        if (!seen.has(id)) {
          seen.add(id);
          uniq.push(s);
        }
      }

      setStudents(uniq);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await getMySessions(); // { success, data: [...] } (theo service)
      const all = res.data || res.data?.data || []; // fallback cho chắc
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      const upcoming = (all || []).filter((s) => {
        const start = new Date(s.startTime);
        return start >= now && start <= nextWeek;
      });

      setSessions(upcoming);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  useEffect(() => {
    fetchWallet();
    fetchStats();
    fetchStudents();
    fetchSessions();
  }, []);

  return (
    <PTMainLayout>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Students"
          value={stats.studentCount.toString()}
          sub={`${stats.soldPackageCount} packages sold`}
        >
          <FaUsers />
        </StatCard>

        <StatCard
          title="My packages"
          value={stats.packageTemplateCount.toString()}
          sub="Active templates"
        >
          <FaCalendarAlt />
        </StatCard>

        <StatCard
          title="Total revenue"
          value={`${stats.totalRevenue.toLocaleString()}₫`}
          sub="From sold packages"
        >
          <FaChartPie />
        </StatCard>

        <StatCard
          title="Wallet balance"
          value={`${formatVND(balance)}₫`}
          sub="Ready to payout"
        >
          <FaWallet />
        </StatCard>
      </div>

      {/* Grid dưới */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <CalendarPlaceholder sessions={sessions} />
          <RecentSessions sessions={sessions} />
        </div>
        <div className="space-y-6">
          <StudentsMini students={students} />
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/20 to-amber-500/10 p-5">
            <h3 className="mb-2 text-lg font-semibold text-white">
              Free plan limit
            </h3>
            <p className="text-sm text-gray-200">
              Bạn đang ở gói{" "}
              <span className="font-semibold text-orange-300">Free</span> — quản
              lý tối đa <span className="font-semibold">2 học viên</span>. Nâng
              cấp lên{" "}
              <span className="font-semibold text-orange-300">PT Pro</span> để
              không giới hạn.
            </p>
            <Link
              to="/pt/upgrade"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Upgrade to PT Pro
            </Link>
          </div>
        </div>
      </div>
    </PTMainLayout>
  );
}
