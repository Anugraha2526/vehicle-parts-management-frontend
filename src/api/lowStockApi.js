import axiosClient from "./axiosClient";

export const lowStockApi = {
  list: ({ scan = true, threshold = 10 } = {}) =>
    axiosClient.get("/api/lowstock/alerts", { params: { scan, threshold } }),
  acknowledge: (alertId) => axiosClient.post(`/api/lowstock/alerts/${alertId}/acknowledge`),
};
