import React, { useState } from "react";
import studentBookingService from "@/services/studentBookingService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function RequestAbsent({ booking }) {
    const nav = useNavigate();
    const [reason, setReason] = useState("");

    const submit = async () => {
        if (!reason) return toast.error("Hãy nhập lý do");

        try {
            await studentBookingService.studentRequestAbsent({
                bookingId: booking._id,
                reason
            });

            toast.success("Gửi yêu cầu xin nghỉ thành công!");
            nav("/student/requests");

        } catch (err) {
            // axiosClient đã xử lý lỗi
        }
    };

    return (
        <div className="p-4">
            <h1 className="font-bold text-xl mb-3">Yêu cầu xin nghỉ</h1>

            <label>Lý do:</label>
            <textarea
                className="border p-2 w-full rounded mb-3"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
            />

            <button
                onClick={submit}
                className="bg-red-600 text-white px-4 py-2 rounded"
            >
                Gửi yêu cầu
            </button>
        </div>
    );
}
