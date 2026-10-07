// services/transactionService.js (FINAL FIXED)

import axiosClient from "@/api/axiosClient";

/**
 * Gọi API Backend để khởi tạo và hoàn tất giao dịch nội bộ.
 * Endpoint: POS@/api/transactions/initiate
 */
export async function initiatePayment(transactionDetails) {
  console.log(
    "Đang gọi API Backend để khởi tạo và hoàn tất giao dịch nội bộ..."
  );

  try {
    const response = await axiosClient.post(
      "/transactions/initiate",
      transactionDetails
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}
export const transactionService = {
  async getTransactions(status = "paid", page = 1, limit = 10) {
    try {
      const res = await axiosClient.get("/admin/transactions", {
        params: { status, page, limit },
      });
      return res.data;
    } catch (err) {
      console.error("❌ Error fetching transactions:", err);
      throw err;
    }
  },
};
