// s@/services/ptStudentService.js
import axios from "@/api/axiosClient";

export const listMyStudents = async (params = {}) => {
  const res = await axios.get('/pt/students', { params })
  return res.data
}

export const listSessionsByStudentPackage = async (studentPackageId) => {
  const res = await axios.get(`/pt/students/${studentPackageId}/sessions`)
  return res.data
}

export const createSessionForStudentPackage = async (studentPackageId, payload) => {
  const res = await axios.post(`/pt/students/${studentPackageId}/sessions`, payload)
  return res.data
}
