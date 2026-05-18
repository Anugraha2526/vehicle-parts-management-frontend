import axiosClient from "./axiosClient";

export const purchaseApi = {
  create: (payload) => axiosClient.post("/api/purchases/invoice", payload),
};
