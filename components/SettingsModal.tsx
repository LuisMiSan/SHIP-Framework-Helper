
import React, { useState, useEffect } from 'react';
import { AISettings, AvailableModel } from '../types';

interface SettingsModalProps {
    currentSettings: AISettings;
    onSave: (settings: AISettings) => void;
    onClose: () => void;
}

const modelOptions: { id: AvailableModel; name: string; description: string }[] = [
    {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini Flash Lite',
        description: 'El más rápido para respuestas casi instantáneas en tareas sencillas.'
    },
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
    const [model, setModel] = useState<AvailableModel>(currentSettings.model || 'gemini-2.5-flash-lite');
    const [useThinkingMode, setUseThinkingMode] = useState(!!currentSettings.useThinkingMode);
    const [useGoogleSearch, setUseGoogleSearch] = useState(!!currentSettings.useGoogleSearch);

    // Sync state if props change while modal is open
    useEffect(() => {
        setTemperature(currentSettings.temperature);
        setModel(currentSettings.model || 'gemini-2.5-flash-lite');
        setUseThinkingMode(!!currentSettings.useThinkingMode);
        setUseGoogleSearch(!!currentSettings.useGoogleSearch);
    }, [currentSettings]);

    const handleSave = () => {
        onSave({ temperature, model, useThinkingMode, useGoogleSearch });
    };

    const handleModelSelect = (selectedModel: AvailableModel) => {
        setModel(selectedModel);
        // If user manually selects a model, we assume they want that specific model without overrides
        setUseThinkingMode(false);
        setUseGoogleSearch(false);
    };

    const handleGoogleSearchChange = (checked: boolean) => {
        setUseGoogleSearch(checked);
        if (checked) {
            setUseThinkingMode(false);
        }
    };

    const handleThinkingModeChange = (checked: boolean) => {
        setUseThinkingMode(checked);
        if (checked) {
            setUseGoogleSearch(false);
        }
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
            <div className="bg-sky-800 rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 id="settings-modal-title" className="text-2xl font-bold text-slate-100">
                        Configuración de la IA
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300" aria-label="Cerrar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-slate-300 mb-8">
                    Ajusta los parámetros de la IA para adaptar las sugerencias a tus necesidades.
                </p>

                <div className="space-y-8">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                             <label htmlFor="temperature" className="block font-medium text-slate-200">
                                Creatividad (Temperatura)
                            </label>
                            <span className="text-sm font-semibold text-orange-300 bg-orange-900/50 px-2 py-1 rounded-md">
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
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                        />
                         <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>Enfocado</span>
                            <span>Creativo</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">
                            Controla la aleatoriedad de las respuestas. Valores bajos son más predecibles; valores altos generan ideas más diversas. (Recomendado: 0.7)
                        </p>
                    </div>

                    <div className="border-t border-sky-700 pt-8">
                        <div className="flex justify-between items-center">
                            <label className="font-medium text-slate-200">
                                Búsqueda en Google
                            </label>
                            <label htmlFor="google-search-toggle" className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    id="google-search-toggle" 
                                    className="sr-only peer"
                                    checked={useGoogleSearch}
                                    onChange={(e) => handleGoogleSearchChange(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">
                           Permite a la IA usar Google Search para obtener información actualizada y relevante para sus sugerencias.
                           {useThinkingMode && <span className="text-orange-300 block mt-1 text-xs">⚠️ Al activar esto se desactivará el Modo de Pensamiento Profundo.</span>}
                        </p>
                    </div>

                     <div className="border-t border-sky-700 pt-8">
                        <div className="flex justify-between items-center">
                            <label className="font-medium text-slate-200">
                                Modo de Pensamiento Profundo
                            </label>
                            <label htmlFor="thinking-mode-toggle" className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    id="thinking-mode-toggle" 
                                    className="sr-only peer"
                                    checked={useThinkingMode}
                                    onChange={(e) => handleThinkingModeChange(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                        <p className="mt-2 text-sm text-slate-400">
                           Activa esta opción para que la IA utilice <span className="font-semibold text-slate-300">Gemini 2.5 Pro</span> con su máxima capacidad de razonamiento. Ideal para problemas complejos.
                           {useGoogleSearch && <span className="text-orange-300 block mt-1 text-xs">⚠️ Al activar esto se desactivará la Búsqueda en Google.</span>}
                        </p>
                    </div>

                    <div className="border-t border-sky-700 pt-8">
                        <label className="block font-medium text-slate-200 mb-3">
                            Modelo de IA
                        </label>
                        <div className="space-y-4">
                            {modelOptions.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => handleModelSelect(option.id)}
                                    className={`p-4 border rounded-lg transition-all cursor-pointer ${
                                        model === option.id && !useThinkingMode && !useGoogleSearch
                                            ? 'bg-orange-500/10 border-orange-500 ring-2 ring-orange-500'
                                            : 'bg-sky-700 border-sky-600 hover:border-sky-500'
                                    } ${(useThinkingMode || useGoogleSearch) ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id={option.id}
                                            name="model"
                                            value={option.id}
                                            checked={model === option.id && !useThinkingMode && !useGoogleSearch}
                                            onChange={() => handleModelSelect(option.id)}
                                            className="h-4 w-4 text-orange-500 border-slate-500 focus:ring-orange-500"
                                        />
                                        <div className="ml-3">
                                            <label htmlFor={option.id} className="block text-sm font-bold text-slate-100 cursor-pointer">
                                                {option.name}
                                            </label>
                                            <p className="text-sm text-slate-400">{option.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <p className="mt-2 text-sm text-slate-400">
                            {useThinkingMode 
                                ? 'El Modo de Pensamiento Profundo anula esta selección para usar Gemini 2.5 Pro. Selecciona un modelo para desactivarlo.' 
                                : useGoogleSearch
                                ? 'La Búsqueda en Google anula esta selección para usar Gemini Flash. Selecciona un modelo para desactivarla.'
                                : 'Pro puede ofrecer respuestas de mayor calidad pero es más lento. Flash es mejor para iteraciones rápidas.'}
                        </p>
                    </div>

                </div>

                <div className="flex justify-end gap-4 mt-10">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-600 text-slate-100 font-bold rounded-lg hover:bg-slate-500 transition-colors">
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSave} className="px-6 py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
