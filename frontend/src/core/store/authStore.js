import { create } from 'zustand';

// Recuperar sesión guardada al recargar la página
const getInitialUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};

export const useAuthStore = create((set) => ({
    user: getInitialUser(),
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    // Acción para iniciar sesión
    login: (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        set({
            user: userData,
            token: token,
            isAuthenticated: true,
        });
    },

    // Acción para cerrar sesión
    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({
            user: null,
            token: null,
            isAuthenticated: false,
        });
    },

    // Acción para actualizar datos puntuales del usuario (ej. cambio de estado)
    updateUser: (updatedFields) => {
        set((state) => {
            const newUser = state.user ? { ...state.user, ...updatedFields } : null;
            if (newUser) {
                localStorage.setItem('user', JSON.stringify(newUser));
            }
            return { user: newUser };
        });
    },
}));