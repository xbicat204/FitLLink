import axiosClient from "@/api/axiosClient";

const materialService = {
  async getMaterialsByPackage(packageId) {
    const res = await axiosClient.get(`/student/materials/${packageId}`);
    return res.data.data || [];
  },
};

export default materialService;
