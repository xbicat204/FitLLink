import axiosClient from "@/api/axiosClient";

export const messageApi = {
  getMessages: async (chatId) => {
    const response = await axiosClient.get(`/messages/${chatId}`);
    return response.data?.data || [];
  },
  sendMessage: async (data) => {
    const response = await axiosClient.post("/messages", data);
    return response.data?.data;
  },
};
