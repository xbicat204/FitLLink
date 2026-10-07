// s@/services/ptPackageService.js
import axiosClient from "@/api/axiosClient";

// 👉 Hàm dùng riêng cho màn Materials share
export async function getMyPackagesForShare() {
  // axiosClient đã có baseUR@/api và cookie sẵn
  const res = await axiosClient.get("/pt/me/packages");
  // backend trả { data: [...] }
  return res.data;          // => { data: list }
}
