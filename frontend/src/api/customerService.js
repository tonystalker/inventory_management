import api from "./axiosInstance";

const BASE = "/customers";

export const customerService = {
  getAll:  ()     => api.get(BASE).then((r) => r.data),
  getById: (id)   => api.get(`${BASE}/${id}`).then((r) => r.data),
  create:  (data) => api.post(BASE, data).then((r) => r.data),
  remove:  (id)   => api.delete(`${BASE}/${id}`),
};
