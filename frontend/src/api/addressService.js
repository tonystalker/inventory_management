import api from "./axiosInstance";

export const addressService = {
  getByCustomer: (customerId) => api.get(`/customers/${customerId}/addresses`).then((r) => r.data),
  create:        (customerId, data) => api.post(`/customers/${customerId}/addresses`, data).then((r) => r.data),
  update:        (id, data) => api.put(`/addresses/${id}`, data).then((r) => r.data),
  remove:        (id) => api.delete(`/addresses/${id}`),
};
