// src/pages/pt/PTPackages.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PTMainLayout from "@/layouts/pt/PTMainLayout";
import { getMyPackages } from "@/services/packageService";

function Pagination({ page, pages, total, onChange, disabled }) {
  // tạo mảng số trang ngắn gọn: 1 ... p-1 p p+1 ... pages
  const windowed = useMemo(() => {
    const arr = [];
    const add = (n) => { if (n >= 1 && n <= pages && !arr.includes(n)) arr.push(n); };
    add(1); add(2); add(page - 1); add(page); add(page + 1); add(pages - 1); add(pages);
    return arr.sort((a, b) => a - b).reduce((acc, n, i, src) => {
      if (i > 0 && n - src[i - 1] > 1) acc.push("…");
      acc.push(n);
      return acc;
    }, []);
  }, [page, pages]);

  return (
    <div className="flex flex-col items-center justify-between gap-3 p-4 sm:flex-row">
      <div className="text-xs text-gray-400">Total: <span className="text-gray-200">{total}</span></div>
      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-50"
          onClick={() => onChange(page - 1)}
          disabled={disabled || page <= 1}
        >
          Prev
        </button>

        {windowed.map((it, idx) =>
          it === "…" ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-400">…</span>
          ) : (
            <button
              key={it}
              onClick={() => onChange(it)}
              disabled={disabled}
              className={`rounded-lg px-3 py-1.5 text-xs transition ${
                it === page
                  ? "bg-orange-500 text-white"
                  : "border border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              {it}
            </button>
          )
        )}

        <button
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg:white/10 hover:bg-white/10 disabled:opacity-50"
          onClick={() => onChange(page + 1)}
          disabled={disabled || page >= pages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function PTPackages() {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(true);

  const fetchData = async (page = 1, limitVal = limit) => {
    setLoading(true);
    try {
      const res = await getMyPackages({ page, limit: limitVal, isActive: true });
      setItems(res?.data || []);
      setPagination(res?.pagination || { page, pages: 1, total: 0 });
    } catch (e) {
      console.error("Load packages failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const onPageChange = (p) => {
    if (p < 1 || p > (pagination?.pages || 1)) return;
    fetchData(p);
  };

  return (
    <PTMainLayout>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Packages</h1>
        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-400">
            Page size{" "}
            <select
              className="ml-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-200"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              disabled={loading}
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <Link
            to="/pt/packages/new"
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Create package
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5">
        {loading ? (
          <div className="p-6 text-sm text-gray-300">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-sm text-gray-300">No packages yet.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-400">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Sessions</th>
                    <th className="px-3 py-2 font-medium">Duration</th>
                    <th className="px-3 py-2 font-medium">Price</th>
                    <th className="px-3 py-2 font-medium">Active</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((p) => (   
                    <tr key={p._id} className="border-t border-white/5">
                      <td className="px-3 py-2 text-white">{p.name}</td>
                      <td className="px-3 py-2 text-gray-300">{p.totalSessions}</td>
                      <td className="px-3 py-2 text-gray-300">{p.durationDays} days</td>
                      <td className="px-3 py-2 text-gray-300">{(p.price || 0).toLocaleString()}₫</td>
                      <td className="px-3 py-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            p.isActive ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {p.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">                                          
                        <Link
                          to={`/pt/packages/${p._id}`}
                          className="rounded-lg border border-white/10 px-3 py-1 text-xs text-gray-300 hover:bg-white/10"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <Pagination
              page={pagination?.page || 1}
              pages={pagination?.pages || 1}
              total={pagination?.total || 0}
              onChange={onPageChange}
              disabled={loading}
            />
          </>
        )}
      </div>
    </PTMainLayout>
  );
}
