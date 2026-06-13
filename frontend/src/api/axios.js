import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // sends cookies with every request (cookie-based auth)
});

/* ─── Request Interceptor ────────────────────────────
   Attaches the stored access token as a Bearer header
   on every outgoing request.
──────────────────────────────────────────────────── */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ─── Response Interceptor ───────────────────────────
   Passthrough today — extend here for:
   · 401 → token refresh / redirect to login
   · 403 → permission denied toast
   · 5xx → global error boundary notification
──────────────────────────────────────────────────── */
API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default API;

