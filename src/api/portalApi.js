import axiosClient from "./axiosClient";

// All portal endpoints are scoped to the authenticated customer via JWT.
export const portalApi = {
  // Appointments
  getAppointments: () => axiosClient.get("/api/Appointments"),
  bookAppointment: (payload) => axiosClient.post("/api/Appointments", payload),

  // Reviews
  getReviews: () => axiosClient.get("/api/Reviews"),
  submitReview: (payload) => axiosClient.post("/api/Reviews", payload),

  // Part requests
  getPartRequests: () => axiosClient.get("/api/PartRequests"),
  requestPart: (payload) => axiosClient.post("/api/PartRequests", payload),

  // Service history
  getServiceHistory: () => axiosClient.get("/api/ServiceHistory"),
};
