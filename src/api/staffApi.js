import axiosClient from "./axiosClient";

// all staff api calls go through this module
export const staffApi = {
  // get all staff members
  getAll: () => axiosClient.get("/api/Staff"),

  // get single staff member by id
  getById: (id) => axiosClient.get(`/api/Staff/${id}`),

  // register new staff member
  create: (data) => axiosClient.post("/api/Staff", data),

  // update existing staff member
  update: (id, data) => axiosClient.put(`/api/Staff/${id}`, data),

  // delete staff member
  delete: (id) => axiosClient.delete(`/api/Staff/${id}`),

  // toggle staff active status
  toggleStatus: (id) => axiosClient.patch(`/api/Staff/${id}/toggle-status`),
};
