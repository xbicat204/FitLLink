import { useEffect, useState } from "react";
import { transactionService } from "@/services/transactionService";
import {
  FaMoneyBillWave,
  FaFilter,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const statusColors = {
  paid: "text-green-400 bg-green-900/20 border border-green-500/40",
  failed: "text-red-400 bg-red-900/20 border border-red-500/40",
  pending_gateway:
    "text-yellow-300 bg-yellow-900/20 border border-yellow-500/40",
  initiated: "text-gray-300 bg-gray-700/40 border border-gray-500/40",
  refunded: "text-blue-300 bg-blue-900/20 border border-blue-500/40",
  cancelled: "text-orange-300 bg-orange-900/20 border border-orange-500/40",
};

export default function Transactions() {
  const [statusFilter, setStatusFilter] = useState("paid");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalPlatformFee: 0,
    totalPTEarning: 0,
    count: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await transactionService.getTransactions(
        statusFilter,
        page,
        limit
      );

      setSummary(res.summary);
      setTransactions(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("❌ Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, page]);

  return (
    <div className="p-6 text-gray-200 relative before:hidden after:hidden">
      <h1 className="text-3xl font-bold mb-6 text-orange-400">
        View Transactions
      </h1>

      {/* SUMMARY + FILTER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-700 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <FaMoneyBillWave className="text-orange-400 text-2xl" />
            <h2 className="text-lg font-semibold">Total Revenue</h2>
          </div>
          <p className="text-3xl font-bold text-orange-400">
            {summary.totalPlatformFee.toLocaleString("vi-VN")} đ
          </p>
          <p className="text-gray-400 mt-1">
            {summary.count} completed transactions
          </p>
        </div>

        <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-700 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <FaFilter className="text-orange-400 text-xl" />
            <h2 className="text-lg font-semibold">Filter Status</h2>
          </div>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-gray-200"
            value={statusFilter}
            onChange={(e) => {
              setPage(1);
              setStatusFilter(e.target.value);
            }}
          >
            <option value="paid">Paid</option>
            <option value="pending_gateway">Pending Gateway</option>
            <option value="initiated">Initiated</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-700 shadow-md flex items-center justify-between">
          <span className="text-lg font-semibold">Actions</span>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg transition"
          >
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-[#0f172a] border border-slate-700 rounded-xl shadow-md overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-800 text-gray-300">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">PT</th>
              <th className="p-3">Package</th>
              <th className="p-3">Platform Fee</th>
              <th className="p-3">PT Earning</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr
                  key={t._id}
                  className="border-t border-slate-700 hover:bg-slate-800/50 transition"
                >
                  <td className="p-3">{t.student?.name}</td>
                  <td className="p-3">{t.pt?.name}</td>
                  <td className="p-3">{t.package?.name}</td>

                  <td className="p-3 text-orange-400 font-semibold">
                    {t.platformFee.toLocaleString("vi-VN")} đ
                  </td>

                  <td className="p-3 text-green-400 font-semibold">
                    {t.ptEarning?.toLocaleString("vi-VN") || 0} đ
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[t.status]
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>

                  <td className="p-3 text-gray-400">
                    {new Date(t.createdAt).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            page <= 1
              ? "bg-slate-700 text-gray-500 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-500"
          }`}
        >
          <FaChevronLeft /> Prev
        </button>

        <span className="text-gray-300">
          Page <b>{pagination.page}</b> / {pagination.totalPages}
        </span>

        <button
          disabled={page >= pagination.totalPages}
          onClick={() => setPage((p) => p + 1)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
            page >= pagination.totalPages
              ? "bg-slate-700 text-gray-500 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-500"
          }`}
        >
          Next <FaChevronRight />
        </button>
      </div>
    </div>
  );
}
