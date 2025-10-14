import React from 'react';
import { ArchivedProject, ProjectStatus } from '../types';
import StatusBadge from './StatusBadge';

interface WelcomeScreenProps {
  onStartNew: () => void;
  archive: ArchivedProject[];
  onViewProject: (project: ArchivedProject) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProjectStatus: (projectId: string, status: ProjectStatus) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartNew, archive, onViewProject, onDeleteProject, onUpdateProjectStatus }) => {
  const hasArchive = archive.length > 0;

  const handleDelete = (projectId: string, projectName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${projectName}"? Esta acción no se puede deshacer.`)) {
      onDeleteProject(projectId);
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
        </div>

        {hasArchive && (
           <div className="mt-16 text-left w-full max-w-5xl mx-auto">
             <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">CRM de Proyectos</h2>
             <ul className="space-y-4">
               {archive.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()).map(project => (
                 <li key={project.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-500 transition-colors">
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
                       <button onClick={() => onUpdateProjectStatus(project.id, 'success')} className="px-3 py-2 bg-green-600 text-white font-semibold rounded-l-md hover:bg-green-700 transition-colors text-sm" title="Marcar como Éxito">
                         ✔️ Éxito
                       </button>
                       <button onClick={() => onUpdateProjectStatus(project.id, 'failed')} className="px-3 py-2 bg-red-600 text-white font-semibold rounded-r-md hover:bg-red-700 transition-colors text-sm" title="Marcar como Fallo">
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
                       onClick={() => handleDelete(project.id, project.name)}
                       className="px-4 py-2 bg-red-800 text-white font-semibold rounded-md hover:bg-red-700 transition-colors text-sm"
                     >
                       Eliminar
                     </button>
                   </div>
                 </li>
               ))}
             </ul>
           </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;