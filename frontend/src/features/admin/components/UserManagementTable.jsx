import { useAdminUsers } from "../hooks/useAdminUsers";

export const UserManagementTable = () => {
  const { users, isLoading, error, changeUserStatus } = useAdminUsers();

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#4b5563" }}>
        Cargando usuarios... ⏳
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#fee2e2",
          color: "#991b1b",
          padding: "1rem",
          borderRadius: "6px",
          margin: "2rem",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1000px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ color: "#1f2937", marginBottom: "1.5rem" }}>
        Gestión de Usuarios
      </h2>

      <div
        style={{
          overflowX: "auto",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f9fafb",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <th style={{ padding: "0.75rem 1rem", color: "#374151" }}>
                Nombre
              </th>
              <th style={{ padding: "0.75rem 1rem", color: "#374151" }}>
                Email
              </th>
              <th style={{ padding: "0.75rem 1rem", color: "#374151" }}>Rol</th>
              <th style={{ padding: "0.75rem 1rem", color: "#374151" }}>
                Estado
              </th>
              <th
                style={{
                  padding: "0.75rem 1rem",
                  color: "#374151",
                  textAlign: "center",
                }}
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "1.5rem",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    {user.fullName || user.full_name}
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>{user.email}</td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        backgroundColor:
                          user.role === "ADMIN"
                            ? "#dbeafe"
                            : user.role === "TEACHER"
                              ? "#f3e8ff"
                              : "#e0e7ff",
                        color:
                          user.role === "ADMIN"
                            ? "#1e40af"
                            : user.role === "TEACHER"
                              ? "#6b21a8"
                              : "#3730a3",
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        backgroundColor:
                          user.status === "ACTIVE"
                            ? "#dcfce7"
                            : user.status === "PENDING_APPROVAL"
                              ? "#fef3c7"
                              : "#fee2e2",
                        color:
                          user.status === "ACTIVE"
                            ? "#166534"
                            : user.status === "PENDING_APPROVAL"
                              ? "#92400e"
                              : "#991b1b",
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.75rem 1rem", textAlign: "center" }}>
                    {user.status === "PENDING_APPROVAL" && (
                      <button
                        onClick={() => changeUserStatus(user.id, "ACTIVE")}
                        style={{
                          backgroundColor: "#16a34a",
                          color: "white",
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: "600",
                        }}
                      >
                        Aprobar Docente
                      </button>
                    )}

                    {user.status === "ACTIVE" && user.role !== "ADMIN" && (
                      <button
                        onClick={() => changeUserStatus(user.id, "DISABLED")}
                        style={{
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        Desactivar
                      </button>
                    )}

                    {user.status === "DISABLED" && (
                      <button
                        onClick={() => changeUserStatus(user.id, "ACTIVE")}
                        style={{
                          backgroundColor: "#2563eb",
                          color: "white",
                          border: "none",
                          padding: "0.4rem 0.8rem",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                        }}
                      >
                        Activar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
