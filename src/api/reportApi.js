import axiosClient from "./axiosClient";

export const reportApi = {
  financial: (type) => axiosClient.get("/api/reports/financial", { params: { type } }),
};
