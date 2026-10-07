// s@/services/packageService.js
import axios from "@/api/axiosClient";

// PT: lấy danh sách gói của chính mình (có phân trang, filter isActive)
export const getMyPackages = async ({ page = 1, limit = 10, isActive } = {}) => {
  const params = { page, limit }
  if (typeof isActive !== 'undefined') params.isActive = String(isActive)
  const res = await axios.get('/pt/packages', { params })
  return res.data // { success, data, pagination }
}

// PT: tạo gói mới
export const createPackage = async (payload) => {
  // payload: { name, description?, price?, totalSessions, durationDays, visibility?, tags? }
  const res = await axios.post('/pt/packages', payload)
  return res.data
}

// PT: lấy chi tiết 1 gói (của mình)
export const getPackageById = async (packageId) => {
  const res = await axios.get(`/pt/packages/${packageId}`)
  return res.data
}

// PT: cập nhật gói
export const updatePackage = async (packageId, payload) => {
  const res = await axios.put(`/pt/packages/${packageId}`, payload)
  return res.data
}

// PT: ẩn gói (soft delete)
export const softDeletePackage = async (packageId) => {
  const res = await axios.delete(`/pt/packages/${packageId}`)
  return res.data
}

// PT: xoá hẳn gói (hard delete)
export const hardDeletePackage = async (packageId) => {
  const res = await axios.delete(`/pt/packages/${packageId}/hard`)
  return res.data
}

// PUBLIC: student xem gói của 1 PT (không cần cookie nếu server không yêu cầu)
export const getPackagesByPTPublic = async (ptId, { page = 1, limit = 12 } = {}) => {
  const res = await axios.get(`/pt/${ptId}/packages`, { params: { page, limit } })
  return res.data
}

// Optionally export default object cho tiện import *
const packageService = {
  getMyPackages,
  createPackage,
  getPackageById,
  updatePackage,
  softDeletePackage,
  hardDeletePackage,
  getPackagesByPTPublic
}
export default packageService
