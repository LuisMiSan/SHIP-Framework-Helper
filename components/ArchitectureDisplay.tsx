import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ArchivedProject, ProjectStatus, StepData } from '../types';
import StatusBadge from './StatusBadge';

interface SummaryDisplayProps {
  project: ArchivedProject;
  onRestart: () => void;
  onSaveProject: () => void;
  isArchived: boolean;
  isSaved: boolean;
  onBackToArchive?: () => void;
  onUpdateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  onSaveAsTemplate: (data: StepData[]) => void;
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  const elements = text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });

  return <>{elements}</>;
};

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ project, onRestart, onSaveProject, isArchived, isSaved, onBackToArchive, onUpdateProjectStatus, onSaveAsTemplate }) => {
  const summaryContentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const handleDownloadPDF = async () => {
    if (!summaryContentRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    
    try {
      const canvas = await html2canvas(summaryContentRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft > 0) {
        position -= pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`SHIP_Resumen_${project.name}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSave = () => {
    onSaveProject();
  };

  const hasProfileData = project.userProfile && (project.userProfile.name || project.userProfile.company || project.userProfile.email || project.userProfile.phone);

  return (
    <div className="bg-white p-6 rounded-lg animate-fade-in-up">
      <div ref={summaryContentRef} className="space-y-8 bg-white p-8 rounded">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">{project.name}</h2>
            {isArchived && <div className="mt-2"><StatusBadge status={project.status} /></div>}
        </div>
        
        {hasProfileData && (
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <h3 className="text-xl font-bold text-slate-700 mb-4">Información del Cliente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-600">
                  <p><strong>Nombre:</strong> {project.userProfile.name || 'N/A'}</p>
                  <p><strong>Empresa:</strong> {project.userProfile.company || 'N/A'}</p>
                  <p><strong>Email:</strong> {project.userProfile.email || 'N/A'}</p>
                  <p><strong>Teléfono:</strong> {project.userProfile.phone || 'N/A'}</p>
              </div>
          </div>
        )}

        {project.data.map(step => (
          <div key={step.id} className="border-b border-slate-200 pb-6 last:border-b-0">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-4">{step.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-2">Tu Borrador</h4>
                <p className="bg-slate-50 p-4 rounded-md whitespace-pre-wrap text-slate-600 border border-slate-200">{step.userInput || 'No se proporcionó información.'}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-700 mb-2">Sugerencias de la IA</h4>
                <div className="bg-slate-50 p-4 rounded-md whitespace-pre-wrap text-slate-600 border border-slate-200">
                  {step.aiResponse ? <MarkdownRenderer text={step.aiResponse} /> : 'No se generó ninguna sugerencia.'}
                </div>
                 {step.groundingChunks && step.groundingChunks.length > 0 && (
                    <div className="mt-2 p-2 bg-slate-100 border border-slate-200 rounded-md">
                        <h5 className="text-xs font-semibold text-slate-500 mb-1">Fuentes:</h5>
                        <ul className="space-y-1">
                            {step.groundingChunks.map((chunk, i) => (
                                chunk.web && (
                                    <li key={i} className="text-xs">
                                        <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
                                            {chunk.web.title || chunk.web.uri}
                                        </a>
                                    </li>
                                )
                            ))}
                        </ul>
                    </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap">
        {isArchived ? (
            <>
              <button onClick={onBackToArchive} className="w-full sm:w-auto px-6 py-3 bg-slate-200 text-slate-800 font-bold rounded-lg text-lg hover:bg-slate-300 transition-all transform hover:scale-105">
                &larr; Volver a la Base de Datos
              </button>
               <button
                  onClick={onRestart}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-lg text-lg hover:from-teal-600 hover:to-cyan-600 transition-all transform hover:scale-105"
                >
                Empezar un Nuevo Proyecto
               </button>
              <div className="flex gap-2">
                <button onClick={() => onUpdateProjectStatus(project.id, 'success')} className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-700 transition-all transform hover:scale-105">
                  Éxito
                </button>
                <button onClick={() => onUpdateProjectStatus(project.id, 'failed')} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-lg text-lg hover:bg-red-700 transition-all transform hover:scale-105">
                  Falló
                </button>
              </div>
            </>
        ) : (
            <button
            onClick={onRestart}
            className="w-full sm:w-auto px-8 py-3 bg-slate-200 text-slate-800 font-bold rounded-lg text-lg hover:bg-slate-300 transition-all transform hover:scale-105"
            >
            &larr; Volver y Editar
            </button>
        )}
        
        {!isArchived && (
           <button
           onClick={handleSave}
           disabled={isSaved}
           className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-teal-800 text-white font-bold rounded-lg text-lg hover:bg-teal-700 transition-all transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
         >
           {isSaved ? <span className="flex items-center justify-center animate-pop-in">✔️ Guardado</span> : '📂 Guardar y Salir'}
         </button>
        )}

        <button
          id="download-pdf-button"
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg text-lg hover:bg-indigo-700 transition-all transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGeneratingPdf ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Generando PDF...</span>
            </>
          ) : (
            <span>Descargar como PDF</span>
          )}
        </button>
        <button
          onClick={() => onSaveAsTemplate(project.data)}
          className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-slate-600 text-white font-bold rounded-lg text-lg hover:bg-slate-700 transition-all transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Guardar como Plantilla</span>
        </button>
      </div>
    </div>
  );
};

export default SummaryDisplay;