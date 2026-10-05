import { useState, useEffect, useCallback } from 'react';
import { subjectService } from '../services/subject.service';

/**
 * Hook personalizado para la gestión de asignaturas e inscripciones del rol Estudiante.
 */
export const useStudentSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await subjectService.getStudentSubjects();
            setSubjects(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al obtener tus asignaturas');
        } finally {
            setLoading(false);
        }
    }, []);

    const enrollSubject = async (code) => {
        try {
            setError(null);
            const enrolledSubject = await subjectService.enrollSubject(code);
            setSubjects((prev) => [enrolledSubject, ...prev]);
            return enrolledSubject;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al inscribir la asignatura';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    return {
        subjects,
        loading,
        error,
        refetch: fetchSubjects,
        enrollSubject
    };
};