import React, { useEffect, useMemo, useState } from "react";
import SidebarAdmin from "@/components/SidebarAdmin";
import axiosClient from "@/api/axiosClient";

/* ====================== UI COMPONENTS ====================== */

function StatCard({ title, value, subtitle }) {
  return (
    <div className="flex-1 min-w-[220px] bg-slate-900 border border-slate-800 rounded-xl p-4 shadow text-white">
      <div className="text-xs uppercase tracking-wide text-gray-400">
        {title}
      </div>
      <div className="mt-1 text-3xl font-bold">
        {Number(value || 0).toLocaleString("en-US")}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
      )}
    </div>
  );
}

function MiniBarChart({ data, labels }) {
  const max = useMemo(() => Math.max(1, ...data), [data]);
  const height = 180;
  const barW = 45;
  const chartWidth = labels.length * (barW + 40);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow text-gray-200 w-full">
      <div className="text-xs uppercase tracking-wide text-gray-400 mb-3">
        Overview Chart
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${chartWidth} ${height}`}>
        {data.map((v, i) => {
          const h = (v / max) * 110;
          const x = 20 + i * (barW + 40);
          const y = height - h - 30;

          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={h} rx="8" fill="#f97316" />
              <text
                x={x + barW / 2}
                y={height - 10}
                textAnchor="middle"
                fontSize="12"
                fill="#94a3b8"
              >
                {labels[i]}
              </text>
              <text
                x={x + barW / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="12"
                fill="#e2e8f0"
              >
                {v}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function MetricChip({ label, value, unit }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-gray-200 flex flex-col gap-1">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-lg font-semibold">
        {Number.isFinite(value) ? value.toFixed(2) : "0"}
        {unit && <span className="text-xs text-gray-400 ml-1">{unit}</span>}
      </span>
    </div>
  );
}

/* ====================== MAIN PAGE ====================== */

export default function DashboardPage() {
  const [overview, setOverview] = useState({});
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosClient.get("/admin/overview");
        setOverview(res.data || {});

        const usersRes = await axiosClient.get("/admin/users");
        setTotalAccounts(usersRes.data.length);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totals = useMemo(() => {
    const totalPTs = Number(overview.totalPTs || 0);
    const totalStudents = Number(overview.totalStudents || 0);
    const totalBookings = Number(overview.totalBookings || 0);

    const approvedRaw =
      typeof overview.approvedPTs === "number"
        ? overview.approvedPTs
        : Array.isArray(overview.approvedPTs)
        ? overview.approvedPTs.length
        : 0;

    const approvedPTs = Number(approvedRaw || 0);
    const pendingPTs = Math.max(totalPTs - approvedPTs, 0);

    const approvalRate =
      totalPTs > 0 ? Math.round((approvedPTs / totalPTs) * 100) : 0;

    const studentPTRatio = totalPTs > 0 ? totalStudents / totalPTs : 0;
    const bookingsPTRatio = totalPTs > 0 ? totalBookings / totalPTs : 0;
    const bookingsStudentRatio =
      totalStudents > 0 ? totalBookings / totalStudents : 0;

    return {
      totalPTs,
      totalStudents,
      totalBookings,
      approvedPTs,
      pendingPTs,
      approvalRate,
      studentPTRatio,
      bookingsPTRatio,
      bookingsStudentRatio,
    };
  }, [overview]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-900 text-white justify-center items-center">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <SidebarAdmin />

      <div className="flex-1 p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-orange-400">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Overview of the system: PTs, Students, Bookings and Accounts
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total PTs"
            value={totals.totalPTs}
            subtitle={`${totals.approvedPTs} approved · ${totals.pendingPTs} pending`}
          />
          <StatCard
            title="Students"
            value={totals.totalStudents}
            subtitle={`Student / PT ratio: ${totals.studentPTRatio.toFixed(2)}`}
          />
          <StatCard
            title="Bookings"
            value={totals.totalBookings}
            subtitle={`Per PT: ${totals.bookingsPTRatio.toFixed(
              2
            )} · Per student: ${totals.bookingsStudentRatio.toFixed(2)}`}
          />
          <StatCard
            title="Total Accounts"
            value={totalAccounts}
            subtitle="Includes admins, PTs and students"
          />
        </div>

        {/* PT Summary + System */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400">
                  PT Summary
                </div>
                <div className="text-sm text-gray-500">
                  {totals.approvedPTs} approved / {totals.totalPTs} total
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 mb-1">Approval rate</div>
                <div className="text-2xl font-semibold text-orange-400">
                  {totals.approvalRate}%
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 text-sm text-gray-200">
              <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/60">
                <div className="text-xs text-gray-400">Approved PTs</div>
                <div className="mt-1 text-lg font-semibold">
                  {totals.approvedPTs}
                </div>
              </div>

              <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/60">
                <div className="text-xs text-gray-400">Pending PTs</div>
                <div className="mt-1 text-lg font-semibold">
                  {totals.pendingPTs}
                </div>
              </div>

              <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/60">
                <div className="text-xs text-gray-400">Total PTs</div>
                <div className="mt-1 text-lg font-semibold">
                  {totals.totalPTs}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Approval progress</span>
                <span>{totals.approvalRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-700 overflow-hidden max-w-xl">
                <div
                  className="h-full bg-orange-500"
                  style={{ width: `${totals.approvalRate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow text-sm text-gray-200">
              <div className="text-xs uppercase tracking-wide text-gray-400 mb-3">
                System Overview
              </div>

              <ul className="space-y-1">
                <li className="flex justify-between">
                  <span>Total Accounts</span>
                  <span className="font-semibold">
                    {totalAccounts.toLocaleString("en-US")}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Total PTs</span>
                  <span className="font-semibold">
                    {totals.totalPTs.toLocaleString("en-US")}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Total Students</span>
                  <span className="font-semibold">
                    {totals.totalStudents.toLocaleString("en-US")}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Total Bookings</span>
                  <span className="font-semibold">
                    {totals.totalBookings.toLocaleString("en-US")}
                  </span>
                </li>
              </ul>
            </div>

            <MiniBarChart
              data={[totals.totalPTs, totals.totalStudents, totals.totalBookings]}
              labels={["PT", "Student", "Booking"]}
            />
          </div>
        </div>

        {/* Ratios bottom */}
        <div className="grid gap-4 md:grid-cols-3">
          <MetricChip label="Student / PT ratio" value={totals.studentPTRatio} />
          <MetricChip label="Bookings / PT" value={totals.bookingsPTRatio} />
          <MetricChip label="Bookings / Student" value={totals.bookingsStudentRatio} />
        </div>
      </div>
    </div>
  );
}
