import { useState } from 'react';

/**
 * Modal para que el docente cree una nueva asignatura.
 */
export const CreateSubjectModal = ({ isOpen, onClose, onCreate }) => {
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setFormError('El nombre de la asignatura es obligatorio.');
            return;
        }

        try {
            setSubmitting(true);
            setFormError('');
            await onCreate(formData);
            setFormData({ name: '', description: '' });
            onClose();
        } catch (err) {
            setFormError(err.message || 'Ocurrió un error al crear la asignatura.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Nueva Asignatura</h3>
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
                            Nombre de la Asignatura *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Ej. Programación Web Avanzada"
                            className="w-full rounded-md border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Descripción breve del contenido y objetivos..."
                            rows={3}
                            className="w-full rounded-md border border-gray-300 p-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
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
                            {submitting ? 'Guardando...' : 'Crear Asignatura'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};