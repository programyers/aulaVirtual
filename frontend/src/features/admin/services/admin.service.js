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
    const response = await apiClient.get("/users");

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
    // Correcto: se elimina el prefijo '/admin' extra para coincidir con Express
    const response = await apiClient.patch(`/users/${userId}/status`, {
      status,
    });
    return response.data?.data || response.data;
  },
};