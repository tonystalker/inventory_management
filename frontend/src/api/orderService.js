import api from "./axiosInstance";

const BASE = "/orders";

export const orderService = {
  getAll:          ()              => api.get(BASE).then((r) => r.data),
  getById:         (id)            => api.get(`${BASE}/${id}`).then((r) => r.data),
  create:          (data)          => api.post(BASE, data).then((r) => r.data),
  remove:          (id)            => api.delete(`${BASE}/${id}`),

  // Status lifecycle
  updateStatus:    (id, status)    =>
    api.patch(`${BASE}/${id}/status`, { status }).then((r) => r.data),

  getNextStatuses: (id)            =>
    api.get(`${BASE}/${id}/status/next`).then((r) => r.data),
};
