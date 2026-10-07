import React, { useEffect, useMemo, useState, useCallback } from "react";
import axiosClient from "@/api/axiosClient";

/* ===================== BADGE (NEW UI) ===================== */
function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[11px] rounded-lg border font-medium tracking-wide ${className}`}
    >
      {children}
    </span>
  );
}

/* ===================== GENDER FORMAT ===================== */
function GenderText({ gender }) {
  if (!gender) return "—";
  const g = String(gender).toUpperCase();
  const map = { MALE: "Male", FEMALE: "Female", OTHER: "Other" };
  return map[g] || gender;
}

/* ===================== DETAIL MODAL (NEW UI) ===================== */
function PTDetailModal({ open, onClose, row }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const escHandler = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", escHandler);
    return () => document.removeEventListener("keydown", escHandler);
  }, [open, escHandler]);

  const handleBanToggle = async () => {
    const action = row.isActive ? "block" : "unlock";
    const confirmMsg = row.isActive
      ? "Are you sure you want to ban this PT account?"
      : "Are you sure you want to unban this PT account?";

    if (!window.confirm(confirmMsg)) return;

    try {
      setIsProcessing(true);
      await axiosClient.patch(`/admin/users/${row._id}/${action}`);
      alert(
        row.isActive
          ? "PT account has been banned."
          : "PT account has been unbanned."
      );
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Operation failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!open || !row) return null;

  const fmt = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-start justify-center p-4 md:items-center">
        <div className="w-full max-w-3xl bg-slate-800 rounded-2xl border border-slate-700 shadow-[0_0_40px_rgba(0,0,0,0.45)] overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-900/60">
            <h3 className="text-xl font-semibold text-orange-400">
              PT Details
            </h3>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto space-y-6 text-gray-200">
            {/* Basic info */}
            <div className="flex gap-4">
              {row.avatar ? (
                <img
                  src={row.avatar}
                  alt={row.name}
                  className="w-16 h-16 rounded-full object-cover border border-slate-600"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-700 border border-slate-600" />
              )}

              <div className="space-y-1 min-w-0">
                <div className="text-2xl font-semibold truncate">
                  {row.name || "—"}
                </div>
                <div className="text-sm text-gray-400 break-all">
                  ID: {row._id}
                </div>

                <div className="text-sm space-y-0.5">
                  <div>
                    <b>Email:</b> {row.email || "—"}
                  </div>
                  <div>
                    <b>Phone:</b> {row.phone || "—"}
                  </div>
                  <div>
                    <b>Gender:</b> <GenderText gender={row.gender} />
                  </div>
                  <div className="flex items-center gap-2">
                    <b>Account Status:</b>
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        row.isActive ? "bg-emerald-400" : "bg-red-500"
                      }`}
                    />
                    <span>{row.isActive ? "Active" : "Banned"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {row.verified && (
                    <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800">
                      Verified
                    </Badge>
                  )}
                  {row.availableForNewClients != null && (
                    <Badge className="bg-blue-900/40 text-blue-300 border-blue-800">
                      {row.availableForNewClients
                        ? "Accepting Clients"
                        : "Not Accepting"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* More info */}
            <div className="text-gray-300 space-y-3">
              <p>
                <b>Experience:</b> {row.yearsExperience ?? 0} years
              </p>
              <p>
                <b>Rating:</b> {(row.ratingAvg ?? 0).toFixed(1)} (
                {row.ratingCount || 0})
              </p>
              <p>
                <b>Specialties:</b>{" "}
                {row.specialties?.length ? row.specialties.join(", ") : "—"}
              </p>

              {/* Gym */}
              {row.gymName || row.gymAddress ? (
                <div>
                  <p className="font-semibold">🏋️ Gym Information</p>
                  <div className="ml-2">
                    <div>
                      <b>Name:</b> {row.gymName || "—"}
                    </div>
                    <div>
                      <b>Address:</b> {row.gymAddress || "—"}
                    </div>
                  </div>
                </div>
              ) : (
                <p>
                  <b>Gym:</b> —
                </p>
              )}

              {/* Certificates */}
              <div>
                <p className="font-semibold mb-1">📜 Certificates:</p>
                {row.certificates?.length ? (
                  <ul className="list-disc ml-6 space-y-1">
                    {row.certificates.map((c, i) => {
                      const name =
                        typeof c === "string"
                          ? c
                          : c?.name || `Certificate ${i + 1}`;
                      const issuer =
                        typeof c === "object" && c?.issuer
                          ? ` • ${c.issuer}`
                          : "";
                      const year =
                        typeof c === "object" && c?.year ? ` • ${c.year}` : "";
                      return (
                        <li key={i}>
                          {name} {issuer} {year}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="ml-2 text-gray-400">
                    No certificates uploaded.
                  </p>
                )}
              </div>

              {/* System Info */}
              <div>
                <p className="font-semibold">🕒 System Info</p>
                <p className="text-sm text-gray-400 ml-2">
                  Created: {fmt(row.createdAt)} <br />
                  Updated: {fmt(row.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3 bg-slate-900/60">
            <button
              onClick={handleBanToggle}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg font-medium shadow-lg ${
                row.isActive
                  ? "bg-red-600 hover:bg-red-500"
                  : "bg-emerald-600 hover:bg-emerald-500"
              }`}
            >
              {row.isActive ? "Ban PT" : "Unban PT"}
            </button>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== MAIN COMPONENT ===================== */
export default function PTList() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [filterVerified, setFilterVerified] = useState("all");
  const [filterAvail, setFilterAvail] = useState("all");
  const [sortBy, setSortBy] = useState("none");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const openDetail = (row) => {
    setSelectedRow(row);
    setOpenModal(true);
  };

  const closeDetail = () => {
    setOpenModal(false);
    setSelectedRow(null);
  };

  /* ===== Fetch data ===== */
  useEffect(() => {
    (async () => {
      try {
        const resUsers = await axiosClient.get("/admin/users");
        const allUsers = resUsers.data || [];
        const ptUsers = allUsers.filter(
          (u) => u.role === "pt" || u.role === "trainer"
        );

        const resOv = await axiosClient.get("/admin/overview");
        const approvedPTs = resOv.data?.approvedPTs || [];

        setUsers(ptUsers);
        setProfiles(approvedPTs);
      } catch (e) {
        console.error(e);
        setErr("Failed to load PT list. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ===== Map profile by userId ===== */
  const profileByUserId = useMemo(() => {
    const m = new Map();
    for (const p of profiles) {
      const uid = typeof p.user === "string" ? p.user : p.user?._id;
      if (uid) m.set(String(uid), p);
    }
    return m;
  }, [profiles]);

  /* ===== Merge user + profile ===== */
  const data = useMemo(() => {
    return users.map((u) => {
      const p = profileByUserId.get(String(u._id));
      return {
        _id: u._id,
        name: u.name || "—",
        email: u.email,
        phone: u.phone || "",
        gender: u.gender,
        avatar: u.avatar || "",
        isActive: u.isActive,

        verified: p?.verified ?? false,
        availableForNewClients: p?.availableForNewClients ?? null,
        specialties: p?.specialties || [],
        yearsExperience: p?.yearsExperience ?? null,
        ratingAvg: p?.ratingAvg ?? null,
        ratingCount: p?.ratingCount ?? null,
        certificates: p?.certificates || [],

        createdAt: p?.createdAt || null,
        updatedAt: p?.updatedAt || null,

        gymName: p?.primaryGym?.name || "",
        gymAddress: p?.primaryGym?.address || "",
      };
    });
  }, [users, profileByUserId]);

  /* ===== Filter / Sort ===== */
  const filteredSorted = useMemo(() => {
    let rows = [...data];
    const t = q.trim().toLowerCase();

    if (t) {
      rows = rows.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(t) ||
          (r.email || "").toLowerCase().includes(t) ||
          (r.phone || "").toLowerCase().includes(t)
      );
    }

    if (filterVerified !== "all") {
      rows = rows.filter((r) => r.verified === (filterVerified === "true"));
    }

    if (filterAvail !== "all") {
      rows = rows.filter(
        (r) => (r.availableForNewClients ?? false) === (filterAvail === "true")
      );
    }

    if (sortBy === "rating") {
      rows.sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0));
    } else if (sortBy === "exp") {
      rows.sort((a, b) => (b.yearsExperience ?? 0) - (a.yearsExperience ?? 0));
    }

    return rows;
  }, [data, q, filterVerified, filterAvail, sortBy]);

  useEffect(() => setPage(1), [q, filterVerified, filterAvail, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageRows = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  if (loading) return <div className="p-6">Loading...</div>;
  if (err) return <div className="p-6 text-red-500">{err}</div>;

  /* ======================= RENDER UI (NEW) ======================= */
  return (
    <div className="bg-[#0F172A] text-white min-h-screen p-6 -mt-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-orange-400 drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]">
          PT List
        </h1>
        <p className="text-gray-400">{filteredSorted.length} results</p>
      </div>

      {/* FILTERS */}
      <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl shadow-xl border border-slate-700 mb-6 p-6 flex flex-wrap gap-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search PT by name / email / phone…"
          className="bg-slate-900/70 border border-slate-700 rounded-lg px-4 py-2 text-gray-100 placeholder:text-gray-500 focus:ring-2 focus:ring-orange-500 min-w-[240px]"
        />

        <select
          value={filterVerified}
          onChange={(e) => setFilterVerified(e.target.value)}
          className="bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All (Verified / Unverified)</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>

        <select
          value={filterAvail}
          onChange={(e) => setFilterAvail(e.target.value)}
          className="bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-orange-500"
        >
          <option value="all">All Availability</option>
          <option value="true">Accepting Clients</option>
          <option value="false">Not Accepting</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-slate-900/70 border border-slate-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-orange-500"
        >
          <option value="none">No Sorting</option>
          <option value="rating">Rating (desc)</option>
          <option value="exp">Experience (desc)</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-slate-800/60 backdrop-blur-xl rounded-xl shadow-lg border border-slate-700 overflow-x-auto">
        <table className="w-full table-fixed text-sm text-gray-300">
          <thead className="bg-slate-700/80 text-gray-200 uppercase text-[12px] tracking-wide">
            <tr>
              <th className="px-6 py-3 text-left">Profile</th>
              <th className="px-6 py-3 text-left">PT</th>
              <th className="px-6 py-3 text-left">Contact</th>
              <th className="px-6 py-3 text-left">Specialties</th>
              <th className="px-6 py-3 text-left">Exp</th>
              <th className="px-6 py-3 text-left">Rating</th>
              <th className="px-6 py-3 text-left">Gym</th>
              <th className="px-6 py-3 text-center">Certificates</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-6 py-6 text-gray-400 text-center"
                >
                  No PT found.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={row._id}
                  className="border-b border-slate-700 hover:bg-slate-700/40 transition-colors"
                >
                  {/* === PROFILE STATUS === */}
                  <td className="px-6 py-3">
                    <div className="flex flex-col gap-1">
                      {row.verified && (
                        <Badge className="bg-emerald-900/40 text-emerald-300 border-emerald-800 text-center">
                          Verified
                        </Badge>
                      )}

                      {row.availableForNewClients != null && (
                        <Badge
                          className={`text-center ${
                            row.availableForNewClients
                              ? "bg-blue-900/40 text-blue-300 border-blue-800"
                              : "bg-slate-700/60 text-slate-400 border-slate-700"
                          }`}
                        >
                          {row.availableForNewClients
                            ? "Accepting"
                            : "Not Accepting"}
                        </Badge>
                      )}

                      {!row.verified && row.availableForNewClients == null && (
                        <Badge className="text-center bg-slate-700/40 text-gray-400 border border-slate-700">
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* === AVATAR + NAME === */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {row.avatar ? (
                        <img
                          src={row.avatar}
                          alt={row.name}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600" />
                      )}

                      <div className="min-w-0">
                        <div className="font-semibold text-gray-100 truncate max-w-[120px]">
                          {row.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          Gender: <GenderText gender={row.gender} />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* === CONTACT === */}
                  <td className="px-6 py-3">
                    <div className="truncate max-w-[170px]">
                      {row.email || "—"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {row.phone || ""}
                    </div>
                  </td>

                  {/* === SPECIALTIES === */}
                  <td className="px-6 py-3">
                    {row.specialties.length ? (
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {row.specialties.map((s, i) => (
                          <Badge
                            key={i}
                            className="bg-indigo-900/40 text-indigo-300 border-indigo-800"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* EXP */}
                  <td className="px-6 py-3">
                    {row.yearsExperience != null
                      ? `${row.yearsExperience} yrs`
                      : "—"}
                  </td>

                  {/* RATING */}
                  <td className="px-6 py-3">
                    {row.ratingAvg != null ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="font-semibold">
                          {Number(row.ratingAvg).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({row.ratingCount || 0})
                        </span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* GYM */}
                  <td className="px-6 py-3">
                    {row.gymName || row.gymAddress ? (
                      <div className="space-y-0.5">
                        <div className="font-medium truncate max-w-[180px]">
                          {row.gymName || "—"}
                        </div>
                        <div className="text-xs text-gray-400 max-w-[200px] whitespace-pre-line break-words">
                          {row.gymAddress}
                        </div>
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* CERTIFICATES */}
                  <td className="px-6 py-3 text-center">
                    {row.certificates.length ? (
                      <span>{row.certificates.length} cert</span>
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          row.isActive ? "bg-emerald-400" : "bg-red-500"
                        }`}
                      />
                      {row.isActive ? "Active" : "Banned"}
                    </div>
                  </td>

                  {/* ACTION */}
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => openDetail(row)}
                      className="bg-orange-600 hover:bg-orange-500 text-white text-sm px-3 py-1.5 rounded-md"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="flex justify-end items-center px-6 py-4 border-t border-slate-700 gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 text-gray-200 disabled:opacity-40"
          >
            Prev
          </button>

          <span className="text-sm text-gray-300">
            Page {page}/{totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg border border-slate-600 text-gray-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      {/* MODAL */}
      <PTDetailModal open={openModal} onClose={closeDetail} row={selectedRow} />
    </div>
  );
}
