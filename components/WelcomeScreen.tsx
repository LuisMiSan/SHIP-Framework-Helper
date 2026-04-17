
import React, { useState, useEffect } from 'react';
import { ArchivedProject, ProjectStatus, ProjectTemplate } from '../types';
import { Rocket, Database, Trash2, ChevronRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStartNew: () => void;
  templates: ProjectTemplate[];
  onStartFromTemplate: (template: ProjectTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onNavigateToDatabase: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartNew, templates, onStartFromTemplate, onDeleteTemplate, onNavigateToDatabase }) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // Select the first template by default if available
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
        setSelectedTemplateId(templates[0].id);
    }
  }, [templates, selectedTemplateId]);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const hasTemplates = templates.length > 0;

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la plantilla "${templateName}"? Esta acción no se puede deshacer.`)) {
        onDeleteTemplate(templateId);
        // Reset selection if the deleted one was selected
        if (selectedTemplateId === templateId) {
            setSelectedTemplateId(templates.length > 1 ? templates.find(t => t.id !== templateId)?.id || '' : '');
        }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="animate-fade-in-up w-full">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-50 max-w-4xl mx-auto tracking-tight">
          Transforma tus ideas en productos sólidos con <span className="text-orange-500">S.H.I.P.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-300">
          Estructura, refina y planifica tus ideas. Desde la definición del problema hasta la decisión de pivotar, obtén ayuda de la IA en cada paso para construir un producto exitoso.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onStartNew}
            className="px-10 py-5 bg-orange-500 text-white font-bold rounded-lg text-xl hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
          >
            <Rocket className="w-6 h-6" /> Empezar un Nuevo Proyecto
          </button>
          <button
            onClick={onNavigateToDatabase}
            className="px-10 py-5 bg-sky-700 text-white font-bold rounded-lg text-xl hover:bg-sky-600 transition-all transform hover:scale-105 shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2"
          >
            <Database className="w-6 h-6" /> Ver Base de Datos
          </button>
        </div>

        {hasTemplates && (
            <div className="mt-16 text-left w-full max-w-3xl mx-auto bg-sky-800/50 p-6 rounded-xl border border-sky-700">
                <h2 className="text-2xl font-bold text-slate-100 mb-4 text-center">Usar una Plantilla</h2>
                
                <div className="mb-6">
                    <label htmlFor="template-select" className="block text-sm font-medium text-slate-300 mb-2">Selecciona un nicho o tipo de negocio:</label>
                    <div className="relative">
                        <select
                            id="template-select"
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                            className="block w-full pl-4 pr-10 py-3 text-base bg-sky-900 border border-sky-600 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md text-slate-100 appearance-none cursor-pointer"
                        >
                            {templates.map((template) => (
                                <option key={template.id} value={template.id}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {selectedTemplate && (
                    <div className="bg-sky-900 p-5 rounded-lg border border-sky-700 animate-fade-in-up">
                        <div className="flex justify-between items-start gap-4 mb-3">
                            <h3 className="text-xl font-bold text-sky-300">{selectedTemplate.name}</h3>
                            <button
                                onClick={() => handleDeleteTemplate(selectedTemplate.id, selectedTemplate.name)}
                                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                title="Eliminar plantilla"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Problema</span>
                                <p className="text-sm text-slate-300 line-clamp-2">{selectedTemplate.data[0].userInput}</p>
                            </div>
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hipótesis</span>
                                <p className="text-sm text-slate-300 line-clamp-2">{selectedTemplate.data[1].userInput}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => onStartFromTemplate(selectedTemplate)}
                            className="w-full py-3 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 transition-all transform hover:scale-[1.02] shadow-md flex items-center justify-center gap-2"
                        >
                            <span>Cargar esta Plantilla</span>
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
