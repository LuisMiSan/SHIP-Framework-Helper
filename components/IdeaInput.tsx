import React, { useState, useRef, useEffect } from 'react';
import { StepData } from '../types';
import LoadingSpinner from './LoadingSpinner';
import Tooltip from './Tooltip';

interface StepCardProps {
  stepData: StepData;
  onInputChange: (value: string) => void;
  onGetAIHelp: () => void;
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

const StepCard: React.FC<StepCardProps> = ({ stepData, onInputChange, onGetAIHelp }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (textToCopy: string, index: number) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };
  
  const hasPreviousResponse = stepData.aiResponse.trim() !== '' || (stepData.aiResponseHistory && stepData.aiResponseHistory.length > 0);

  return (
    <div className="bg-gray-800/50 p-6 rounded-lg shadow-2xl border border-gray-700 animate-fade-in-up">
      <h2 className="text-2xl font-bold text-gray-100 mb-2">{stepData.title}</h2>
      <p className="text-gray-400 mb-4">
        {stepData.description.map((part, index) => {
          if (typeof part === 'string') {
            return <React.Fragment key={index}>{part}</React.Fragment>;
          }
          return (
            <Tooltip key={index} tip={part.tip}>
              <span className="text-indigo-400 underline decoration-dotted cursor-help font-semibold">
                {part.word}
              </span>
            </Tooltip>
          );
        })}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="user-input" className="block text-lg font-medium text-gray-300 mb-2">
            Tu Borrador
          </label>
          <textarea
            id="user-input"
            value={stepData.userInput}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder={stepData.placeholder}
            className="w-full p-4 bg-gray-900 border border-gray-600 rounded-md text-lg text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors h-64"
            disabled={stepData.isLoading}
          />
        </div>
        <div>
          <label htmlFor="ai-response" className="block text-lg font-medium text-gray-300 mb-2">
            Sugerencias de la IA
          </label>
          <div className="w-full p-4 bg-gray-900/80 border border-gray-600 rounded-md text-lg text-gray-300 h-64 overflow-y-auto whitespace-pre-wrap">
            {stepData.isLoading && !stepData.aiResponse ? <LoadingSpinner /> : (stepData.aiResponse ? <MarkdownRenderer text={stepData.aiResponse} /> : 'Aquí aparecerá la ayuda de la IA...')}
          </div>
        </div>
      </div>

      {stepData.aiResponseHistory && stepData.aiResponseHistory.length > 0 && (
        <div className="mt-6">
          <details className="bg-gray-900/50 rounded-lg border border-gray-700 group">
            <summary className="p-4 cursor-pointer text-lg font-medium text-gray-300 hover:bg-gray-800/50 rounded-t-lg transition-colors list-none flex justify-between items-center">
              <span>
                Historial de Sugerencias ({stepData.aiResponseHistory.length})
              </span>
              <svg className="w-5 h-5 transition-transform transform group-open:rotate-180" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-4 border-t border-gray-700 space-y-4 max-h-0 overflow-y-auto group-open:max-h-64 transition-all duration-500 ease-in-out">
              {stepData.aiResponseHistory.map((historyItem, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-md border border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-gray-500">Sugerencia Anterior #{stepData.aiResponseHistory.length - index}</h4>
                    <button
                      onClick={() => handleCopy(historyItem, index)}
                      className={`flex items-center text-xs font-semibold py-1 px-2 rounded-md transition-all duration-200 ${
                        copiedIndex === index
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {copiedIndex === index ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap text-gray-400">
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
          className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-lg text-lg hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none"
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