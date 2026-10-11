import { useState } from "react";
import { useStudentSubjects } from "../../subjects/hooks/useStudentSubjects";
import { StudentSubjectList } from "../../subjects/components/StudentSubjectList";
import { EnrollSubjectModal } from "../../subjects/components/EnrollSubjectModal";
//utilizar fragmens

export const StudentDashboard = () => {
  const { subjects, loading, error, enrollSubject } = useStudentSubjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Encabezado del Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis Cursos</h1>
          <p className="text-sm text-gray-600">
            Consulta las asignaturas en las que estás matriculado.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          + Inscribir Asignatura
        </button>
      </div>

      {/* Listado de Asignaturas */}
      <StudentSubjectList subjects={subjects} loading={loading} error={error} />

      {/* Modal de Inscripción */}
      <EnrollSubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEnroll={enrollSubject}
      />
    </div>
  );
};

export default StudentDashboard;
