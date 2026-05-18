import axiosClient from "./axiosClient";

// all vendor api calls go through this module
export const vendorApi = {
  // get all vendors
  getAll: () => axiosClient.get("/api/Vendors"),

  // get single vendor by id
  getById: (id) => axiosClient.get(`/api/Vendors/${id}`),

  // create new vendor
  create: (data) => axiosClient.post("/api/Vendors", data),

  // update existing vendor
  update: (id, data) => axiosClient.put(`/api/Vendors/${id}`, data),

  // delete vendor
  delete: (id) => axiosClient.delete(`/api/Vendors/${id}`),
};
