import React from 'react';
import { motion } from 'motion/react';
import { Share2, Download, CheckCircle2, RotateCcw, Save, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { StepData, ArchivedProject, ProjectStatus } from '../types';
import StatusBadge from './StatusBadge';

interface SummaryDisplayProps {
  project: ArchivedProject;
  onRestart: () => void;
  onSaveProject: () => void;
  isArchived: boolean;
  isSaved: boolean;
  onBackToArchive: () => void;
  onUpdateProjectStatus: (id: string, status: ProjectStatus) => void;
  onSaveAsTemplate: (steps: StepData[]) => void;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ 
  project, 
  onRestart,
  onSaveProject,
  isArchived,
  isSaved,
  onBackToArchive,
  onUpdateProjectStatus,
  onSaveAsTemplate
}) => {
  const steps = project.data;

  const getStepStatus = (step: StepData) => {
    if (step.userInput && step.aiResponse) return 'completed';
    if (step.userInput) return 'draft';
    return 'pending';
  };

  const statusIcons = {
    completed: <CheckCircle2 className="text-green-500" size={18} />,
    draft: <div className="w-[18px] h-[18px] rounded-full border-2 border-yellow-400" />,
    pending: <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200" />
  };

  const handleExportPDF = () => {
    // PDF export logic would go here
    alert('Función de exportar PDF pronto disponible.');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={isArchived ? onBackToArchive : onRestart}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-bold"
        >
          <ArrowLeft size={20} />
          {isArchived ? 'VOLVER AL ARCHIVO' : 'VOLVER AL EDITOR'}
        </button>

        <div className="flex gap-3">
          {!isSaved && !isArchived && (
            <button
              onClick={onSaveProject}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
            >
              <Save size={18} />
              GUARDAR PROYECTO
            </button>
          )}
          <button
            onClick={() => onSaveAsTemplate(steps)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
          >
            GUARDAR COMO PLANTILLA
          </button>
        </div>
      </div>

      <div id="project-summary-export" className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-blue-800 p-8 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <div className="text-6xl font-black">S.H.I.P.</div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <StatusBadge status={project.status} />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-200">REPORTE ESTRATÉGICO</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-4">{project.name}</h1>
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-blue-100 font-medium text-sm">
              <div className="flex items-center gap-2">
                <span className="opacity-60">Cliente:</span> {project.userProfile.name}
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-60">Empresa:</span> {project.userProfile.company}
              </div>
              <div className="flex items-center gap-2">
                <span className="opacity-60">Generado:</span> {new Date(project.savedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          {/* Dashboard Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {steps.map((step) => (
              <div key={step.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-black text-gray-200">{step.id.toUpperCase()[0]}</span>
                  {statusIcons[getStepStatus(step)]}
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{step.id}</div>
              </div>
            ))}
          </div>

          <div className="space-y-16">
            {steps.map((step, idx) => (
              <div key={step.id} className="relative">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-2xl text-blue-600 shadow-sm border border-blue-100">
                    {idx + 1}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{step.title}</h2>
                      <div className="h-px flex-grow bg-gray-100"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {step.userInput ? (
                        <div className="bg-white p-6 rounded-2xl border-2 border-gray-50 shadow-sm">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Definición del Usuario</h4>
                          <p className="text-gray-800 leading-relaxed font-medium">{step.userInput}</p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-6 rounded-2xl border border-dashed border-gray-200">
                          <p className="text-gray-400 italic text-sm">No se proporcionó entrada para este paso.</p>
                        </div>
                      )}

                      {step.aiResponse && (
                        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 relative">
                          <div className="absolute -top-3 left-6 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                            IA INSIGHTS
                          </div>
                          <div className="text-blue-900 leading-relaxed font-medium whitespace-pre-wrap mt-2">
                            {step.aiResponse}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 p-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs font-bold gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-blue-500" />
            S.H.I.P. FRAMEWORK HELPER - VERSIÓN 2.5
          </div>
          <div className="flex gap-6">
            <button onClick={handleExportPDF} className="hover:text-white transition-colors flex items-center gap-2">
              <Download size={14} /> PDF
            </button>
            <span className="opacity-30">|</span>
            <span>LICENCIA EDUCATIVA</span>
          </div>
        </div>
      </div>

      {!isArchived && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onRestart}
            className="flex items-center gap-2 text-gray-400 hover:text-blue-600 font-bold transition-all"
          >
            <RotateCcw size={18} />
            REINICIAR TODO EL PROCESO
          </button>
        </div>
      )}
    </div>
  );
};

export default SummaryDisplay;

