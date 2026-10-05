import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor de Peticiones: Inyección del token JWT en cada request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Interceptor de Respuestas: Control de seguridad y expulsión por 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response && error.response.status === 401;
    const isLoginRoute = window.location.pathname === "/login";

    if (isUnauthorized && !isLoginRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default apiClient;
