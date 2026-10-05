import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleGuard } from "./RoleGuard";
import { LoginForm } from "../../features/auth/components/LoginForm";
import { UserManagementTable } from "../../features/admin/components/UserManagementTable";

const TempAdminUsersPage = () => <h2>Panel de Gestión de Usuarios (Admin)</h2>;
const TempTeacherPage = () => <h2>Panel de Docente</h2>;
const TempStudentPage = () => <h2>Panel de Estudiante</h2>;
const TempUnauthorizedPage = () => (
  <h2>403 — No tienes acceso a esta sección</h2>
);

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/403" element={<TempUnauthorizedPage />} />

        {/* Rutas Protegidas de Administrador */}
        <Route element={<RoleGuard allowedRoles={["ADMIN"]} />}>
          <Route path="/admin/users" element={<UserManagementTable />} />
        </Route>

        {/* Rutas Protegidas de Docente */}
        <Route element={<RoleGuard allowedRoles={["TEACHER"]} />}>
          <Route path="/teacher/dashboard" element={<TempTeacherPage />} />
        </Route>

        {/* Rutas Protegidas de Estudiante */}
        <Route element={<RoleGuard allowedRoles={["STUDENT"]} />}>
          <Route path="/student/dashboard" element={<TempStudentPage />} />
        </Route>

        {/* Redirección global por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
