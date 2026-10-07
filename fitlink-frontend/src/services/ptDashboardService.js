// s@/services/ptDashboardService.js
import axiosClient from "@/api/axiosClient";

export async function getPTDashboardStats() {
  const res = await axiosClient.get("/pt/me/dashboard");
  // BE trả { success, data }
  return res.data.data;
}