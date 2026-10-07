import React, { useEffect, useState } from "react";
import bookingPTService from "@/services/pt/bookingPTService";
import { toast } from "react-toastify";
import socket from "@/socket"; // dùng socket có sẵn nếu cần

const BookingRequests = () => {
    const [requests, setRequests] = useState([]);
    const [rejectPopup, setRejectPopup] = useState(null); // {bookingId}
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        loadRequests();

        // 🔔 Realtime: nhận yêu cầu mới từ student
        socket.on("booking:new_request", () => {
            loadRequests();
        });

        return () => {
            socket.off("booking:new_request");
        };
    }, []);

    const loadRequests = async () => {
        try {
            const res = await bookingPTService.getPTRequests();
            setRequests(res.data);
        } catch (err) {
            toast.error("Lỗi tải danh sách yêu cầu");
        }
    };

    const onApprove = async (id) => {
        try {
            await bookingPTService.approveRequest(id);
            toast.success("Đã duyệt yêu cầu!");
            loadRequests();
        } catch (err) {
            toast.error("Lỗi duyệt yêu cầu");
        }
    };

    const onRejectConfirm = async () => {
        try {
            await bookingPTService.rejectRequest(
                rejectPopup.bookingId,
                rejectReason
            );

            toast.success("Đã từ chối yêu cầu");
            setRejectPopup(null);
            setRejectReason("");
            loadRequests();
        } catch (err) {
            toast.error("Lỗi từ chối yêu cầu");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">📩 Yêu cầu thay đổi lịch tập</h2>

            {requests.length === 0 && (
                <p className="text-gray-500">Không có yêu cầu nào.</p>
            )}

            <div className="space-y-4">
                {requests.map((rq) => (
                    <div
                        key={rq._id}
                        className="bg-white p-4 rounded-xl shadow flex justify-between items-start border border-gray-200"
                    >
                        <div>
                            <p className="font-semibold text-blue-600">
                                {rq.requestType === "change"
                                    ? "🔄 Đổi lịch tập"
                                    : "🚫 Xin nghỉ buổi tập"}
                            </p>

                            <p className="mt-1">
                                <strong>Học viên:</strong> {rq.studentName}
                            </p>

                            <p>
                                <strong>Buổi hiện tại:</strong> {rq.date} — {rq.slot}
                            </p>

                            {rq.requestType === "change" && (
                                <p>
                                    <strong>Buổi đề xuất mới:</strong> {rq.requestNewDate} —{" "}
                                    {rq.requestNewSlot}
                                </p>
                            )}

                            {rq.note && (
                                <p className="mt-2 text-gray-600 italic">
                                    Ghi chú: {rq.note}
                                </p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                className="bg-green-600 text-white px-4 py-2 rounded-lg"
                                onClick={() => onApprove(rq._id)}
                            >
                                Duyệt
                            </button>

                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-lg"
                                onClick={() => setRejectPopup({ bookingId: rq._id })}
                            >
                                Từ chối
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* POPUP từ chối yêu cầu */}
            {rejectPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40">
                    <div className="bg-white p-6 rounded-xl shadow-xl w-96">
                        <h3 className="font-semibold text-lg mb-2">Lý do từ chối</h3>

                        <textarea
                            rows="3"
                            className="w-full border rounded p-2"
                            placeholder="Nhập lý do…"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />

                        <div className="flex justify-end mt-4 gap-2">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded"
                                onClick={() => setRejectPopup(null)}
                            >
                                Huỷ
                            </button>

                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded"
                                onClick={onRejectConfirm}
                            >
                                Xác nhận từ chối
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingRequests;
