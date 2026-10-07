import axiosClient from "@/api/axiosClient";

export const feedbackApi = {
  create: async (data) => {
    const response = await axiosClient.post("/feedbacks", data);
    return response.data;
  },
  getByPT: async (ptId) => {
    const response = await axiosClient.get(`/feedbacks/pt/${ptId}`);
    return response.data;
  },
};
