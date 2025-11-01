import React, { useState } from 'react';
import { UserProfile } from '../types';
import DictationButton from './DictationButton';

interface UserProfileSetupProps {
    onSave: (profile: UserProfile) => void;
    onClose: () => void;
    existingProfile: UserProfile | null;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ onSave, onClose, existingProfile }) => {
    const [profile, setProfile] = useState<UserProfile>(
        existingProfile || { name: '', company: '', email: '', phone: '' }
    );
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleDictation = (fieldName: keyof UserProfile, text: string) => {
        const currentVal = profile[fieldName] || '';
        const separator = currentVal.trim() ? ' ' : '';
        setProfile(prev => ({ ...prev, [fieldName]: currentVal + separator + text }));
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!profile.name.trim()) {
            newErrors.name = 'El nombre es obligatorio.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(profile);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full transform transition-all" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div className="flex justify-between items-center mb-4">
                    <h2 id="modal-title" className="text-2xl font-bold text-slate-800">
                        {existingProfile ? 'Actualizar Perfil de Cliente' : 'Crear Perfil de Cliente'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Cerrar">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className="text-slate-600 mb-6">Esta información se asociará al proyecto que estás guardando. Solo se te pedirá una vez.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700">Nombre Completo <span className="text-red-500">*</span></label>
                        <div className="relative mt-1">
                            <input type="text" name="name" id="name" value={profile.name} onChange={handleChange} className={`block w-full px-3 py-2 pr-12 bg-white border ${errors.name ? 'border-red-500' : 'border-slate-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`} />
                            <DictationButton onDictate={(text) => handleDictation('name', text)} className="top-1/2 -translate-y-1/2 right-2" />
                        </div>
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-slate-700">Empresa (Opcional)</label>
                        <div className="relative mt-1">
                            <input type="text" name="company" id="company" value={profile.company} onChange={handleChange} className="block w-full px-3 py-2 pr-12 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                            <DictationButton onDictate={(text) => handleDictation('company', text)} className="top-1/2 -translate-y-1/2 right-2" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email (Opcional)</label>
                        <div className="relative mt-1">
                            <input type="email" name="email" id="email" value={profile.email} onChange={handleChange} className="block w-full px-3 py-2 pr-12 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                             <DictationButton onDictate={(text) => handleDictation('email', text)} className="top-1/2 -translate-y-1/2 right-2" />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Teléfono (Opcional)</label>
                        <div className="relative mt-1">
                            <input type="tel" name="phone" id="phone" value={profile.phone} onChange={handleChange} className="block w-full px-3 py-2 pr-12 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                            <DictationButton onDictate={(text) => handleDictation('phone', text)} className="top-1/2 -translate-y-1/2 right-2" />
                        </div>
                    </div>

                    <div className="!mt-6 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                        <p className="text-xs text-slate-500">
                            <strong>Aviso de Privacidad:</strong> Esta información se guarda <strong>únicamente en tu navegador</strong> y no se envía a ningún servidor. No introduzcas datos sensibles si compartes este dispositivo.
                        </p>
                    </div>

                    <div className="flex justify-end gap-4 !mt-8">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors">
                            Guardar y Continuar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserProfileSetup;