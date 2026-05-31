import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Global response error interceptor
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || "An unexpected error occurred.";
    return Promise.reject(new Error(message));
  }
);

export default api;
