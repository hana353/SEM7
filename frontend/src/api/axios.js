import axios from "axios";
import { getToken } from "../auth/session";

const api = axios.create({
  baseURL: "http://localhost:3000/api"
});

// Interceptor: thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;