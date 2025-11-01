import React, { useState, useEffect } from 'react';
import { AISettings, AvailableModel } from '../types';

interface SettingsModalProps {
    currentSettings: AISettings;
    onSave: (settings: AISettings) => void;
    onClose: () => void;
}

const modelOptions: { id: AvailableModel; name: string; description: string }[] = [
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini Flash',
        description: 'Rápido y eficiente, ideal para tareas cotidianas y respuestas rápidas.'
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini Pro',
        description: 'Más potente y con mayor capacidad de razonamiento, para análisis complejos.'
    }
];

const SettingsModal: React.FC<SettingsModalProps> = ({ currentSettings, onSave, onClose }) => {
    const [temperature, setTemperature] = useState(currentSettings.temperature);
    const [model, setModel] = useState<AvailableModel>(currentSettings.model || 'gemini-2.5-flash');

    // Sync state if props change while modal is open
    useEffect(() => {
        setTemperature(currentSettings.temperature);
        setModel(currentSettings.model || 'gemini-2.5-flash');
    }, [currentSettings]);

    const handleSave = () => {
        onSave({ temperature, model });
    };

    const getCreativityLabel = (value: number) => {
        if (value <= 0.3) return 'Más Enfocado';
        if (value <= 0.6) return 'Equilibrado';
        if (value <= 0.8) return 'Creativo';
        return 'Muy Creativo';
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in-up" 
            role="dialog" 
            aria-modal="true"
            aria-labelledby="settings-modal-title"
        >
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all">
                <div className="flex justify-between items-center mb-4">
                    <h2 id="settings-modal-title" className="text-2xl font-bold text-slate-800">
                        Configuración de la IA
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-slate-600 mb-8">
                    Ajusta los parámetros de la IA para adaptar las sugerencias a tus necesidades.
                </p>

                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label htmlFor="temperature" className="block font-medium text-slate-700">
                                Creatividad (Temperatura)
                            </label>
                            <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-md">
                                {getCreativityLabel(temperature)}
                            </span>
                        </div>
                       
                        <input
                            type="range"
                            id="temperature"
                            name="temperature"
                            min="0.1"
                            max="1.0"
                            step="0.1"
                            value={temperature}
                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                         <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Enfocado</span>
                            <span>Creativo</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                            Controla la aleatoriedad de las respuestas. Valores bajos son más predecibles; valores altos generan ideas más diversas. (Recomendado: 0.7)
                        </p>
                    </div>

                    <div className="border-t border-slate-200 pt-8">
                        <label className="block font-medium text-slate-700 mb-3">
                            Modelo de IA
                        </label>
                        <div className="space-y-4">
                            {modelOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => setModel(option.id)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                        model === option.id
                                            ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500'
                                            : 'bg-white border-slate-300 hover:border-slate-400'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id={option.id}
                                            name="model"
                                            value={option.id}
                                            checked={model === option.id}
                                            onChange={() => setModel(option.id)}
                                            className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                                        />
                                        <div className="ml-3">
                                            <label htmlFor={option.id} className="block text-sm font-bold text-slate-800 cursor-pointer">
                                                {option.name}
                                            </label>
                                            <p className="text-sm text-slate-500">{option.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <p className="mt-2 text-sm text-slate-500">
                            Pro puede ofrecer respuestas de mayor calidad pero es más lento. Flash es mejor para iteraciones rápidas.
                        </p>
                    </div>

                </div>

                <div className="flex justify-end gap-4 mt-10">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition-colors">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSave} className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;