import axiosClient from "@/api/axiosClient";

export const getMyPTs = async () => {
  const response = await axiosClient.get("/messages/my-pts");
  return response.data?.data || [];
};

export const getMyStudents = async () => {
  const response = await axiosClient.get("/pt/me/students");
  return response.data?.data || [];
};

export const getMessagesByRoom = async (roomId) => {
  const response = await axiosClient.get(`/messages/${roomId}`);
  return response.data?.data || [];
};

export const sendMessageByRoom = async (payload) => {
  const response = await axiosClient.post("/messages", payload);
  return response.data?.data;
};
