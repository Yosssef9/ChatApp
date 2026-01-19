import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor لتجديد Access Token تلقائي
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // إذا انتهت صلاحية الـ access token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 🔹 طلب refresh token
        await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refreshAccessToken`,
          { withCredentials: true } // هنا يروح كـ config
        );

        // 🔹 بعد التجديد، أعد الطلب الأصلي
        return api(originalRequest);
      } catch (err) {
        console.error("Refresh token failed", err);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
