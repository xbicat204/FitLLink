// services/studentPackageService.js (Cập nhật sử dụng axiosClient)

import axiosClient from '@/api/axiosClient' // Import client đã được cấu hình

// KHÔNG CẦN định nghĩa API_BASE_URL nữa

/**
 * Lấy tất cả các gói tập đã mua của một học viên.
 * Endpoint: GE@/api/student-packages/student/:studentId
 * @param {string} studentId - ID của học viên.
 * @returns {Promise<Array>} Danh sách các StudentPackage.
 */
export async function getStudentPackages(studentId) {
  try {
    // Đường dẫn tương đối: /student-packages/student/:studentId
    const response = await axiosClient.get(
      `/student-packages/student/${studentId}`
    )
    return response.data
  } catch (error) {
    // Interceptor đã hiển thị toast
    throw error
  }
}

/**
 * Lấy chi tiết một gói tập cụ thể.
 * Endpoint: GE@/api/student-packages/:id
 * @param {string} packageId - ID của StudentPackage.
 * @returns {Promise<object>} Chi tiết StudentPackage.
 */
export async function getPackageDetails(packageId) {
  try {
    // Đường dẫn tương đối: /student-packages/:id
    const response = await axiosClient.get(`/student-packages/${packageId}`)
    return response.data
  } catch (error) {
    // Interceptor đã hiển thị toast
    throw error
  }
}
