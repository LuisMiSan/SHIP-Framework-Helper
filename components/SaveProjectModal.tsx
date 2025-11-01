import React, { useState } from 'react';
import DictationButton from './DictationButton';

interface SaveProjectModalProps {
    onSave: (projectName: string) => void;
    onClose: () => void;
    defaultName: string;
}

const SaveProjectModal: React.FC<SaveProjectModalProps> = ({ onSave, onClose, defaultName }) => {
    const [projectName, setProjectName] = useState(defaultName);
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectName.trim()) {
            setError('El nombre del proyecto no puede estar vacío.');
            return;
        }
        onSave(projectName.trim());
    };

    const handleDictation = (text: string) => {
        const separator = projectName.trim() ? ' ' : '';
        setProjectName(projectName + separator + text);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full" role="dialog" aria-modal="true" aria-labelledby="save-modal-title">
                <div className="flex justify-between items-center mb-4">
                    <h2 id="save-modal-title" className="text-2xl font-bold text-slate-800">
                        Guardar Proyecto
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-slate-600 mb-6">Dale un nombre a tu proyecto para guardarlo en tu CRM personal.</p>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="projectName" className="block text-sm font-medium text-slate-700">Nombre del Proyecto</label>
                        <div className="relative mt-1">
                            <input
                                type="text"
                                name="projectName"
                                id="projectName"
                                value={projectName}
                                onChange={(e) => {
                                    setProjectName(e.target.value);
                                    if (error) setError('');
                                }}
                                className={`block w-full px-3 py-2 pr-12 bg-white border ${error ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                autoFocus
                            />
                            <DictationButton onDictate={handleDictation} className="top-1/2 -translate-y-1/2 right-2" />
                        </div>
                        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                    </div>
                    <div className="flex justify-end gap-4 mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaveProjectModal;