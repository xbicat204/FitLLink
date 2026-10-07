import { useEffect, useMemo, useState } from "react";
import PTMainLayout from "@/layouts/pt/PTMainLayout";
import feedbackService from "@/services/feedbackService";
import avt from "@/assets/images/avt.png";

function Pagination({ page, pages, total, onChange, disabled }) {
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
            <div className="text-xs text-gray-400">
                Total: <span className="text-gray-200">{total}</span>
            </div>
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
                            className={`rounded-lg px-3 py-1.5 text-xs transition ${it === page
                                    ? "bg-orange-500 text-white"
                                    : "border border-white/10 text-gray-300 hover:bg-white/10"
                                }`}
                        >
                            {it}
                        </button>
                    )
                )}

                <button
                    className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 disabled:opacity-50"
                    onClick={() => onChange(page + 1)}
                    disabled={disabled || page >= pages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

const Stars = ({ rating = 0 }) => (
    <span className="text-yellow-300">
        {"★".repeat(rating)}
        <span className="text-gray-500">{"★".repeat(Math.max(0, 5 - rating))}</span>
    </span>
);

export default function PTFeedbackPage() {
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(true);

    const fetchData = async (page = 1, limitVal = limit) => {
        setLoading(true);
        try {
            const { items: nextItems, pagination: nextPagination } =
                await feedbackService.getMyFeedbacks({ page, limit: limitVal });

            setItems(nextItems);
            setPagination(nextPagination);
        } catch (e) {
            console.error("Load feedbacks failed:", e);
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
                <h1 className="text-xl font-semibold text-white">Feedback</h1>
                <label className="text-xs text-gray-400">
                    Page size{" "}
                    <select
                        className="ml-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-200"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        disabled={loading}
                    >
                        {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </label>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5">
                {loading ? (
                    <div className="p-6 text-sm text-gray-300">Loading...</div>
                ) : items.length === 0 ? (
                    <div className="p-6 text-sm text-gray-300">No feedback yet.</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="text-gray-400">
                                    <tr>
                                        <th className="px-3 py-2 font-medium">Student</th>
                                        <th className="px-3 py-2 font-medium">Name</th>

                                        <th className="px-3 py-2 font-medium">Rating</th>
                                        <th className="px-3 py-2 font-medium">Comment</th>
                                        <th className="px-3 py-2 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((fb) => {
                                        const studentName = fb?.student?.name || "—";
                                        const studentAvt = fb?.student?.avatar || avt;

                                        return (
                                            <tr key={fb._id} className="border-t border-white/5">
                                                <td className="px-3 py-2">
                                                    <img
                                                        src={studentAvt}
                                                        alt={studentName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                </td>

                                                <td className="px-3 py-2 text-white">{studentName}</td>

                                                <td className="px-3 py-2">
                                                    <Stars rating={fb?.rating || 0} />
                                                </td>
                                                <td className="px-3 py-2 text-gray-300 max-w-[360px] truncate" title={fb?.comment}>
                                                    {fb?.comment || "—"}
                                                </td>
                                                <td className="px-3 py-2 text-gray-300">
                                                    {fb?.createdAt ? new Date(fb.createdAt).toLocaleString("vi-VN") : "—"}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

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
