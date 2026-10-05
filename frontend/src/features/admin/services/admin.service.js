import apiClient from "../../../core/api/axios.config";

/**
 * @typedef {Object} AdminUser
 * @property {string} id
 * @property {string} email
 * @property {string} fullName
 * @property {'ADMIN' | 'TEACHER' | 'STUDENT'} role
 * @property {'ACTIVE' | 'PENDING_APPROVAL' | 'DISABLED'} status
 * @property {string} createdAt
 */

export const adminService = {
  /**
   * Obtiene la lista completa de usuarios registrados.
   * @returns {Promise<AdminUser[]>}
   */
  getUsers: async () => {
    // Si en tu backend la ruta fue registrada con prefijo admin, usa "/admin/users"
    const response = await apiClient.get("/users");

    // Desempaquetamos considerando la estructura { message, data } que usa tu API
    const users =
      response.data?.data?.users ||
      response.data?.data ||
      response.data?.users ||
      response.data;

    if (!Array.isArray(users)) {
      throw new Error(
        "La respuesta del servidor para usuarios no es un listado válido.",
      );
    }

    return users;
  },

  /**
   * Cambia el estado de un usuario (ej. de PENDING_APPROVAL a ACTIVE).
   * @param {string} userId
   * @param {'ACTIVE' | 'PENDING_APPROVAL' | 'DISABLED'} status
   * @returns {Promise<AdminUser>}
   */
  updateUserStatus: async (userId, status) => {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, {
      status,
    });
    return response.data?.data || response.data;
  },
};
