// s@/services/sessionService.js
import axiosClient from "@/api/axiosClient";


// ✅ Lấy toàn bộ session của PT hiện tại
export const getMySessions = async () => {
  const res = await axiosClient.get('/sessions/pt')
  return res.data // { success, data: [...] }
}

// ✅ Tạo buổi tập mới (ít khi dùng trong giao diện PT, nhưng vẫn giữ)
export const createSession = async (payload) => {
  const res = await axiosClient.post('/sessions', payload)
  return res.data
}

// ✅ Cập nhật trạng thái hoặc ghi chú buổi tập (đường dẫn đúng theo backend)
export const updateSession = async (id, payload) => {
  const res = await axiosClient.put(`/sessions/${id}/status`, payload)
  return res.data
}

// ✅ Xóa buổi tập (nếu có chức năng)
export const deleteSession = async (id) => {
  const res = await axiosClient.delete(`/sessions/${id}`)
  return res.data
}


// ✅ Alias cho updateSessionStatus (giữ lại cho tương thích cũ)
export const updateSessionStatus = async (id, payload) => {
  const res = await axiosClient.put(`/sessions/${id}/status`, payload)
  return res.data
}

