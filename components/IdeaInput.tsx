


import React, { useState } from 'react';
import { StepData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Tooltip from './Tooltip';
import DictationButton from './DictationButton';

interface StepCardProps {
  stepData: StepData;
  onInputChange: (value: string) => void;
  onGetAIHelp: () => void;
  validationError: string | null;
  onRestoreAIResponse: (response: string) => void;
  onDictate: (text: string) => void;
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

const StepCard: React.FC<StepCardProps> = ({ stepData, onInputChange, onGetAIHelp, validationError, onRestoreAIResponse, onDictate }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isCurrentResponseCopied, setIsCurrentResponseCopied] = useState(false);

  const handleCopy = (textToCopy: string, index: number) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleCopyCurrentResponse = () => {
    if (!stepData.aiResponse) return;
    navigator.clipboard.writeText(stepData.aiResponse).then(() => {
      setIsCurrentResponseCopied(true);
      setTimeout(() => setIsCurrentResponseCopied(false), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };
  
  const hasPreviousResponse = stepData.aiResponse.trim() !== '' || (stepData.aiResponseHistory && stepData.aiResponseHistory.length > 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-slate-200 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">{stepData.title}</h2>
      <p className="text-slate-600 mb-4">
        {stepData.description.map((part, index) => {
          if (typeof part === 'string') {
            return <React.Fragment key={index}>{part}</React.Fragment>;
          }
          return (
            <Tooltip key={index} tip={part.tip}>
              <span className="text-indigo-500 underline decoration-dotted cursor-help font-semibold">
                {part.word}
              </span>
            </Tooltip>
          );
        })}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="user-input" className="block text-lg font-medium text-slate-700 mb-2">
            Tu Borrador
          </label>
          <div className="relative">
            <textarea
              id="user-input"
              value={stepData.userInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={stepData.placeholder}
              className="w-full p-4 pr-14 bg-slate-100 border border-slate-300 rounded-md text-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-64"
              disabled={stepData.isLoading}
              aria-invalid={!!validationError}
              aria-describedby={validationError ? "user-input-error" : undefined}
            />
            <DictationButton onDictate={onDictate} disabled={stepData.isLoading} className="bottom-3 right-3" />
          </div>
           {validationError && (
            <div id="user-input-error" role="alert" className="mt-2 p-3 bg-red-50 border border-red-400 text-red-700 text-sm rounded-md flex items-start gap-2 animate-fade-in-up">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 011-1h.008a1 1 0 011 1v3a1 1 0 01-1 1h-.008a1 1 0 01-1-1V5z" clipRule="evenodd" />
              </svg>
              <span>{validationError}</span>
            </div>
          )}
        </div>
        <div>
          <label htmlFor="ai-response" className="block text-lg font-medium text-slate-700 mb-2">
            Sugerencias de la IA
          </label>
          <div className="relative">
            <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-md text-lg text-slate-700 h-64 overflow-y-auto whitespace-pre-wrap">
              {stepData.isLoading && !stepData.aiResponse ? <LoadingSpinner /> : (stepData.aiResponse ? <MarkdownRenderer text={stepData.aiResponse} /> : 'Aquí aparecerá la ayuda de la IA...')}
            </div>
            {stepData.aiResponse && !stepData.isLoading && (
              <button
                onClick={handleCopyCurrentResponse}
                className={`absolute top-3 right-3 flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-md transition-all duration-200 ${
                  isCurrentResponseCopied
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
                aria-label="Copiar sugerencia"
              >
                {isCurrentResponseCopied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copiar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {stepData.aiResponseHistory && stepData.aiResponseHistory.length > 0 && (
        <div className="mt-6">
          <details className="bg-slate-50 rounded-lg border border-slate-200 group">
            <summary className="p-4 cursor-pointer text-lg font-medium text-slate-700 hover:bg-slate-100 rounded-t-lg transition-colors list-none flex justify-between items-center">
              <span>
                Historial de Sugerencias ({stepData.aiResponseHistory.length})
              </span>
              <svg className="w-5 h-5 transition-transform transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-4 border-t border-slate-200 space-y-4 max-h-0 overflow-y-auto group-open:max-h-64 transition-all duration-500 ease-in-out">
              {stepData.aiResponseHistory.map((historyItem, index) => (
                <div key={index} className="bg-white p-4 rounded-md border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-slate-500">Sugerencia Anterior #{stepData.aiResponseHistory.length - index}</h4>
                    <div className="flex items-center gap-2">
                       <button
                        onClick={() => onRestoreAIResponse(historyItem)}
                        className="flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-md transition-all duration-200 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
                        aria-label={`Restaurar sugerencia #${stepData.aiResponseHistory.length - index}`}
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                         </svg>
                         <span>Restaurar</span>
                       </button>
                      <button
                        onClick={() => handleCopy(historyItem, index)}
                        className={`flex items-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-md transition-all duration-200 ${
                          copiedIndex === index
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        aria-label={`Copiar sugerencia #${stepData.aiResponseHistory.length - index}`}
                      >
                        {copiedIndex === index ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Copiado</span>
                          </>
                        ) : (
                          <>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap text-slate-500">
                    <MarkdownRenderer text={historyItem} />
                  </div>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={onGetAIHelp}
          disabled={!stepData.userInput.trim() || stepData.isLoading}
          className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-lg text-lg hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed disabled:transform-none"
        >
          {stepData.isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Pensando...</span>
            </>
          ) : (
            <span>{hasPreviousResponse ? 'Iterar con IA' : 'Obtener Ayuda de IA'}</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default StepCard;