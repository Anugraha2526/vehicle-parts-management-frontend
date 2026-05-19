import axiosClient from "./axiosClient";

export const reportApi = {
  financial: (type, date) =>
    axiosClient.get("/api/reports/financial", {
      params: {
        type,
        ...(date ? { date } : {}),
      },
    }),
};
