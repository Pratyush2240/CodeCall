import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // sends cookies with every request (cookie-based auth)
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
