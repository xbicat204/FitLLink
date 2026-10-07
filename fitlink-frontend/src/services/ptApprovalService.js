// s@/services/ptApprovalService.js
import axios from "@/api/axiosClient";

// Gửi request duyệt hồ sơ PT
export const submitReview = async () => {
  const res = await axios.post('/pt/profile/submit-review')
  return res.data
}

// Xem danh sách các request đã gửi (có thể filter theo status)
export const listMyRequests = async (params = {}) => {
  const res = await axios.get('/pt/profile/requests', { params })
  return res.data
}

// Lấy request gần nhất
export const getMyLatestRequest = async () => {
  const res = await axios.get('/pt/profile/requests/latest')
  return res.data
}

// Huỷ yêu cầu đang pending
export const cancelMyPending = async () => {
  const res = await axios.post('/pt/profile/cancel-pending')
  return res.data
}

export const ptGetMyLatestRequest = async () => {
  const res = await axios.get('/pt/approval-requests/my')
}

export default {
  submitReview,
  listMyRequests,
  getMyLatestRequest,
  cancelMyPending
}
