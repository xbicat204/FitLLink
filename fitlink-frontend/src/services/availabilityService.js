// s@/services/availabilityService.js
import axiosClient from "@/api/axiosClient";

const availabilityService = {
    /**
     * Lấy danh sách block khả dụng của PT
     * payload = { ptId, packageId, pattern }
     */
    getBlocks: async (payload) => {
        const res = await axiosClient.post("/availability/get-blocks", payload);
        return res.data;
    },

    /**
     * Lấy toàn bộ lịch rảnh của PT theo ngày cụ thể
     * payload = { ptId, date }
     */
    getAvailableByDate: async (payload) => {
        const res = await axiosClient.post("/availability/by-date", payload);
        return res.data;
    },

    /**
     * Kiểm tra slot có trống không
     * payload = { ptId, startTime, endTime }
     */
    checkSlot: async (payload) => {
        const res = await axiosClient.post("/availability/check-slot", payload);
        return res.data;
    },
};

export default availabilityService;
