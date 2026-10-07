import axiosClient from '@/api/axiosClient'

export const studentService = {
  async getAllStudents() {
    try {
      const res = await axiosClient.get('/admin/students')
      return res.data
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách student:', error)
      throw error
    }
  },

  async getStudentProfileById(studentId) {
    try {
      const res = await axiosClient.get(`/student/${studentId}/profile`)
      return res.data
    } catch (error) {
      console.error('❌ Lỗi khi lấy profile student:', error)
      throw error
    }
  },

  /** Lấy defaultLocation theo studentId */
  async getDefaultLocationByStudentId(studentId) {
    try {
      const res = await axiosClient.get(
        `/student/${studentId}/default-location`
      )
      return res.data // backend trả { success, data: {type:'Point', coordinates:[lng,lat]} }
    } catch (error) {
      console.error('❌ Lỗi khi lấy defaultLocation:', error)
      throw error
    }
  },

  /** Cập nhật hoặc tạo defaultLocation cho user đang đăng nhập */
  async upsertDefaultLocation({ lng, lat }) {
    try {
      const res = await axiosClient.put(`/student/default-location`, {
        lng,
        lat
      })
      return res.data // backend trả { success, data: { defaultLocation } }
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật defaultLocation:', error)
      throw error
    }
  }
}
