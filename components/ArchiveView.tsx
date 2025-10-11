import React from 'react';
import { ArchivedProject } from '../types';

interface ArchiveViewProps {
  archive: ArchivedProject[];
  onViewProject: (project: ArchivedProject) => void;
  onDeleteProject: (projectId: string) => void;
  onBack: () => void;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({ archive, onViewProject, onDeleteProject, onBack }) => {

  const handleDelete = (projectId: string, projectName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${projectName}"? Esta acción no se puede deshacer.`)) {
      onDeleteProject(projectId);
    }
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-2xl border border-gray-700 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-100">Proyectos Guardados</h2>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors"
        >
          &larr; Volver
        </button>
      </div>
      {archive.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No tienes ningún proyecto guardado todavía.</p>
      ) : (
        <ul className="space-y-4">
          {archive.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()).map(project => (
            <li key={project.id} className="bg-gray-900/70 p-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-500 transition-colors">
              <div>
                <h3 className="text-xl font-semibold text-indigo-400">{project.name}</h3>
                <p className="text-sm text-gray-500">
                  Guardado el: {new Date(project.savedAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
              <div className="flex gap-2 self-end sm:self-center">
                <button
                  onClick={() => onViewProject(project)}
                  className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors text-sm"
                >
                  Ver Resumen
                </button>
                <button
                  onClick={() => handleDelete(project.id, project.name)}
                  className="px-4 py-2 bg-red-800 text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ArchiveView;