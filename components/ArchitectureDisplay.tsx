import React, { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { StepData } from '../types';

interface SummaryDisplayProps {
  stepsData: StepData[];
  onRestart: () => void;
  onSaveProject: (projectName: string) => void;
  isArchived: boolean;
  isSaved: boolean;
  onBackToArchive?: () => void;
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

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ stepsData, onRestart, onSaveProject, isArchived, isSaved, onBackToArchive }) => {
  const summaryContentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const handleDownloadPDF = async () => {
    if (!summaryContentRef.current || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    
    try {
      const canvas = await html2canvas(summaryContentRef.current, {
        scale: 2,
        backgroundColor: '#111827',
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

      pdf.save('SHIP_Framework_Resumen.pdf');
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSave = () => {
    const projectName = window.prompt("Por favor, introduce un nombre para este proyecto:", "Mi Nuevo Proyecto");
    if (projectName && projectName.trim()) {
      onSaveProject(projectName.trim());
    }
  };


  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-2xl border border-gray-700 animate-fade-in-up">
      <div ref={summaryContentRef} className="space-y-8 bg-gray-900 p-8 rounded">
        <h2 className="text-3xl font-bold text-center text-gray-100">Resumen de tu Proyecto</h2>
        
        {stepsData.map(step => (
          <div key={step.id} className="border-b border-gray-700 pb-6 last:border-b-0">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-4">{step.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-2">Tu Borrador</h4>
                <p className="bg-gray-800 p-4 rounded-md whitespace-pre-wrap text-gray-400">{step.userInput || 'No se proporcionó información.'}</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-300 mb-2">Sugerencias de la IA</h4>
                <div className="bg-gray-800 p-4 rounded-md whitespace-pre-wrap text-gray-400">
                  {step.aiResponse ? <MarkdownRenderer text={step.aiResponse} /> : 'No se generó ninguna sugerencia.'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap">
        {isArchived ? (
            <button
            onClick={onBackToArchive}
            className="w-full sm:w-auto px-8 py-3 bg-gray-700 text-white font-bold rounded-lg text-lg hover:bg-gray-600 transition-all transform hover:scale-105"
            >
            &larr; Volver al Archivo
            </button>
        ) : (
            <button
            onClick={onRestart}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-lg text-lg hover:from-teal-600 hover:to-cyan-600 transition-all transform hover:scale-105"
            >
            Empezar un Nuevo Proyecto
            </button>
        )}
        
        {!isArchived && (
           <button
           onClick={handleSave}
           disabled={isSaved}
           className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-teal-800 text-white font-bold rounded-lg text-lg hover:bg-teal-700 transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
         >
           {isSaved ? <span className="flex items-center justify-center animate-pop-in">✔️ Guardado</span> : '📂 Guardar Proyecto'}
         </button>
        )}

        <button
          id="download-pdf-button"
          onClick={handleDownloadPDF}
          disabled={isGeneratingPdf}
          className="w-full sm:w-auto flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg text-lg hover:bg-indigo-700 transition-all transform hover:scale-105 disabled:bg-indigo-900 disabled:cursor-not-allowed disabled:transform-none"
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
      </div>
    </div>
  );
};

export default SummaryDisplay;