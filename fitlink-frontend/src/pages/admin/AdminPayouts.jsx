// src/pages/admin/AdminPayouts.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SidebarAdmin from "@/components/SidebarAdmin";
import {
  listPayoutRequests,
  completePayout,
  rejectPayout,
} from "@/services/adminPayoutService";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const formatVND = (n) => Number(n ?? 0).toLocaleString("vi-VN");
const safeDT = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "—");

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function AdminPayouts() {
  const query = useQuery();
  const navigate = useNavigate();

  const [status, setStatus] = useState(query.get("status") || "");
  const [page, setPage] = useState(Number(query.get("page") || 1));
  const [limit] = useState(10);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [viewItem, setViewItem] = useState(null);

  const pages = Math.max(1, Math.ceil(total / limit));

  const applyQuery = (p = page, s = status) => {
    const sp = new URLSearchParams();
    if (s) sp.set("status", s);
    sp.set("page", String(p));
    navigate(`/admin/payouts?${sp.toString()}`);
  };

  const load = async (p = page, s = status) => {
    setLoading(true);
    try {
      const data = await listPayoutRequests({
        page: p,
        limit,
        status: s || undefined,
      });
      setItems(data?.items || []);
      setTotal(data?.total ?? (data?.items?.length ?? 0));
      setPage(data?.page ?? p);
    } catch (e) {
      toast.error(e?.response?.data?.error || "Failed to load list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const s = query.get("status") || "";
    const p = Number(query.get("page") || 1);
    setStatus(s);
    setPage(p);
  }, [query]);

  useEffect(() => {
    load(page, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const onChangeStatus = (s) => {
    setStatus(s);
    applyQuery(1, s);
  };

  // Confirm completion using SweetAlert
  const onComplete = async (id) => {
    const result = await Swal.fire({
      title: "Confirm completion?",
      text: "The system will simulate a bank transfer and deduct the PT's wallet.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Complete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      await completePayout(id);
      await Swal.fire({
        title: "Success",
        text: "Payout request marked as completed.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
      load(1, status);
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e?.response?.data?.error || "Operation failed",
        icon: "error",
      });
    }
  };

  // Prompt rejection reason using SweetAlert
  const onReject = async (id) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Reject request",
      input: "textarea",
      inputLabel: "Enter rejection reason:",
      inputPlaceholder: "e.g.: Invalid account...",
      inputAttributes: { "aria-label": "Reason" },
      inputValidator: (v) => (!v?.trim() ? "Please provide a reason" : undefined),
      showCancelButton: true,
      confirmButtonText: "Confirm rejection",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!isConfirmed) return;

    try {
      await rejectPayout(id, { reason: reason.trim() });
      await Swal.fire({
        title: "Rejected",
        text: "Payout request has been rejected.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });
      load(page, status);
    } catch (e) {
      Swal.fire({
        title: "Error",
        text: e?.response?.data?.error || "Operation failed",
        icon: "error",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b1223]">
      {/* Left sidebar */}
      <SidebarAdmin />

      {/* Main content */}
      <main className="flex-1 p-6 text-white">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-2xl font-bold">💳 Payout Requests</h1>
          <div className="flex items-center gap-2">
            <select
              className="rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white"
              value={status}
              onChange={(e) => onChangeStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved (awaiting transfer)</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-200 hover:bg-white/10"
              onClick={() => load(page, status)}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Card list */}
        <div className="rounded-2xl border border-white/10 bg-white/5 shadow-lg">
          {loading ? (
            <div className="p-6 text-sm text-gray-300">Loading…</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-sm text-gray-300">No requests</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-300 sticky top-0 bg-white/10 backdrop-blur">
                  <tr>
                    <th className="px-4 py-3 font-medium">PT</th>
                    <th className="px-4 py-3 font-medium">Bank</th>
                    <th className="px-4 py-3 font-medium">Account number</th>
                    <th className="px-4 py-3 font-medium">Account holder</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr
                      key={r._id}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="px-4 py-3">
                        <div className="text-white">
                          {r?.pt?.name || "—"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {r?.pt?.email || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {r?.bankName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {r?.accountNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {r?.accountName || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {formatVND(r?.amount)} ₫
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            r?.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : r?.status === "rejected"
                              ? "bg-red-500/20 text-red-400"
                              : r?.status === "approved"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-yellow-500/20 text-yellow-400"
                          }`}
                        >
                          {r?.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {safeDT(r?.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            className="rounded border border-white/10 px-2 py-1 text-xs text-gray-200 hover:bg-white/10"
                            onClick={() => setViewItem(r)}
                          >
                            View
                          </button>
                          {(r?.status === "pending" ||
                            r?.status === "approved") && (
                            <>
                              <button
                                className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                                onClick={() => onComplete(r._id)}
                              >
                                Complete
                              </button>
                              <button
                                className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                                onClick={() => onReject(r._id)}
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 text-xs text-gray-400 border-t border-white/10">
                <div>
                  Total: <span className="text-gray-200">{total}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="rounded border border-white/10 px-2 py-1 text-gray-300 disabled:opacity-50"
                    disabled={page <= 1}
                    onClick={() => {
                      const np = Math.max(1, page - 1);
                      setPage(np);
                      applyQuery(np, status);
                    }}
                  >
                    Prev
                  </button>
                  <span className="px-2">
                    Page {page}/{pages}
                  </span>
                  <button
                    className="rounded border border-white/10 px-2 py-1 text-gray-300 disabled:opacity-50"
                    disabled={page >= pages}
                    onClick={() => {
                      const np = Math.min(pages, page + 1);
                      setPage(np);
                      applyQuery(np, status);
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View detail modal */}
        {viewItem && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-gray-900 border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-lg">
                  Request details
                </h3>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => setViewItem(null)}
                >
                  ✕
                </button>
              </div>
              <div className="grid gap-2 text-sm text-gray-300">
                <div>
                  <span className="text-gray-400">PT:</span> {viewItem?.pt?.name} (
                  {viewItem?.pt?.email})
                </div>
                <div>
                  <span className="text-gray-400">Bank:</span>{" "}
                  {viewItem?.bankName}
                </div>
                <div>
                  <span className="text-gray-400">Account number:</span>{" "}
                  {viewItem?.accountNumber}
                </div>
                <div>
                  <span className="text-gray-400">Account holder:</span>{" "}
                  {viewItem?.accountName}
                </div>
                <div>
                  <span className="text-gray-400">Amount:</span>{" "}
                  {formatVND(viewItem?.amount)} ₫
                </div>
                <div>
                  <span className="text-gray-400">Status:</span>{" "}
                  {viewItem?.status}
                </div>
                <div>
                  <span className="text-gray-400">Created at:</span>{" "}
                  {safeDT(viewItem?.createdAt)}
                </div>
                {viewItem?.adminNote && (
                  <div>
                    <span className="text-gray-400">Admin note:</span>{" "}
                    {viewItem?.adminNote}
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  className="px-3 py-1.5 text-sm rounded-lg border border-white/10 text-gray-200 hover:bg-white/10"
                  onClick={() => setViewItem(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
