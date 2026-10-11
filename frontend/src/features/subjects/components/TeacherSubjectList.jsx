import { TeacherSubjectCard } from "./TeacherSubjectCard";
//utilizar fragmens

/**
 * Grilla receptora de la lista de asignaturas del docente.
 */
export const TeacherSubjectList = ({ subjects, loading, error }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
        {error}
      </div>
    );
  }

  if (!subjects || subjects.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-500 font-medium">
          No has creado ninguna asignatura aún.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Haz clic en "Nueva Asignatura" para empezar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {subjects.map((subject) => (
        <TeacherSubjectCard key={subject.id} subject={subject} />
      ))}
    </div>
  );
};
