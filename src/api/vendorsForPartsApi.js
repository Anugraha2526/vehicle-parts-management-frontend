import axiosClient from "./axiosClient";

// fetches vendor list for the parts form dropdown
export const vendorsForPartsApi = {
  getAll: () => axiosClient.get("/api/Vendors"),
};
