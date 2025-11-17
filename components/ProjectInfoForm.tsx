import React from 'react';
import { UserProfile } from '../types';
import DictationButton from './DictationButton';

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

    const handleProfileFieldChange = (field: keyof UserProfile, value: string) => {
        onProfileChange({ ...userProfile, [field]: value });
    };
    
    const handleDictation = (field: keyof UserProfile | 'projectName', text: string) => {
        if (field === 'projectName') {
            const separator = projectName.trim() ? ' ' : '';
            onProjectNameChange(projectName + separator + text);
        } else {
            const currentVal = userProfile[field] || '';
            const separator = currentVal.trim() ? ' ' : '';
            handleProfileFieldChange(field, currentVal + separator + text);
        }
    };

    return (
        <div className="bg-sky-800 p-6 rounded-lg border border-sky-700 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">Información del Proyecto y Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Name */}
                <div>
                    <label htmlFor="projectName" className="block text-lg font-medium text-slate-200 mb-2">
                        Nombre del Proyecto <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="projectName"
                            value={projectName}
                            onChange={(e) => onProjectNameChange(e.target.value)}
                            placeholder="Ej: App de Recetas Saludables"
                            className={`w-full p-3 pr-12 bg-sky-900 border ${errors.projectName ? 'border-red-500' : 'border-sky-600'} rounded-md text-lg text-slate-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`}
                            aria-required="true"
                            aria-invalid={!!errors.projectName}
                            aria-describedby={errors.projectName ? "projectName-error" : undefined}
                        />
                         <DictationButton onDictate={(text) => handleDictation('projectName', text)} className="top-1/2 -translate-y-1/2 right-2" />
                    </div>
                     {errors.projectName && <p id="projectName-error" className="mt-1 text-sm text-red-400">{errors.projectName}</p>}
                </div>
                {/* Client Name */}
                <div>
                    <label htmlFor="userName" className="block text-lg font-medium text-slate-200 mb-2">
                        Nombre del Cliente <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="userName"
                            value={userProfile.name}
                            onChange={(e) => handleProfileFieldChange('name', e.target.value)}
                            placeholder="Ej: Juan Pérez"
                            className={`w-full p-3 pr-12 bg-sky-900 border ${errors.userName ? 'border-red-500' : 'border-sky-600'} rounded-md text-lg text-slate-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors`}
                             aria-required="true"
                            aria-invalid={!!errors.userName}
                            aria-describedby={errors.userName ? "userName-error" : undefined}
                        />
                         <DictationButton onDictate={(text) => handleDictation('name', text)} className="top-1/2 -translate-y-1/2 right-2" />
                    </div>
                     {errors.userName && <p id="userName-error" className="mt-1 text-sm text-red-400">{errors.userName}</p>}
                </div>
                 {/* Company */}
                <div>
                    <label htmlFor="company" className="block text-lg font-medium text-slate-200 mb-2">
                        Empresa (Opcional)
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="company"
                            value={userProfile.company}
                            onChange={(e) => handleProfileFieldChange('company', e.target.value)}
                            placeholder="Ej: Cocina Creativa S.A."
                            className="w-full p-3 pr-12 bg-sky-900 border border-sky-600 rounded-md text-lg text-slate-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        />
                         <DictationButton onDictate={(text) => handleDictation('company', text)} className="top-1/2 -translate-y-1/2 right-2" />
                    </div>
                </div>
                 {/* Email & Phone */}
                 <div>
                    <label htmlFor="email" className="block text-lg font-medium text-slate-200 mb-2">
                        Email y Teléfono (Opcional)
                    </label>
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                             <input
                                type="email"
                                id="email"
                                value={userProfile.email}
                                onChange={(e) => handleProfileFieldChange('email', e.target.value)}
                                placeholder="Email"
                                className="w-full p-3 pr-12 bg-sky-900 border border-sky-600 rounded-md text-lg text-slate-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            />
                             <DictationButton onDictate={(text) => handleDictation('email', text)} className="top-1/2 -translate-y-1/2 right-2" />
                        </div>
                        <div className="relative flex-1">
                             <input
                                type="tel"
                                id="phone"
                                value={userProfile.phone}
                                onChange={(e) => handleProfileFieldChange('phone', e.target.value)}
                                placeholder="Teléfono"
                                className="w-full p-3 pr-12 bg-sky-900 border border-sky-600 rounded-md text-lg text-slate-100 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                            />
                            <DictationButton onDictate={(text) => handleDictation('phone', text)} className="top-1/2 -translate-y-1/2 right-2" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectInfoForm;