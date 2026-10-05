import { useState, useEffect, useCallback } from "react";
import { adminService } from "../services/admin.service";

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener la lista de usuarios desde la API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error al obtener la lista de usuarios.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar los usuarios automáticamente al montar el componente
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Cambiar estado del usuario y actualizar en el estado local de forma reactiva
  const changeUserStatus = async (userId, newStatus) => {
    try {
      const updatedUser = await adminService.updateUserStatus(
        userId,
        newStatus,
      );

      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === userId
            ? { ...u, status: updatedUser?.status || newStatus }
            : u,
        ),
      );
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Error al cambiar el estado del usuario.";
      alert(message);
    }
  };

  return { users, isLoading, error, refetch: fetchUsers, changeUserStatus };
};
