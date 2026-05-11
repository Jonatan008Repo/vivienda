import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const proyectosAPI = {
  getAll: (filtros = {}) => api.get('/proyectos', { params: filtros }),
  getById: (id) => api.get(`/proyectos/${id}`),
  create: (data) => api.post('/proyectos', data),
  update: (id, data) => api.put(`/proyectos/${id}`, data),
  delete: (id) => api.delete(`/proyectos/${id}`)
};

export default api;
