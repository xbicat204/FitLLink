import axiosClient from "@/api/axiosClient";

// 🔍 Search PTs with filters and pagination
export const searchPTs = async (params = {}) => {
  try {
    const res = await axiosClient.get('/search/pts', { params })
    return res.data
  } catch (err) {
    console.error('Error fetching PT list:', err)
    throw err
  }
}

// 🔎 Get detail of a single PT by ID
export const getPTDetailById = async (id) => {
  try {
    const res = await axiosClient.get(`/search/pts/${id}`)
    return res.data
  } catch (err) {
    console.error('Error fetching PT detail:', err)
    throw err
  }
}
