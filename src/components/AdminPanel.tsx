
import React, { useState, useRef } from 'react';
import { ArchivedProject, ProjectTemplate, ProjectStatus } from '../types';
import StatusBadge from './StatusBadge';
import { Shield, Layout, Database, Upload, Download, Trash2, Edit, X, Search, CheckCircle, XCircle, Clock, FileText, Settings, User, Globe } from 'lucide-react';

interface AdminPanelProps {
  archive: ArchivedProject[];
  templates: ProjectTemplate[];
  onDeleteProject: (id: string) => void;
  onUpdateProjectStatus: (id: string, newStatus: ProjectStatus) => void;
  onDeleteTemplate: (id: string) => void;
  onLoadProjectToWorkspace: (project: ArchivedProject) => void;
  onExport: () => void;
  onImport: (json: string) => void;
  onClose: () => void;
}

type AdminTab = 'projects' | 'templates' | 'data';

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    archive, 
    templates, 
    onDeleteProject,
    onUpdateProjectStatus,
    onDeleteTemplate,
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
        // Demonstration only: Any non-empty password will work
        if (passwordInput.trim().length > 0) {
            setIsAuthenticated(true);
        } else {
            alert('Por favor, ingresa una contraseña admin.');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const content = ev.target?.result as string;
            onImport(content);
        };
        reader.readAsText(file);
        if(e.target) e.target.value = '';
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-md z-[300] flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-gray-100 animate-in fade-in zoom-in duration-300">
                    <div className="flex justify-center mb-8">
                        <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-200">
                            <Shield className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-center text-gray-900 mb-2 tracking-tight">Zona Restringida</h2>
                    <p className="text-gray-500 text-center text-sm font-medium mb-8">Identifícate para gestionar la plataforma.</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="Contraseña Admin"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                                autoFocus
                            />
                        </div>
                        <button type="submit" className="w-full py-4 bg-gray-900 hover:bg-black text-white font-black rounded-xl transition-all shadow-xl shadow-gray-200 active:scale-95">
                            ACCEDER AL PANEL
                        </button>
                    </form>
                    <button onClick={onClose} className="w-full mt-6 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
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

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-5">
                     <div className="bg-gray-900 p-4 rounded-2xl shadow-lg">
                        <Shield className="h-8 w-8 text-white" />
                     </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Console</h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">S.H.I.P. Framework Management</p>
                    </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="px-6 py-3 bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-black transition-all flex items-center gap-2 shadow-sm"
                >
                    <X className="w-5 h-5" /> CERRAR PANEL
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1 bg-gray-100 rounded-2xl mb-8">
                <button 
                    onClick={() => { setActiveTab('projects'); setSearchTerm(''); }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'projects' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Database size={16} /> Proyectos ({archive.length})
                </button>
                <button 
                    onClick={() => { setActiveTab('templates'); setSearchTerm(''); }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'templates' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Layout size={16} /> Plantillas ({templates.length})
                </button>
                <button 
                    onClick={() => setActiveTab('data')}
                    className={`flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'data' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Upload size={16} /> Backup & Sync
                </button>
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden min-h-[500px]">
                {activeTab !== 'data' && (
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                        <div className="relative max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder={activeTab === 'projects' ? "Buscar por proyecto o cliente..." : "Buscar plantillas..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-900 transition-all"
                            />
                        </div>
                    </div>
                )}

                <div className="p-8">
                    {activeTab === 'projects' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                        <th className="pb-4 px-2">Proyecto</th>
                                        <th className="pb-4 px-2">Cliente / Empresa</th>
                                        <th className="pb-4 px-2">Fecha</th>
                                        <th className="pb-4 px-2">Estado Escala</th>
                                        <th className="pb-4 px-2 text-right">Controles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredArchive.map(project => (
                                        <tr key={project.id} className="group hover:bg-gray-50/50 transition-colors">
                                            <td className="py-5 px-2">
                                                <div className="font-bold text-gray-900">{project.name}</div>
                                                <div className="text-[10px] font-mono text-gray-400">{project.id}</div>
                                            </td>
                                            <td className="py-5 px-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                        <User size={14} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-700">{project.userProfile.name}</div>
                                                        <div className="text-xs text-gray-400 font-medium">{project.userProfile.company}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-5 px-2">
                                                <div className="text-xs font-bold text-gray-500 flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {new Date(project.savedAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="py-5 px-2">
                                                <div className="flex items-center gap-3">
                                                    <select 
                                                        value={project.status}
                                                        onChange={(e) => onUpdateProjectStatus(project.id, e.target.value as ProjectStatus)}
                                                        className="bg-gray-100 border-none rounded-lg text-xs font-black uppercase py-1.5 px-3 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                                                    >
                                                        <option value="pending">PENDIENTE</option>
                                                        <option value="success">ÉXITO</option>
                                                        <option value="failed">FALLIDO</option>
                                                    </select>
                                                    <StatusBadge status={project.status} size="sm" />
                                                </div>
                                            </td>
                                            <td className="py-5 px-2 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => onLoadProjectToWorkspace(project)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-100"
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                        REMODELAR
                                                    </button>
                                                    <button 
                                                        onClick={() => {
                                                            if (confirm('¿Seguro que quieres eliminar este proyecto permanentemente?')) {
                                                                onDeleteProject(project.id);
                                                            }
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredArchive.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Database className="text-gray-200" size={48} />
                                                    <p className="text-gray-400 font-bold">No se encontraron proyectos archivados.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTemplates.map(template => (
                                <div key={template.id} className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 transition-all hover:-translate-y-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                                <Layout size={20} />
                                            </div>
                                            <h3 className="font-black text-gray-900 leading-tight">{template.name}</h3>
                                        </div>
                                        <div className="text-[10px] font-mono text-gray-300 mb-6 uppercase tracking-widest bg-gray-50 p-2 rounded-lg truncate">
                                            ID: {template.id}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                            <Clock size={12} />
                                            {new Date(template.createdAt).toLocaleDateString()}
                                        </div>
                                        <button 
                                            onClick={() => {
                                                if (confirm('¿Eliminar esta plantilla?')) {
                                                    onDeleteTemplate(template.id);
                                                }
                                            }}
                                            className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-widest transition-colors"
                                        >
                                            ELIMINAR
                                        </button>
                                    </div>
                                </div>
                            ))}
                             {filteredTemplates.length === 0 && (
                                <div className="col-span-full py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Layout className="text-gray-200" size={48} />
                                        <p className="text-gray-400 font-bold">No hay plantillas guardadas.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'data' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-12">
                            <div className="text-center max-w-lg">
                                <div className="inline-block p-4 bg-blue-50 rounded-full text-blue-600 mb-6">
                                    <Database size={40} />
                                </div>
                                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Sincronización de Datos</h3>
                                <p className="text-gray-500 font-medium leading-relaxed italic">
                                    Exporta tu base de datos completa a un archivo JSON local como copia de seguridad, o importa archivos previos para restaurar información.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl px-4">
                                <button
                                    onClick={onExport}
                                    className="group relative bg-white border-2 border-gray-100 hover:border-blue-200 p-10 rounded-3xl transition-all hover:shadow-2xl hover:shadow-blue-50 text-center overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Download size={80} />
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 transform group-hover:scale-110 transition-transform">
                                            <Download size={32} />
                                        </div>
                                        <div>
                                            <span className="block font-black text-gray-900 text-lg">DESCARGAR BACKUP</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Database.json</span>
                                        </div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group relative bg-white border-2 border-gray-100 hover:border-emerald-200 p-10 rounded-3xl transition-all hover:shadow-2xl hover:shadow-emerald-50 text-center overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Upload size={80} />
                                    </div>
                                    <div className="relative z-10 flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 transform group-hover:scale-110 transition-transform">
                                            <Upload size={32} />
                                        </div>
                                        <div>
                                            <span className="block font-black text-gray-900 text-lg">IMPORTAR DATOS</span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Restaurar registros</span>
                                        </div>
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleFileUpload} 
                                        className="hidden" 
                                        accept=".json" 
                                    />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] pt-8">
                                <Globe size={12} /> Cloud Sync Active via Firestore
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
