import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7294',
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

// redirect to login when token expires during a user action (mutation)
// For GET data-loading requests (parts list, customers list, etc.), let the  
// component's own catch block handle the error and show a message instead of
// silently bouncing the user to the login page.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const method = error.config?.method?.toLowerCase();
      if (method !== 'get') {
        // session expired during a real user action — redirect to login
        localStorage.removeItem("chitospare_token");
        window.location.href = "/login";
      }
      // for GET 401s — just reject the promise, let the component show an error
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
