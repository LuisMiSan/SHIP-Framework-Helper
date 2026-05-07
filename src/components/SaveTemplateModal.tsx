import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { ProjectTemplate } from '../types';

interface SaveTemplateModalProps {
  onClose: () => void;
  onSave: (templateName: string) => void;
  currentProjectName: string;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({ 
  onClose, 
  onSave,
  currentProjectName 
}) => {
  const [name, setName] = useState(`${currentProjectName} Template`);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('E-commerce');

  const categories = ['E-commerce', 'SaaS', 'Fintech', 'Health', 'Education', 'Other'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Save className="text-blue-600" size={24} />
            Guardar Plantilla
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nombre de la Plantilla</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none font-bold appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Descripción (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Para qué tipo de proyectos es ideal esta plantilla?"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none font-medium h-24 resize-none"
            />
          </div>
        </div>

        <div className="p-6 bg-gray-50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-6 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all border border-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(name)}
            disabled={!name}
            className="flex-1 py-3 px-6 rounded-xl font-black bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveTemplateModal;
