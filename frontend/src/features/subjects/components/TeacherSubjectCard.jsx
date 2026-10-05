import { useState } from 'react';

/**
 * Tarjeta individual de asignatura impartida por el docente.
 */
export const TeacherSubjectCard = ({ subject }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyCode = () => {
        if (subject?.code) {
            navigator.clipboard.writeText(subject.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div>
                <div className="flex items-start justify-between">
                    <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{subject.name}</h4>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {subject.description || 'Sin descripción disponible.'}
                </p>
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block mb-1">
                    Código de Inscripción
                </span>
                <div className="flex items-center justify-between rounded bg-gray-50 p-2 border border-gray-200">
                    <span className="font-mono text-base font-bold text-blue-700 tracking-wider">
                        {subject.code}
                    </span>
                    <button
                        onClick={handleCopyCode}
                        className="text-xs font-medium text-gray-600 hover:text-blue-600 focus:outline-none transition-colors"
                    >
                        {copied ? '¡Copiado! ✓' : 'Copiar'}
                    </button>
                </div>
            </div>
        </div>
    );
};