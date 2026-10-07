import React, { useEffect, useState } from "react";
import studentBookingService from "@/services/studentBookingService";
import { toast } from "react-toastify";

export default function MyRequests() {
    const [requests, setRequests] = useState([]);
    useEffect(() => {
        async function load() {
            try {
                const res = await studentBookingService.studentGetMyRequests();
                setRequests(res.data || res);
            } catch (err) {
                toast.error("Không thể tải danh sách yêu cầu");
            }
        }
        load();
    }, []);
    return (
        <div className="p-4">
            <h1 className="font-bold text-xl mb-3">Yêu cầu của tôi</h1>
            {requests.map((r) => (
                <div
                    key={r._id}
                    className="border p-3 rounded mb-3 bg-gray-50 shadow-sm"
                >
                    <p><strong>Loại yêu cầu:</strong> {r.requestType}</p>
                    <p><strong>Lý do:</strong> {r.requestReason}</p>
                    <p><strong>Trạng thái:</strong> {r.status}</p>
                </div>
            ))}
        </div>
    );
}
