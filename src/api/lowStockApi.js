import axiosClient from "./axiosClient";

export const lowStockApi = {
  list: ({ scan = true, threshold = 10 } = {}) =>
    axiosClient.get("/api/lowstock/alerts", {
      params: scan ? { scan: true, threshold } : { scan: false },
    }),
  acknowledge: (alertId) => axiosClient.post(`/api/lowstock/alerts/${alertId}/acknowledge`),
};
