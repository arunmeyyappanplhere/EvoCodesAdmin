import axios from "axios";

// Update this to match wherever your backend is actually running/deployed
const API_BASE_URL = "http://localhost:8000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // equivalent of fetch's credentials: "include" — sends/receives the httpOnly cookie
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 5000, // 5 second timeout to prevent hanging
});

// Centralized handling of expired/invalid sessions.
// If any protected request comes back 401, it means the cookie is missing/expired.
// We dispatch a custom event that the AuthContext can listen to and clear auth state.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired or not authenticated.");
      // Dispatch custom event for auth state cleanup
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
