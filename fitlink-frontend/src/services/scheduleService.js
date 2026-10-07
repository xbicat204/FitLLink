import axios from "@/api/axiosClient";

// Preview slots (chưa lưu DB)
export const previewSchedule = async (params) => {
    const res = await axios.get('/pt/schedule/preview', { params: { ...params, _ts: Date.now() }, headers: { 'Cache-Control': 'no-cache' } });
    return res.data;
}

// Generate & save slots
export const generateSchedule = async (body) => {
    const res = await axios.post('/pt/schedule/generate', { ...body, _ts: Date.now() });
    return res.data;
}

export const previewScheduleDraft = async (payload) => {
    const res = await axios.post('/pt/schedule/preview-draft', payload)
    return (res.data);
}