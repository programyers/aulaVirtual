import apiClient from '../../../core/api/axios.config';

/**
 * Servicio HTTP para la gestión de Asignaturas e Inscripciones
 */
export const subjectService = {
    /**
     * Obtiene las asignaturas creadas por el docente autenticado.
     * Endpoint: GET /api/v1/subjects/teacher
     */
    async getTeacherSubjects() {
        const response = await apiClient.get('/subjects/teacher');
        return response.data.data;
    },

    /**
     * Crea una nueva asignatura (exclusivo para Docente).
     * Endpoint: POST /api/v1/subjects
     * @param {Object} payload - { name: string, description: string }
     */
    async createSubject(payload) {
        const response = await apiClient.post('/subjects', payload);
        return response.data.data;
    },

    /**
     * Obtiene las asignaturas en las que está inscrito el estudiante autenticado.
     * Endpoint: GET /api/v1/subjects/student
     */
    async getStudentSubjects() {
        const response = await apiClient.get('/subjects/student');
        return response.data.data;
    },

    /**
     * Inscribe al estudiante a una asignatura mediante su código único.
     * Endpoint: POST /api/v1/subjects/enroll
     * @param {string} code - Código de 6 caracteres de la asignatura (ej. 8F2A9K)
     */
    async enrollSubject(code) {
        const response = await apiClient.post('/subjects/enroll', { code });
        return response.data.data;
    }
};