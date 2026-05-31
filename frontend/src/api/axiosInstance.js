import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Auto-append trailing slash to base resource paths to completely prevent 307 CORS Redirects
api.interceptors.request.use((config) => {
  if (config.url) {
    const basePaths = ["products", "customers", "orders", "dashboard"];
    const urlLower = config.url.toLowerCase().trim();
    
    // Check if the request URL is exactly one of the base paths or starts with it followed by query params
    const isBase = basePaths.some(path => urlLower === path || urlLower.startsWith(path + "?"));
    
    if (isBase) {
      const [path, query] = config.url.split("?");
      if (!path.endsWith("/")) {
        config.url = path + "/" + (query ? "?" + query : "");
      }
    }
  }
  return config;
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
