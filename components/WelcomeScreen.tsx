import React from 'react';
import { ArchivedProject, ProjectStatus, ProjectTemplate } from '../types';

interface WelcomeScreenProps {
  onStartNew: () => void;
  templates: ProjectTemplate[];
  onStartFromTemplate: (template: ProjectTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onNavigateToDatabase: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartNew, templates, onStartFromTemplate, onDeleteTemplate, onNavigateToDatabase }) => {
  const hasTemplates = templates.length > 0;

  const handleDeleteTemplate = (templateId: string, templateName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la plantilla "${templateName}"? Esta acción no se puede deshacer.`)) {
        onDeleteTemplate(templateId);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="animate-fade-in-up w-full">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 max-w-4xl mx-auto tracking-tight">
          Transforma tus ideas en productos sólidos con <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">S.H.I.P.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600">
          Estructura, refina y planifica tus ideas. Desde la definición del problema hasta la decisión de pivotar, obtén ayuda de la IA en cada paso para construir un producto exitoso.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={onStartNew}
            className="px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg text-xl hover:from-indigo-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30"
          >
            🚀 Empezar un Nuevo Proyecto
          </button>
          <button
            onClick={onNavigateToDatabase}
            className="px-10 py-5 bg-slate-700 text-white font-bold rounded-lg text-xl hover:bg-slate-800 transition-all transform hover:scale-105 shadow-lg shadow-slate-500/30"
          >
            📂 Ver Base de Datos
          </button>
        </div>

        {hasTemplates && (
            <div className="mt-16 text-left w-full max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Plantillas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(template => (
                        <div key={template.id} className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col justify-between items-start gap-3 hover:border-indigo-500 transition-colors shadow-sm">
                            <div>
                                <h3 className="text-lg font-semibold text-indigo-600">{template.name}</h3>
                                <p className="text-xs text-slate-500">
                                    Creado el: {new Date(template.createdAt).toLocaleDateString('es-ES')}
                                </p>
                            </div>
                            <div className="flex gap-2 self-end w-full">
                                <button
                                    onClick={() => onStartFromTemplate(template)}
                                    className="flex-grow px-3 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors text-sm"
                                >
                                    Usar Plantilla
                                </button>
                                <button
                                    onClick={() => handleDeleteTemplate(template.id, template.name)}
                                    className="px-3 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 transition-colors text-sm"
                                    aria-label={`Eliminar plantilla ${template.name}`}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;
