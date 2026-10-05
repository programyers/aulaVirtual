import { useState, useEffect, useCallback } from 'react';
import { subjectService } from '../services/subject.service';

/**
 * Hook personalizado para la gestión de asignaturas del rol Docente.
 */
export const useTeacherSubjects = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubjects = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await subjectService.getTeacherSubjects();
            setSubjects(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Error al obtener las asignaturas');
        } finally {
            setLoading(false);
        }
    }, []);

    const createSubject = async (subjectData) => {
        try {
            setError(null);
            const newSubject = await subjectService.createSubject(subjectData);
            setSubjects((prev) => [newSubject, ...prev]);
            return newSubject;
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error al crear la asignatura';
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
        createSubject
    };
};