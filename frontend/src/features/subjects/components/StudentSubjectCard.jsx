/**
 * Tarjeta individual de asignatura matriculada por el estudiante (Estructura base).
 */
export const StudentSubjectCard = ({ subject }) => {
    const teacherName = subject.teacher?.name || subject.teacher?.email || 'Docente Asignado';

    return (
        <div style={{ border: '1px solid #ccc', padding: '12px', margin: '8px 0' }}>
            <h4>{subject.name}</h4>
            <p>{subject.description || 'Sin descripción disponible.'}</p>
            <hr />
            <div>
                <small>Docente: {teacherName}</small>
            </div>
            <div>
                <strong>Estado: Inscrito</strong>
            </div>
        </div>
    );
};