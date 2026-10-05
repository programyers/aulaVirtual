import apiClient from "../../../core/api/axios.config";

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} fullName
 * @property {'ADMIN' | 'TEACHER' | 'STUDENT'} role
 * @property {'ACTIVE' | 'PENDING_APPROVAL' | 'DISABLED'} status
 */

/**
 * @typedef {Object} LoginResponse
 * @property {User} user
 * @property {string} token
 */

export const authService = {
  /**
   * Realiza la petición HTTP para autenticar al usuario y normaliza la respuesta.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<LoginResponse>}
   */
  login: async (email, password) => {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
    });

    const data = response.data;

    // 🔍 Imprimimos la respuesta en la consola del navegador para depurar
    console.log("Respuesta de la API (/auth/login):", data);

    // 1. Extraer Token (soporta token, access_token, accessToken, o anidado en data)
    const token =
      data?.token ||
      data?.access_token ||
      data?.accessToken ||
      data?.data?.token ||
      data?.data?.accessToken;

    // 2. Extraer Usuario (soporta data.user, data.data.user, o datos planos en la raíz)
    const rawUser =
      data?.user || data?.data?.user || (data?.role ? data : data?.data);
    const user = rawUser && rawUser.role ? rawUser : null;

    // 🛡️ Guardia de estructura
    if (!user || !user.role || !token) {
      console.error("Estructura de respuesta no reconocida:", {
        data,
        user,
        token,
      });
      throw new Error(
        "Formato de respuesta inválido: La API debe retornar token y datos de usuario con rol.",
      );
    }

    return { user, token };
  },
};
