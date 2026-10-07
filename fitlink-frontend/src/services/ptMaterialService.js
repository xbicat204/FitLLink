import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
const MATERIALS_URL = `${API_BASE}/api/pt/materials`;

export async function getMyMaterials(params = {}) {
  const res = await axios.get(MATERIALS_URL, {
    params,
    withCredentials: true,
  });
  return res.data;
}

export async function createMaterial(payload) {
  const res = await axios.post(MATERIALS_URL, payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function updateMaterial(id, payload) {
  const res = await axios.put(`${MATERIALS_URL}/${id}`, payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function deleteMaterial(id) {
  const res = await axios.delete(`${MATERIALS_URL}/${id}`, {
    withCredentials: true,
  });
  return res.data;
}

export async function shareMaterial(id, packageIds) {
  const res = await axios.post(
    `${MATERIALS_URL}/${id}/share`,
    { packageIds },
    { withCredentials: true }
  );
  return res.data;
}
