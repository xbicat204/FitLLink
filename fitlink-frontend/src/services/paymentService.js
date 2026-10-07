import axios from "@/api/axiosClient";

// 1) init transaction cho 1 package
export async function initStudentPackageCheckout(payload) {
  const { data } = await axios.post(`/student/packages/checkout/init`, payload)
  return data // { success, data: { transactionId, status, package } }
}

// 2) tạo link thanh toán PayOS cho 1 transaction
export async function payTransaction(transactionId) {
  const { data } = await axios.post(`/student/transactions/${transactionId}/pay`)
  return data // { success, data: { checkoutUrl, orderCode, transactionId, status } }
}

// 3) confirm sau redirect từ PayOS
export async function confirmPayment(orderCode) {
  const { data } = await axios.post(`/student/payment/confirm`, { orderCode })
  return data // { success, data: { status: 'paid' | 'cancelled' | 'pending' } }
}

// (optional) polling
export async function getTransaction(transactionId) {
  const { data } = await axios.get(`/student/transactions/${transactionId}`)
  return data
}
