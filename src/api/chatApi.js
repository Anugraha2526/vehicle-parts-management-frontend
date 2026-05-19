import axiosClient from "./axiosClient";

const chatApi = {
  ask: (message) => axiosClient.post("/api/chat/ask", { message }).then((res) => res.data),
};

export default chatApi;
