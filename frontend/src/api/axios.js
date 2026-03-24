import axios from "axios";
import { getToken } from "../auth/session";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;