import { useState } from "react";
import { useLogin } from "../hooks/useLogin";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { executeLogin, isLoading, error } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    executeLogin(email, password);
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "2rem",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "1.5rem",
          color: "#1f2937",
        }}
      >
        Iniciar Sesión
      </h2>

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "0.75rem",
            borderRadius: "4px",
            marginBottom: "1rem",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              color: "#374151",
            }}
          >
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              color: "#374151",
            }}
          >
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #d1d5db",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: "0.75rem",
            backgroundColor: isLoading ? "#9ca3af" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "600",
            cursor: isLoading ? "not-allowed" : "pointer",
            marginTop: "0.5rem",
          }}
        >
          {isLoading ? "Iniciando sesión..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};
