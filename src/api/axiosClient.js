import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach jwt token to every request if available
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("chitospare_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// redirect to login when token expires or is invalid
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("chitospare_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
