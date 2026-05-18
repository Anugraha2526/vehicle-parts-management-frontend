import axiosClient from "./axiosClient";

// all parts api calls go through this module
export const partsApi = {
  // used by finance and sales modules
  list: () => axiosClient.get("/api/Parts"),

  // get all parts
  getAll: () => axiosClient.get("/api/Parts"),

  // get single part by id
  getById: (id) => axiosClient.get(`/api/Parts/${id}`),

  // get parts with stock below threshold
  getLowStock: () => axiosClient.get("/api/Parts/low-stock"),

  // create new part
  create: (data) => axiosClient.post("/api/Parts", data),

  // update existing part
  update: (id, data) => axiosClient.put(`/api/Parts/${id}`, data),

  // delete part
  delete: (id) => axiosClient.delete(`/api/Parts/${id}`),
};
