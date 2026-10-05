import { useState } from 'react';

/**
 * Modal para que el estudiante ingrese el código e inscriba una asignatura.
 */
export const EnrollSubjectModal = ({ isOpen, onClose, onEnroll }) => {
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanCode = code.trim().toUpperCase();

        if (!cleanCode) {
            setFormError('El código de inscripción es obligatorio.');
            return;
        }

        if (cleanCode.length !== 6) {
            setFormError('El código debe tener exactamente 6 caracteres.');
            return;
        }

        try {
            setSubmitting(true);
            setFormError('');
            await onEnroll(cleanCode);
            setCode('');
            onClose();
        } catch (err) {
            setFormError(err.message || 'Error al inscribirse a la asignatura.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Inscribir Asignatura</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 font-bold text-lg"
                    >
                        ✕
                    </button>
                </div>

                {formError && (
                    <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                        {formError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código de Acceso *
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="Ej. 8F2A9K"
                            maxLength={6}
                            className="w-full text-center tracking-widest uppercase font-mono text-lg rounded-md border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Solicita el código de 6 caracteres al docente de la materia.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                            disabled={submitting}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {submitting ? 'Inscribiendo...' : 'Inscribirse'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};