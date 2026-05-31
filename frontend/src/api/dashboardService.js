import api from "./axiosInstance";

export const dashboardService = {
  getStats: () => api.get("/dashboard").then((r) => r.data),
};
