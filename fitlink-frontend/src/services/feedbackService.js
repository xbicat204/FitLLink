import axios from "@/api/axiosClient";

const createFeedback = async (payload) => {
  const response = await axios.post("/feedbacks", payload);
  return response.data;
};

const getFeedbackByPT = async (ptId) => {
  const response = await axios.get(`/feedbacks/pt/${ptId}`);
  return response.data;
};

const getMyFeedbacks = async ({ page = 1, limit = 10 } = {}) => {
  const response = await axios.get("/feedbacks/me", { params: { page, limit } });
  return {
    items: response.data?.data || [],
    pagination: response.data?.pagination || { page, pages: 1, total: 0, limit },
  };
};

const feedbackService = {
  createFeedback,
  getFeedbackByPT,
  getMyFeedbacks,
};

export default feedbackService;

