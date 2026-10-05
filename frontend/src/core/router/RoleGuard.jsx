import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const RoleGuard = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuthStore();

    // 1. Si no está autenticado, redirigir al Login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Control de estado para docentes pendientes de activación
    if (user?.status === 'PENDING_APPROVAL') {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <h2>Cuenta en Revisión ⏳</h2>
                <p>Tu cuenta de docente se encuentra pendiente de aprobación por parte del administrador.</p>
                <p>Podrás acceder al sistema una vez que tu estado cambie a <strong>ACTIVE</strong>.</p>
            </div>
        );
    }

    // 3. Control de acceso por Rol
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/403" replace />;
    }

    // Permite el renderizado de la ruta hija protegida
    return <Outlet />;
};