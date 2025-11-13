import React from 'react';
import { ArchivedProject, ProjectStatus } from '../types';
import StatusBadge from './StatusBadge';

interface DatabaseViewProps {
  archive: ArchivedProject[];
  onViewProject: (project: ArchivedProject) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  onBack: () => void;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ archive, onViewProject, onDeleteProject, onUpdateProjectStatus, onBack }) => {

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${projectName}"? Esta acción no se puede deshacer.`)) {
      onDeleteProject(projectId);
    }
  };
  
  const hasArchive = archive.length > 0;

  return (
    <div className="animate-fade-in-up w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-4xl font-bold text-slate-800">Base de Datos de Proyectos</h1>
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-6 py-3 bg-slate-200 text-slate-800 font-bold rounded-lg text-lg hover:bg-slate-300 transition-all"
        >
          &larr; Volver al inicio
        </button>
      </div>

      {hasArchive ? (
        <ul className="space-y-4">
          {archive.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()).map(project => (
            <li key={project.id} className="bg-white p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-500 transition-colors shadow-sm">
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-semibold text-indigo-600">{project.name}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-sm text-slate-500">
                  para <strong className="font-medium text-slate-600">{project.userProfile?.name || 'Cliente Desconocido'}</strong>
                   &middot; Guardado el: {new Date(project.savedAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
              <div className="flex gap-2 self-end sm:self-center flex-wrap">
                <div className="flex items-center rounded-md shadow-sm">
                  <button onClick={() => onUpdateProjectStatus(project.id, 'success')} className="px-3 py-2 bg-green-100 text-green-700 font-semibold rounded-l-md hover:bg-green-200 transition-colors text-sm" title="Marcar como Éxito">
                    ✔️ Éxito
                  </button>
                  <button onClick={() => onUpdateProjectStatus(project.id, 'failed')} className="px-3 py-2 bg-red-100 text-red-700 font-semibold rounded-r-md hover:bg-red-200 transition-colors text-sm" title="Marcar como Fallo">
                    ❌ Falló
                  </button>
                </div>
                <button
                  onClick={() => onViewProject(project)}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors text-sm"
                >
                  Ver Resumen
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id, project.name)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-red-100 hover:text-red-700 transition-colors text-sm"
                  aria-label={`Eliminar proyecto ${project.name}`}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center bg-white p-12 rounded-lg border-2 border-dashed border-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-4 text-xl font-medium text-slate-800">No hay proyectos guardados</h3>
            <p className="mt-2 text-slate-500">Cuando guardes un proyecto, aparecerá aquí.</p>
        </div>
      )}
    </div>
  );
};

export default DatabaseView;
