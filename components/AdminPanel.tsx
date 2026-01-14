
import React, { useState, useRef } from 'react';
import { ArchivedProject, ProjectTemplate, ProjectStatus } from '../types';
import StatusBadge from './StatusBadge';

interface AdminPanelProps {
  archive: ArchivedProject[];
  templates: ProjectTemplate[];
  onUpdateArchive: (newArchive: ArchivedProject[]) => void;
  onUpdateTemplates: (newTemplates: ProjectTemplate[]) => void;
  onLoadProjectToWorkspace: (project: ArchivedProject) => void;
  onExport: () => void;
  onImport: (json: string) => boolean;
  onClose: () => void;
}

type AdminTab = 'projects' | 'templates' | 'data';

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    archive, 
    templates, 
    onUpdateArchive, 
    onUpdateTemplates,
    onLoadProjectToWorkspace,
    onExport, 
    onImport, 
    onClose 
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [activeTab, setActiveTab] = useState<AdminTab>('projects');
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded password for client-side demo
        if (passwordInput === 'admin123') {
            setIsAuthenticated(true);
        } else {
            alert('Contraseña incorrecta');
        }
    };

    const handleDeleteProject = (id: string) => {
        if (window.confirm('¿Eliminar este proyecto permanentemente?')) {
            onUpdateArchive(archive.filter(p => p.id !== id));
        }
    };

    const handleUpdateStatus = (id: string, newStatus: ProjectStatus) => {
        onUpdateArchive(archive.map(p => p.id === id ? { ...p, status: newStatus } : p));
    };

    const handleDeleteTemplate = (id: string) => {
        if (window.confirm('¿Eliminar esta plantilla?')) {
            onUpdateTemplates(templates.filter(t => t.id !== id));
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            if (onImport(content)) {
                alert('Datos importados correctamente.');
            } else {
                alert('Error al importar datos.');
            }
        };
        reader.readAsText(file);
        if(e.target) e.target.value = '';
    };

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
                <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 max-w-sm w-full">
                    <div className="flex justify-center mb-6">
                        <div className="bg-slate-700 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-slate-100 mb-6">Acceso Admin</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <input
                            type="password"
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                            placeholder="Contraseña (admin123)"
                            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-orange-500 outline-none"
                            autoFocus
                        />
                        <button type="submit" className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors">
                            Entrar
                        </button>
                    </form>
                    <button onClick={onClose} className="w-full mt-4 text-sm text-slate-400 hover:text-slate-200">
                        Volver a la App
                    </button>
                </div>
            </div>
        );
    }

    const filteredArchive = archive.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.userProfile?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in-up max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8 bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center gap-4">
                     <div className="bg-orange-500 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                     </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-100">Panel de Administración</h1>
                        <p className="text-sm text-slate-400">Gestión centralizada del sistema</p>
                    </div>
                </div>
                <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-semibold transition-colors">
                    Salir del Admin
                </button>
            </div>

            <div className="flex gap-4 mb-6 border-b border-slate-700 pb-1 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('projects')}
                    className={`px-4 py-2 rounded-t-lg font-bold transition-colors ${activeTab === 'projects' ? 'bg-sky-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Gestión de Proyectos ({archive.length})
                </button>
                <button 
                    onClick={() => setActiveTab('templates')}
                    className={`px-4 py-2 rounded-t-lg font-bold transition-colors ${activeTab === 'templates' ? 'bg-sky-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Plantillas ({templates.length})
                </button>
                <button 
                    onClick={() => setActiveTab('data')}
                    className={`px-4 py-2 rounded-t-lg font-bold transition-colors ${activeTab === 'data' ? 'bg-sky-700 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    Subir y Bajar Datos
                </button>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6 min-h-[400px]">
                {activeTab === 'projects' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-4">
                             <input 
                                type="text" 
                                placeholder="Buscar por proyecto o cliente..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-900 border border-slate-600 text-slate-200 rounded-lg px-4 py-2 w-full max-w-md focus:ring-2 focus:ring-sky-500 outline-none"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-300">
                                <thead className="bg-slate-700/50 text-slate-200 uppercase text-xs font-bold">
                                    <tr>
                                        <th className="p-3">Proyecto</th>
                                        <th className="p-3">Cliente</th>
                                        <th className="p-3">Fecha</th>
                                        <th className="p-3">Estado</th>
                                        <th className="p-3 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {filteredArchive.map(project => (
                                        <tr key={project.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="p-3 font-medium text-white">{project.name}</td>
                                            <td className="p-3">{project.userProfile.name}</td>
                                            <td className="p-3 whitespace-nowrap">{new Date(project.savedAt).toLocaleDateString()}</td>
                                            <td className="p-3">
                                                <div className="flex gap-1">
                                                    <button onClick={() => handleUpdateStatus(project.id, 'pending')} className={`w-3 h-3 rounded-full ${project.status === 'pending' ? 'bg-slate-400 ring-2 ring-slate-200' : 'bg-slate-800 border border-slate-600'}`} title="Pendiente"></button>
                                                    <button onClick={() => handleUpdateStatus(project.id, 'success')} className={`w-3 h-3 rounded-full ${project.status === 'success' ? 'bg-green-500 ring-2 ring-green-200' : 'bg-slate-800 border border-slate-600'}`} title="Éxito"></button>
                                                    <button onClick={() => handleUpdateStatus(project.id, 'failed')} className={`w-3 h-3 rounded-full ${project.status === 'failed' ? 'bg-red-500 ring-2 ring-red-200' : 'bg-slate-800 border border-slate-600'}`} title="Falló"></button>
                                                    <span className="ml-2 text-xs opacity-70 uppercase">{project.status}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button 
                                                        onClick={() => onLoadProjectToWorkspace(project)}
                                                        className="px-3 py-1 bg-sky-600 text-white rounded hover:bg-sky-500 transition-colors text-xs font-bold flex items-center gap-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                        REMODELAR
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteProject(project.id)}
                                                        className="p-1.5 text-red-400 hover:bg-red-900/50 rounded transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredArchive.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">No se encontraron proyectos.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'templates' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {templates.map(template => (
                            <div key={template.id} className="bg-slate-900 p-4 rounded-lg border border-slate-700">
                                <h3 className="font-bold text-slate-200 mb-2">{template.name}</h3>
                                <p className="text-xs text-slate-500 mb-4">ID: {template.id}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">
                                        {new Date(template.createdAt).toLocaleDateString()}
                                    </span>
                                    <button 
                                        onClick={() => handleDeleteTemplate(template.id)}
                                        className="text-red-400 hover:text-red-300 text-xs font-bold"
                                    >
                                        ELIMINAR
                                    </button>
                                </div>
                            </div>
                        ))}
                         {templates.length === 0 && (
                            <div className="col-span-full p-8 text-center text-slate-500">No hay plantillas personalizadas.</div>
                        )}
                    </div>
                )}

                {activeTab === 'data' && (
                    <div className="flex flex-col items-center justify-center h-full py-12 space-y-8">
                        <div className="text-center max-w-lg">
                            <h3 className="text-xl font-bold text-slate-100 mb-2">Control de Datos JSON</h3>
                            <p className="text-slate-400">Exporta la base de datos completa para guardarla en tu ordenador o importa un archivo previamente guardado para "subir" proyectos antiguos.</p>
                        </div>
                        
                        <div className="flex gap-6">
                            <div className="flex flex-col items-center">
                                <button
                                    onClick={onExport}
                                    className="w-48 h-32 bg-sky-800 hover:bg-sky-700 border-2 border-sky-600 rounded-xl flex flex-col items-center justify-center gap-3 transition-all group"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sky-300 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span className="font-bold text-sky-100">DESCARGAR BACKUP</span>
                                </button>
                            </div>

                            <div className="flex flex-col items-center">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-48 h-32 bg-emerald-900/50 hover:bg-emerald-800/50 border-2 border-emerald-600/50 rounded-xl flex flex-col items-center justify-center gap-3 transition-all group"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-300 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span className="font-bold text-emerald-100">SUBIR / IMPORTAR</span>
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileUpload} 
                                    className="hidden" 
                                    accept=".json" 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
