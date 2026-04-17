import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ArchivedProject, ProjectStatus, StepData } from '../types';
import StatusBadge from './StatusBadge';
import { FileText, Save, Layout, ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock, Download, Copy } from 'lucide-react';

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
        backgroundColor: '#0f172a', // Corresponds to slate-900 or a dark blue
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
    <div className="bg-sky-800 p-6 rounded-lg animate-fade-in-up">
      <div ref={summaryContentRef} className="space-y-8 bg-sky-800 p-8 rounded text-slate-200">
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-100">{project.name}</h2>
            {isArchived && <div className="mt-2"><StatusBadge status={project.status} /></div>}
        </div>
        
        {hasProfileData && (
          <div className="bg-sky-700/50 p-6 rounded-lg border border-sky-700">
              <h3 className="text-xl font-bold text-slate-200 mb-4">Información del Cliente</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-300">
                  <p><strong>Nombre:</strong> {project.userProfile.name || 'N/A'}</p>
                  <p><strong>Empresa:</strong> {project.userProfile.company || 'N/A'}</p>
                  <p><strong>Email:</strong> {project.userProfile.email || 'N/A'}</p>
                  <p><strong>Teléfono:</strong> {project.userProfile.phone || 'N/A'}</p>
              </div>
          </div>
        )}

        {project.data.map(step => (
          <div key={step.id} className="border-b border-sky-700 pb-6 last:border-b-0">
            <h3 className="text-2xl font-bold text-sky-300 mb-4">{step.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-slate-200 mb-2">Tu Borrador</h4>
                <p className="bg-sky-900 p-4 rounded-md whitespace-pre-wrap text-slate-300 border border-sky-700">{step.userInput || 'No se proporcionó información.'}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-200 mb-2">Sugerencias de la IA</h4>
                <div className="bg-sky-900 p-4 rounded-md whitespace-pre-wrap text-slate-300 border border-sky-700">
                  {step.aiResponse ? <MarkdownRenderer text={step.aiResponse} /> : 'No se generó ninguna sugerencia.'}
                </div>
                 {step.groundingChunks && step.groundingChunks.length > 0 && (
                    <div className="mt-2 p-2 bg-sky-800 border border-sky-700 rounded-md">
                        <h5 className="text-xs font-semibold text-slate-400 mb-1">Fuentes:</h5>
                        <ul className="space-y-1">
                            {step.groundingChunks.map((chunk, i) => (
                                chunk.web && (
                                    <li key={i} className="text-xs">
                                        <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline break-all">
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
              <button onClick={onBackToArchive} className="w-full sm:w-auto px-6 py-3 bg-slate-600 text-slate-100 font-bold rounded-lg text-lg hover:bg-slate-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" /> Volver a la Base de Datos
              </button>
               <button
                  onClick={onRestart}
                  className="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white font-bold rounded-lg text-lg hover:bg-orange-600 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                <RefreshCw className="w-5 h-5" /> Empezar un Nuevo Proyecto
               </button>
              <div className="flex gap-2">
                <button onClick={() => onUpdateProjectStatus(project.id, 'success')} className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg text-lg hover:bg-green-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Éxito
                </button>
                <button onClick={() => onUpdateProjectStatus(project.id, 'failed')} className="w-full sm:w-auto px-6 py-3 bg-red-600 text-white font-bold rounded-lg text-lg hover:bg-red-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5" /> Falló
                </button>
              </div>
            </>
        ) : (
            <button
            onClick={onRestart}
            className="w-full sm:w-auto px-8 py-3 bg-slate-600 text-slate-100 font-bold rounded-lg text-lg hover:bg-slate-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
            <ArrowLeft className="w-5 h-5" /> Volver y Editar
            </button>
        )}
        
        {!isArchived && (
           <button
           onClick={handleSave}
           disabled={isSaved}
           className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-sky-700 text-white font-bold rounded-lg text-lg hover:bg-sky-600 transition-all transform hover:scale-105 disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none"
         >
           {isSaved ? <span className="flex items-center justify-center animate-pop-in gap-2"><CheckCircle className="w-5 h-5" /> Guardado</span> : <><Save className="w-5 h-5" /> Guardar y Salir</>}
         </button>
        )}

        <button
          id="download-pdf-button"
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-sky-600 text-white font-bold rounded-lg text-lg hover:bg-sky-700 transition-all transform hover:scale-105 disabled:bg-sky-700 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGeneratingPdf ? (
            <>
              <RefreshCw className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              <span>Generando PDF...</span>
            </>
          ) : (
            <span className="flex items-center gap-2 flex-center"><Download className="w-5 h-5" /> Descargar como PDF</span>
          )}
        </button>
        <button
          onClick={() => onSaveAsTemplate(project.data)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-sky-700 text-white font-bold rounded-lg text-lg hover:bg-sky-600 transition-all transform hover:scale-105"
        >
          <Layout className="w-5 h-5" />
          <span>Guardar como Plantilla</span>
        </button>
      </div>
    </div>
  );
};

export default SummaryDisplay;