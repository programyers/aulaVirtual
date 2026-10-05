import { useState } from 'react';
import { useTeacherSubjects } from '../../subjects/hooks/useTeacherSubjects';
import { TeacherSubjectList } from '../../subjects/components/TeacherSubjectList';
import { CreateSubjectModal } from '../../subjects/components/CreateSubjectModal';

export const TeacherDashboard = () => {
    const { subjects, loading, error, createSubject } = useTeacherSubjects();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Encabezado del Panel */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Asignaturas</h1>
                    <p className="text-sm text-gray-600">
                        Gestiona tus cursos y comparte los códigos de acceso con tus estudiantes.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                    + Nueva Asignatura
                </button>
            </div>

            {/* Listado de Asignaturas */}
            <TeacherSubjectList
                subjects={subjects}
                loading={loading}
                error={error}
            />

            {/* Modal de Creación */}
            <CreateSubjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={createSubject}
            />
        </div>
    );
};

export default TeacherDashboard;