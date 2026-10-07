import axiosClient from "@/api/axiosClient";

export const studentRequestChange = (payload) =>
    axiosClient.post("/session/student/request-change", payload);

export const studentRequestAbsent = (payload) =>
    axiosClient.post("/session/student/request-absent", payload);

export default {
    studentRequestChange,
    studentRequestAbsent,
};
