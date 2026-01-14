
import React, { useRef } from 'react';
import { ArchivedProject, ProjectStatus } from '../types';
import StatusBadge from './StatusBadge';

interface DatabaseViewProps {
  archive: ArchivedProject[];
  onViewProject: (project: ArchivedProject) => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  onBack: () => void;
  onExport: () => void;
  onImport: (json: string) => boolean;
}

const DatabaseView: React.FC<DatabaseViewProps> = ({ archive, onViewProject, onDeleteProject, onUpdateProjectStatus, onBack, onExport, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${projectName}"? Esta acción no se puede deshacer.`)) {
      onDeleteProject(projectId);
    }
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          const content = event.target?.result as string;
          if (onImport(content)) {
              alert('Base de datos restaurada con éxito.');
          } else {
              alert('Error al importar el archivo. Asegúrate de que es un archivo de backup válido de SHIP Helper.');
          }
      };
      reader.readAsText(file);
      // Reset input
      if(e.target) e.target.value = '';
  };
  
  const hasArchive = archive.length > 0;

  // Statistics
  const stats = {
      total: archive.length,
      success: archive.filter(p => p.status === 'success').length,
      failed: archive.filter(p => p.status === 'failed').length,
      pending: archive.filter(p => p.status === 'pending').length,
  };

  return (
    <div className="animate-fade-in-up w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
            <h1 className="text-4xl font-bold text-slate-100">Centro de Seguimiento</h1>
            <p className="text-slate-400 mt-1">Gestión y análisis de tu histórico de productos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
            <button
                onClick={onExport}
                className="px-4 py-2 bg-sky-700 text-sky-100 font-semibold rounded-lg hover:bg-sky-600 transition-all text-sm flex items-center gap-2"
                title="Exportar base de datos a un archivo local"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Backup
            </button>
            <button
                onClick={handleImportClick}
                className="px-4 py-2 bg-sky-700 text-sky-100 font-semibold rounded-lg hover:bg-sky-600 transition-all text-sm flex items-center gap-2"
                title="Restaurar base de datos desde un archivo"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Restaurar
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".json"
            />
            <button
                onClick={onBack}
                className="px-6 py-2 bg-slate-600 text-slate-100 font-bold rounded-lg hover:bg-slate-500 transition-all"
            >
                &larr; Volver
            </button>
        </div>
      </div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-sky-800/40 border border-sky-700 p-4 rounded-xl text-center">
              <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Análisis</span>
              <span className="text-3xl font-extrabold text-slate-100">{stats.total}</span>
          </div>
          <div className="bg-green-900/20 border border-green-800/50 p-4 rounded-xl text-center">
              <span className="block text-green-400/70 text-xs font-bold uppercase tracking-wider mb-1">Éxitos</span>
              <span className="text-3xl font-extrabold text-green-400">{stats.success}</span>
          </div>
          <div className="bg-red-900/20 border border-red-800/50 p-4 rounded-xl text-center">
              <span className="block text-red-400/70 text-xs font-bold uppercase tracking-wider mb-1">Fallos / Pivotes</span>
              <span className="text-3xl font-extrabold text-red-400">{stats.failed}</span>
          </div>
          <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl text-center">
              <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pendientes</span>
              <span className="text-3xl font-extrabold text-slate-300">{stats.pending}</span>
          </div>
      </div>

      {hasArchive ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-300 mb-2">Historial de Proyectos</h2>
          <ul className="space-y-4">
            {archive.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()).map(project => (
              <li key={project.id} className={`bg-sky-800 p-5 rounded-xl border transition-all shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                project.status === 'success' ? 'border-green-800/50' : 
                project.status === 'failed' ? 'border-red-800/50' : 
                'border-sky-700 hover:border-orange-500'
              }`}>
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-sky-200">{project.name}</h3>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-sm text-slate-400">
                    para <strong className="font-medium text-slate-300">{project.userProfile?.name || 'Cliente Desconocido'}</strong>
                     <span className="mx-2 text-slate-600">|</span> 
                     {new Date(project.savedAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="flex gap-2 self-end sm:self-center flex-wrap">
                  <div className="flex items-center bg-sky-900/50 p-1 rounded-lg border border-sky-700">
                    <button 
                        onClick={() => onUpdateProjectStatus(project.id, 'success')} 
                        className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${project.status === 'success' ? 'bg-green-600 text-white' : 'text-green-500 hover:bg-green-500/10'}`}
                        title="Marcar como Éxito"
                    >
                      ÉXITO
                    </button>
                    <button 
                        onClick={() => onUpdateProjectStatus(project.id, 'failed')} 
                        className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${project.status === 'failed' ? 'bg-red-600 text-white' : 'text-red-500 hover:bg-red-500/10'}`}
                        title="Marcar como Fallo/Pivote"
                    >
                      FALLÓ
                    </button>
                    <button 
                        onClick={() => onUpdateProjectStatus(project.id, 'pending')} 
                        className={`px-3 py-1.5 rounded-md font-bold text-xs transition-colors ${project.status === 'pending' ? 'bg-slate-600 text-white' : 'text-slate-500 hover:bg-slate-500/10'}`}
                        title="Marcar como Pendiente"
                    >
                      PEND.
                    </button>
                  </div>
                  <button
                    onClick={() => onViewProject(project)}
                    className="px-5 py-2 bg-sky-600 text-white font-bold rounded-lg hover:bg-sky-500 transition-all text-sm shadow-md"
                  >
                    Ver Resumen
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id, project.name)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    aria-label={`Eliminar proyecto ${project.name}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center bg-sky-800 p-16 rounded-2xl border-2 border-dashed border-sky-700 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-6 text-2xl font-bold text-slate-200">Tu Centro de Comando está vacío</h3>
            <p className="mt-2 text-slate-400 max-w-sm mx-auto">Empieza un nuevo análisis S.H.I.P. para que tus ideas aparezcan aquí y puedas darles seguimiento.</p>
            <button
                onClick={onBack}
                className="mt-8 px-8 py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
            >
                🚀 Crear mi primer Análisis
            </button>
        </div>
      )}

      <div className="mt-12 p-6 bg-sky-900/30 rounded-xl border border-sky-700/50">
          <h4 className="text-slate-200 font-bold mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Nota sobre la persistencia
          </h4>
          <p className="text-sm text-slate-400 leading-relaxed">
              Tus datos se guardan de forma segura en el almacenamiento local de este navegador (`localStorage`). No se envían a ningún servidor externo para garantizar tu privacidad. Te recomendamos usar la función de <strong>Backup</strong> periódicamente para descargar una copia de tus proyectos y evitar perderlos si limpias el caché o cambias de ordenador.
          </p>
      </div>
    </div>
  );
};

export default DatabaseView;
