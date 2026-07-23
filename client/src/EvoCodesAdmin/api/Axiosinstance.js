import axios from "axios";

// Update this to match wherever your backend is actually running/deployed
const API_BASE_URL = "http://localhost:8000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // equivalent of fetch's credentials: "include" — sends/receives the httpOnly cookie
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: centralize handling of expired/invalid sessions.
// If any protected request comes back 401, it means the cookie is missing/expired —
// useful hook point to force a redirect to the sign-in screen if you want that later.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired or not authenticated.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;