import React from 'react';
import { UserProfile } from '../types';

interface ProjectInfoFormProps {
  projectName: string;
  userProfile: UserProfile;
  onProjectNameChange: (name: string) => void;
  onProfileChange: (profile: UserProfile) => void;
  errors: Record<string, string>;
}

const ProjectInfoForm: React.FC<ProjectInfoFormProps> = ({ 
  projectName, 
  userProfile, 
  onProjectNameChange, 
  onProfileChange,
  errors
}) => {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-100 border-2 border-gray-50 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
           <span className="font-black text-xl">1</span>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Contexto del Proyecto</h2>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Información básica necesaria</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Nombre del Proyecto</label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-8 focus:ring-blue-50 outline-none transition-all font-bold text-gray-800 ${
              errors.projectName ? 'border-red-100 focus:border-red-500' : 'border-gray-50 focus:border-blue-500'
            }`}
            placeholder="Ej: Eco-Delivery App"
          />
          {errors.projectName && <p className="mt-1 text-xs font-bold text-red-500 ml-2">{errors.projectName}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Cliente / Prospecto</label>
            <input
              type="text"
              value={userProfile.name}
              onChange={(e) => onProfileChange({ ...userProfile, name: e.target.value })}
              className={`w-full px-5 py-4 bg-gray-50 border-2 rounded-2xl focus:ring-8 focus:ring-blue-50 outline-none transition-all font-bold text-gray-800 ${
                errors.userName ? 'border-red-100 focus:border-red-500' : 'border-gray-50 focus:border-blue-500'
              }`}
              placeholder="Ej: Juan Pérez"
            />
             {errors.userName && <p className="mt-1 text-xs font-bold text-red-500 ml-2">{errors.userName}</p>}
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Empresa / Organización</label>
            <input
              type="text"
              value={userProfile.company}
              onChange={(e) => onProfileChange({ ...userProfile, company: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:ring-8 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
              placeholder="Ej: Green Logistics"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email de Contacto</label>
            <input
              type="email"
              value={userProfile.email}
              onChange={(e) => onProfileChange({ ...userProfile, email: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:ring-8 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
              placeholder="juan@ejemplo.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Teléfono</label>
            <input
              type="tel"
              value={userProfile.phone}
              onChange={(e) => onProfileChange({ ...userProfile, phone: e.target.value })}
              className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:ring-8 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all font-bold text-gray-800"
              placeholder="+34 ..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoForm;

