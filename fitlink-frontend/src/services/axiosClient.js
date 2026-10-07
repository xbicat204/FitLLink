// s@/services/axiosClient.js
import axios from "axios";
import { toast } from "react-toastify";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  withCredentials: true, // gửi cookie để backend đọc
});

// Xử lý lỗi tập trung
let isRedirected = false;

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.config?.skipErrorToast) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const message =
      error?.response?.data?.message || "Lỗi hệ thống. Vui lòng thử lại.";

    toast.error(`🔥 ${message}`);

    if ((status === 401 || status === 403) && !isRedirected) {
      isRedirected = true;
      // nếu bạn có logic redirect thì thêm ở đây
      // window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
