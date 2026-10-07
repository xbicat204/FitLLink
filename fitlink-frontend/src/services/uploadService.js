import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function uploadMaterialFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${API_BASE}/api/pt/materials/upload`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,      // nếu backend dùng cookie
    }
  );

  return res.data;
}
