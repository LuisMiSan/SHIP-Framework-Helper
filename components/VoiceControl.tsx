import React, { useState, useEffect, useRef } from 'react';
import { VoiceCommand } from '../types';

// FIX: Add type definitions for the Web Speech API to resolve TypeScript errors.
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}
interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

type View = 'welcome' | 'new_project' | 'archive' | 'view_archived';

interface VoiceControlProps {
    onCommand: (command: VoiceCommand, value?: string) => void;
    view: View;
    currentStep: number;
    isSummaryStep: boolean;
    isProjectSaveable: boolean;
}

const commandMap: { keywords: string[]; command: VoiceCommand; view?: View[] }[] = [
    { keywords: ['siguiente', 'siguiente paso', 'avanzar'], command: 'NEXT_STEP', view: ['new_project'] },
    { keywords: ['anterior', 'paso anterior'], command: 'PREV_STEP', view: ['new_project'] },
    { keywords: ['obtener ayuda', 'ayuda de la ia', 'iterar'], command: 'GET_AI_HELP', view: ['new_project'] },
    { keywords: ['empezar nuevo proyecto', 'nuevo proyecto'], command: 'START_NEW', view: ['welcome'] },
    { keywords: ['ver proyectos', 'ver archivo', 'ver proyectos guardados'], command: 'VIEW_ARCHIVE', view: ['welcome'] },
    { keywords: ['volver', 'atrás'], command: 'GO_BACK', view: ['archive', 'view_archived'] },
    { keywords: ['guardar proyecto'], command: 'SAVE_PROJECT', view: ['new_project'] },
    { keywords: ['descargar pdf', 'descargar resumen'], command: 'DOWNLOAD_PDF', view: ['new_project'] },
];


const VoiceControl: React.FC<VoiceControlProps> = ({ onCommand, view, currentStep, isSummaryStep, isProjectSaveable }) => {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [feedback, setFeedback] = useState('');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSupported(true);
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'es-ES';
            recognition.interimResults = false;

            recognition.onstart = () => {
                setIsListening(true);
                setFeedback('Escuchando...');
            };

            recognition.onend = () => {
                setIsListening(false);
                setTimeout(() => setFeedback(''), 2000);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setFeedback(`Error: ${event.error}`);
            };

            recognition.onresult = (event) => {
                const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
                processTranscript(transcript);
            };
            
            recognitionRef.current = recognition;
        } else {
            setIsSupported(false);
        }
    }, []);

    const processTranscript = (transcript: string) => {
        let commandFound = false;

        for (const item of commandMap) {
            if (item.keywords.some(keyword => transcript.includes(keyword))) {
                // Context validation
                if (item.view && !item.view.includes(view)) continue;
                if (item.command === 'PREV_STEP' && currentStep === 0) continue;
                if (item.command === 'NEXT_STEP' && isSummaryStep) continue;
                if (item.command === 'SAVE_PROJECT' && (!isSummaryStep || !isProjectSaveable)) continue;
                if (item.command === 'DOWNLOAD_PDF' && !isSummaryStep) continue;

                setFeedback(`Comando: ${item.keywords[0]}`);
                onCommand(item.command);
                commandFound = true;
                break;
            }
        }

        if (!commandFound) {
            if (view === 'new_project' && !isSummaryStep) {
                setFeedback('Dictado añadido.');
                onCommand('DICTATE', transcript);
            } else {
                setFeedback('Comando no reconocido.');
            }
        }
    };

    const handleToggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Could not start speech recognition:", e);
                setFeedback('No se pudo iniciar.');
            }
        }
    };
    
    if (!isSupported) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {feedback && (
                <div className="absolute bottom-full right-0 mb-2 w-max bg-slate-700 text-white text-sm rounded-lg px-3 py-2 shadow-lg transition-opacity duration-300">
                    {feedback}
                </div>
            )}
            <button
                onClick={handleToggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-200 ${
                    isListening
                    ? 'bg-red-500 text-white animate-pulse ring-red-400'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-110 ring-indigo-500'
                }`}
                aria-label={isListening ? 'Detener grabación de voz' : 'Activar asistente de voz'}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </button>
        </div>
    )
};

export default VoiceControl;