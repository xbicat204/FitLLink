// s@/services/ptService.js

import axiosClient from "@/api/axiosClient";

// 1) Lấy danh sách PT
export const ptService = {
  getAllPTs: async () => {
    const res = await axiosClient.get("/admin/pts");
    return res.data;
  },
};

// 2) Lấy danh sách request từ student gửi tới PT
export const ptGetRequests = () =>
  axiosClient.get("/pt/requests");

// 3) APPROVE yêu cầu session
export const ptApprove = ({ sessionId, requestType }) =>
  axiosClient.post("/pt/approve", { sessionId, requestType });
// 4) REJECT yêu cầu session
export const ptReject = ({ sessionId, reason, requestType }) =>
  axiosClient.post("/pt/reject", { sessionId, reason, requestType });

// cập nhật thời gian buổi tập
export const ptUpdateSessionTime = (sessionId, startTime, endTime) =>
  axiosClient.put(`/pt/sessions/${sessionId}`, {
    startTime,
    endTime,
  });


// 5) Kiểm tra trạng thái verify của PT
export const isPTVerified = async () => {
  try {
    const res = await axiosClient.get("/pt/me/verification-status");
    return res.data;
  } catch (err) {
    console.error("❌ isPTVerified error:", err.response?.data || err.message);
    throw (
      err.response?.data || {
        message: "Failed to load PT verification status",
      }
    );
  }
};
