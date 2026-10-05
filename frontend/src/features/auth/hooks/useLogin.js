import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../../../core/store/authStore";

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  const executeLogin = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Consumir el servicio HTTP
      const data = await authService.login(email, password);

      // Normalizar la respuesta por si el backend devuelve { user, token } o { data: { user, token } } o { role, token, ... }
      const user = data?.user || data?.data?.user || (data?.role ? data : null);
      const token = data?.token || data?.access_token || data?.data?.token;

      if (!user || !user.role) {
        throw new Error(
          "La respuesta del servidor no contiene los datos de usuario o rol esperados.",
        );
      }

      // 2. Guardar sesión globalmente
      loginAction(user, token);

      // 3. Redirigir según el rol
      const userRole = user.role;
      if (userRole === "ADMIN") {
        navigate("/admin/users");
      } else if (userRole === "TEACHER") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error al intentar iniciar sesión. Verifica tus credenciales.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { executeLogin, isLoading, error };
};
