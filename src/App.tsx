
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { 
    StepData, 
    ArchivedProject, 
    VoiceCommand, 
    UserProfile, 
    ProjectStatus, 
    AISettings, 
    ProjectTemplate, 
    View, 
    GroundingChunk 
} from './types';
import { auth, db } from './lib/firebase';
import { firestoreService } from './lib/firestoreService';
import { useAppData } from './hooks/useAppData';
import { useProject } from './hooks/useProject';
import { useAutoSave } from './hooks/useAutoSave';

import StepCard from './components/IdeaInput';
import SummaryDisplay from './components/ArchitectureDisplay';
import WelcomeScreen from './components/WelcomeScreen';
import DatabaseView from './components/DatabaseView';
import VoiceControl from './components/VoiceControl';
import ProjectInfoForm from './components/ProjectInfoForm';
import SettingsModal from './components/SettingsModal';
import SaveTemplateModal from './components/SaveTemplateModal';
import AdminPanel from './components/AdminPanel';
import LoginOverlay from './components/LoginOverlay';
import LoadingSpinner from './components/LoadingSpinner';

import { LogOut, User as UserIcon, Settings, Database, RotateCcw } from 'lucide-react';

// =================================================================
// AUDIO HELPER FUNCTIONS
// =================================================================

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

const getAIPrompt = (stepId: string, context: Record<string, string>, previousResponse: string): string => {
  const iterationPreamble = `Actúa como un coach de producto que está ayudando a un usuario a iterar. Tu sugerencia anterior fue: "${previousResponse}". El usuario ha actualizado su entrada. Proporciona un nuevo conjunto de sugerencias basadas en su entrada actualizada, reconociendo las mejoras o cambios si es posible. Aquí está la tarea original y la nueva entrada del usuario:\n\n---\n\n`;
  let prompt = '';

  switch (stepId) {
    case 'solve':
      prompt = `Eres un coach de producto de clase mundial. Analiza el siguiente planteamiento del problema de un usuario: "${context.solve}".
Tu tarea es ayudar a refinarlo. Responde con la siguiente estructura, utilizando formato Markdown:
1.  **Preguntas Clave:** Formula 2-3 preguntas incisivas para ayudar al usuario a profundizar en la causa raíz y validar sus suposiciones.
2.  **Público Objetivo:** Describe el perfil del usuario ideal para este problema. Sé específico.
3.  **Planteamiento Refinado:** Reescribe el planteamiento del problema en una sola frase clara e impactante, usando el formato: "Para [Público Objetivo] que lucha con [Problema Específico], nuestra solución ayudará a [Resultado Deseado]."`;
      break;
    case 'hypothesize':
      prompt = `Eres un estratega de producto experto. El usuario está trabajando sobre este problema: "${context.solve}". Han propuesto la siguiente hipótesis: "${context.hypothesize}".
Tu tarea es fortalecer esta hipótesis. Responde con esta estructura, utilizando formato Markdown:
1.  **Análisis de la Hipótesis:** Evalúa brevemente la hipótesis del usuario. ¿Es clara y comprobable?
2.  **Hipótesis Mejorada:** Reescribe la hipótesis usando el formato riguroso: "Creemos que al construir [Solución/Característica] para [Público Objetivo], lograremos [Resultado Medible]. Sabremos que esto es cierto cuando veamos [Métrica Específica] cambiar de [Valor Actual] a [Valor Objetivo]."
3.  **Métricas Clave:** Sugiere 2-3 métricas (una principal y dos secundarias) para rastrear el éxito y explica por qué son importantes.`;
      break;
    case 'implement':
      prompt = `Eres un gerente de producto pragmático, experto en MVP. El usuario quiere probar esta hipótesis: "${context.hypothesize}". Su plan inicial es: "${context.implement}".
Tu tarea es definir un MVP ultra-enfocado. Responde con esta estructura, utilizando formato Markdown:
1.  **Características Esenciales del MVP (Checklist):** Enumera las 3-5 características absolutamente mínimas necesarias para probar la hipótesis central. Para cada una, explica por qué es indispensable.
2.  **Lo que hay que OMITIR:** Enumera 2-3 características comunes o "agradables de tener" que deberían ser explícitamente excluidas del MVP para evitar la sobrecarga de funciones.
3.  **Prueba más simple:** ¿Cuál es la forma más rápida y barata de probar la idea principal, incluso antes de escribir una línea de código? (Ej: una página de aterrizaje, un prototipo manual, etc.)`;
      break;
    case 'persevere':
      prompt = `Eres un experimentado asesor de startups. Un equipo ha obtenido los siguientes resultados de su MVP: "${context.persevere}". Su contexto es: Problema: "${context.solve}" e Hipótesis: "${context.hypothesize}".
Tu tarea es dar un consejo claro y accionable. Responde con esta estructura, utilizando formato Markdown:
1.  **Interpretación de los Resultados:** ¿Qué te dicen estos datos? Extrae 1-2 aprendizajes clave de los resultados del usuario.
2.  **Decisión Estratégica:** Basado en los aprendizajes, da una recomendación clara: **Perseverar**, **Pivotar**, o **Abandonar**. Justifica tu elección en una frase.
3.  **Próximos Pasos Concretos:** Proporciona una lista de 3 a 5 pasos siguientes y accionables que el equipo debería tomar en las próximas dos semanas basándose en tu recomendación.`;
      break;
    default:
      return '';
  }

  return previousResponse ? iterationPreamble + prompt : prompt;
};

const validateInput = (stepId: string, userInput: string): { isValid: boolean; message: string } => {
  const trimmedInput = userInput.trim();

  if (trimmedInput.length < 50) {
    return {
      isValid: false,
      message: 'Tu descripción es muy corta. Intenta detallar más tu idea para obtener mejores sugerencias (mínimo 50 caracteres).',
    };
  }
  return { isValid: true, message: '' };
};

// =================================================================
// SUB-COMPONENTS
// =================================================================

interface ProjectWorkspaceProps {
    project: ReturnType<typeof useProject>;
    aiSettings: AISettings;
    onSaveProject: (projectData: Omit<ArchivedProject, 'id' | 'savedAt' | 'status'>) => void;
    onSaveAsTemplate: (data: StepData[]) => void;
    onPlaySpeech: (text: string, stepId: string) => Promise<void>;
    speechPlayingForStep: string | null;
}

const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ project, aiSettings, onSaveProject, onSaveAsTemplate, onPlaySpeech, speechPlayingForStep }) => {
    const { stepsData, setStepsData, projectName, setProjectName, currentProjectProfile, setCurrentProjectProfile, validationErrors, setValidationErrors, isProjectSaved, setIsProjectSaved } = project;
    const [showSummary, setShowSummary] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleGetAIHelp = useCallback(async (index: number) => {
        const currentStepData = stepsData[index];
        const validation = validateInput(currentStepData.id, currentStepData.userInput);
        if (!validation.isValid) {
            setValidationErrors(prev => ({ ...prev, [currentStepData.id]: validation.message }));
            return;
        }
        setValidationErrors(prev => ({ ...prev, [currentStepData.id]: '' }));
        if (!currentStepData.userInput.trim()) return;

        setApiError(null);
        const previousResponse = currentStepData.aiResponse.trim();
        
        setStepsData(prev => prev.map((step, i) => i === index ? {
            ...step,
            isLoading: true,
            aiResponse: '',
            groundingChunks: [],
            aiResponseHistory: (previousResponse && (step.aiResponseHistory[0] !== previousResponse)) ? [previousResponse, ...step.aiResponseHistory] : step.aiResponseHistory
        } : step));

        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("Clave de API no disponible en el servidor.");
            }
            const ai = new GoogleGenAI({ apiKey });
            const context = {
                solve: stepsData[0].userInput,
                hypothesize: stepsData[1].userInput,
                implement: stepsData[2].userInput,
                persevere: stepsData[3].userInput,
            };
            const prompt = getAIPrompt(currentStepData.id, context, previousResponse);

            const isThinkingMode = aiSettings.useThinkingMode && !aiSettings.useGoogleSearch;
            const useGoogleSearch = aiSettings.useGoogleSearch;

            let modelToUse = isThinkingMode ? 'gemini-3.1-pro-preview' : aiSettings.model;
            if (useGoogleSearch) {
                modelToUse = 'gemini-3-flash-preview';
            }
            
            const config: any = {
                temperature: aiSettings.temperature,
            };

            if (isThinkingMode) {
                config.thinkingConfig = { thinkingBudget: 32768 };
            }
            if (useGoogleSearch) {
                config.tools = [{googleSearch: {}}];
            }

            const responseStream = await ai.models.generateContentStream({
                model: modelToUse,
                contents: [{ parts: [{ text: prompt }] }],
                config,
            });

            for await (const chunk of responseStream) {
                const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
                
                setStepsData(prev => {
                    const newData = [...prev];
                    newData[index].aiResponse += chunk.text;
                     if (chunks) {
                        const existingUris = new Set((newData[index].groundingChunks || []).map(c => c.web?.uri));
                        const newChunks = (chunks as GroundingChunk[]).filter(c => c.web && !existingUris.has(c.web.uri));
                        if(newChunks.length > 0) {
                             newData[index].groundingChunks = [...(newData[index].groundingChunks || []), ...newChunks];
                        }
                    }
                    return newData;
                });
            }
        } catch (err) {
            console.error("Error getting AI help:", err);
            setApiError(`No pude contactar a la IA. (Detalle: ${err instanceof Error ? err.message : 'Error desconocido'})`);
        } finally {
            setStepsData(prev => prev.map((step, i) => i === index ? { ...step, isLoading: false } : step));
        }
    }, [stepsData, aiSettings, setStepsData, setValidationErrors]);

    const handleTranscribeAudio = useCallback(async (index: number, blob: Blob) => {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) throw new Error("Clave de API no disponible.");

            const base64Audio = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const result = reader.result as string;
                    resolve(result.split(',')[1]);
                };
                reader.onerror = reject;
            });
    
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: {
                    parts: [
                        { inlineData: { mimeType: blob.type, data: base64Audio } },
                        { text: 'Transcribe el siguiente audio de forma precisa. Devuelve únicamente el texto transcrito.' }
                    ]
                },
            });
        
            const transcribedText = response.text;
            if (transcribedText) {
                project.handleDictation(index, transcribedText);
            }
        } catch(err) {
            console.error("Error transcribing audio:", err);
            setApiError('No se pudo transcribir el audio. Por favor, inténtalo de nuevo.');
        }

    }, [project]);

    const handleShowSummary = () => {
        const newErrors: Record<string, string> = {};
        let allValid = true;

        if (!projectName.trim()) {
            newErrors['projectName'] = 'El nombre del proyecto es obligatorio.';
            allValid = false;
        }
        if (!currentProjectProfile.name.trim()) {
            newErrors['userName'] = 'El nombre del cliente es obligatorio.';
            allValid = false;
        }
        stepsData.forEach(step => {
            const validation = validateInput(step.id, step.userInput);
            if (!validation.isValid) {
                newErrors[step.id] = validation.message;
                allValid = false;
            }
        });
        setValidationErrors(newErrors);
        
        if (allValid) {
            setShowSummary(true);
            setApiError(null);
            window.scrollTo(0, 0);
        } else {
            setApiError("Por favor, completa todos los campos obligatorios antes de ver el resumen.");
        }
    };
    
    const handleSaveAndArchive = () => {
        onSaveProject({
            name: projectName,
            data: stepsData,
            userProfile: currentProjectProfile,
        });
        setIsProjectSaved(true);
    };

    if (showSummary) {
        return (
            <SummaryDisplay
                project={{
                    id: 'current',
                    name: projectName,
                    savedAt: new Date().toISOString(),
                    data: stepsData,
                    userProfile: currentProjectProfile,
                    status: 'pending',
                }}
                onRestart={() => setShowSummary(false)}
                onSaveProject={handleSaveAndArchive}
                isArchived={false}
                isSaved={isProjectSaved}
                onUpdateProjectStatus={() => {}}
                onSaveAsTemplate={onSaveAsTemplate}
            />
        );
    }
    
    return (
         <div className="max-w-5xl mx-auto">
            <ProjectInfoForm
                projectName={projectName}
                userProfile={currentProjectProfile}
                onProjectNameChange={setProjectName}
                onProfileChange={setCurrentProjectProfile}
                errors={validationErrors}
            />

            <div className="my-8 h-px bg-slate-700" />

            {stepsData.map((step, index) => (
                <div key={step.id} ref={el => { stepRefs.current[index] = el; }} className="mb-8 scroll-mt-24">
                    <StepCard
                        stepData={step}
                        onInputChange={(value) => project.handleInputChange(index, value)}
                        onGetAIHelp={() => handleGetAIHelp(index)}
                        validationError={validationErrors[step.id] || null}
                        onRestoreAIResponse={(response) => project.handleRestoreAIResponse(index, response)}
                        onDictate={(text) => project.handleDictation(index, text)}
                        onTranscribeAudio={(blob) => handleTranscribeAudio(index, blob)}
                        onPlaySpeech={onPlaySpeech}
                        isSpeechPlaying={speechPlayingForStep === step.id}
                    />
                </div>
            ))}

            <div className="mt-12 text-center">
                 {apiError && (
                    <div role="alert" className="mb-4 p-4 bg-red-900/40 border border-red-600 text-red-300 rounded-md">
                        {apiError}
                    </div>
                )}
                <button
                    onClick={handleShowSummary}
                    className="w-full sm:w-auto px-12 py-5 bg-orange-500 text-white font-bold rounded-lg text-xl hover:bg-orange-600 transition-all transform hover:scale-105 shadow-lg shadow-orange-500/30"
                >
                    Ver Resumen del Proyecto
                </button>
            </div>
        </div>
    );
};

// =================================================================
// MAIN APP COMPONENT
// =================================================================

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [view, setView] = useState<View>('welcome');
  const [selectedArchivedProject, setSelectedArchivedProject] = useState<ArchivedProject | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [projectToTemplate, setProjectToTemplate] = useState<StepData[] | null>(null);
  const [speechState, setSpeechState] = useState<{ playing: boolean, forStep: string | null }>({ playing: false, forStep: null });
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  const { archive, templates, aiSettings, isLoading: isDataLoading, handleSaveSettings, exportDatabase, importDatabase } = useAppData();
  const project = useProject(() => setView('new_project'));
  const autoSaveStatus = useAutoSave({ stepsData: project.stepsData, projectName: project.projectName, currentProjectProfile: project.currentProjectProfile });
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      
      if (user) {
          const savedView = localStorage.getItem('ship-framework-last-view') as View;
          const hasInProgress = project.loadInProgressProject();
          
          if (savedView === 'database' || savedView === 'admin' || savedView === 'new_project') {
             setView(savedView);
          } else {
             setView(hasInProgress ? 'new_project' : 'welcome');
          }
      }
    });

    return () => unsub();
  }, [project.loadInProgressProject]);

  useEffect(() => {
      if (view && view !== 'view_archived' && isAuthReady && currentUser) {
          localStorage.setItem('ship-framework-last-view', view);
      }
  }, [view, isAuthReady, currentUser]);

  const hasUnsavedChanges = useCallback(() => {
      if (project.isProjectSaved) return false;
      const { stepsData, projectName, currentProjectProfile } = project;
      const isPristine = stepsData.every(step => !step.userInput.trim() && !step.aiResponse.trim()) && !projectName.trim() && !currentProjectProfile.name.trim();
      return !isPristine;
  }, [project]);

  const attemptNavigation = useCallback((callback: () => void) => {
      if (view === 'new_project' && hasUnsavedChanges()) {
          setPendingNavigation(() => callback);
      } else {
          callback();
      }
  }, [view, hasUnsavedChanges]);

  const handlePlaySpeech = useCallback(async (text: string, stepId: string) => {
    if (speechState.playing) {
        audioSourceRef.current?.stop();
        setSpeechState({ playing: false, forStep: null });
        if (speechState.forStep === stepId) return;
    }

    setSpeechState({ playing: true, forStep: stepId });
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("Clave de API no disponible.");
        
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: { responseModalities: [Modality.AUDIO] },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.onended = () => setSpeechState({ playing: false, forStep: null });
            source.start();
            audioSourceRef.current = source;
        } else {
            setSpeechState({ playing: false, forStep: null });
        }
    } catch (error) {
        console.error("Speech generation failed", error);
        setSpeechState({ playing: false, forStep: null });
    }
}, [speechState]);
  
  const handleSaveProject = useCallback(async (projectData: Omit<ArchivedProject, 'id' | 'savedAt' | 'status'>) => {
      const newArchivedProject: ArchivedProject = {
          ...projectData,
          id: new Date().getTime().toString(),
          savedAt: new Date().toISOString(),
          status: 'pending'
      };
      await firestoreService.saveProject(newArchivedProject);
      localStorage.removeItem('ship-framework-data');
      setTimeout(() => {
          project.resetProject();
          setView('welcome');
      }, 500);
  }, [project]);
  
  const handleDeleteProject = useCallback(async (projectId: string) => {
    await firestoreService.deleteProject(projectId);
  }, []);
  
  const handleUpdateProjectStatus = useCallback(async (projectId: string, status: ProjectStatus) => {
    await firestoreService.updateProjectStatus(projectId, status);
  }, []);
  
  const handleViewProject = useCallback((project: ArchivedProject) => {
    setSelectedArchivedProject(project);
    setView('view_archived');
  }, []);
  
  const handleSaveAsTemplate = useCallback((data: StepData[]) => {
    setProjectToTemplate(data);
    setIsSaveTemplateModalOpen(true);
  }, []);

  const handleConfirmSaveTemplate = useCallback(async (templateName: string) => {
    if (!projectToTemplate) return;
    const newTemplate: ProjectTemplate = {
      id: new Date().getTime().toString(),
      name: templateName,
      createdAt: new Date().toISOString(),
      data: projectToTemplate,
    };
    await firestoreService.saveTemplate(newTemplate);
    setIsSaveTemplateModalOpen(false);
    setProjectToTemplate(null);
  }, [projectToTemplate]);
  
  const handleDeleteTemplate = useCallback(async (templateId: string) => {
    await firestoreService.deleteTemplate(templateId);
  }, []);
  
  const handleStartFromTemplate = useCallback((template: ProjectTemplate) => {
    project.startFromTemplate(template);
    setView('new_project');
  }, [project]);

  const handleLoadProjectToWorkspace = useCallback((archivedProject: ArchivedProject) => {
    project.loadArchivedProject(archivedProject);
    setView('new_project');
  }, [project]);

  const handleVoiceCommand = (command: VoiceCommand) => {
    switch (command) {
        case 'START_NEW':
            if (view === 'welcome') attemptNavigation(project.resetProject);
            break;
        case 'VIEW_DATABASE':
            attemptNavigation(() => setView('database'));
            break;
        case 'GO_BACK':
            if (['view_archived', 'database', 'admin'].includes(view)) setView('welcome');
            break;
    }
  };

  if (!isAuthReady) return <LoadingSpinner />;
  if (!currentUser) return <LoginOverlay />;

  const renderContent = () => {
    switch (view) {
      case 'welcome':
        return <WelcomeScreen
          onStartNew={() => attemptNavigation(project.resetProject)}
          templates={templates}
          onStartFromTemplate={(template) => attemptNavigation(() => handleStartFromTemplate(template))}
          onDeleteTemplate={handleDeleteTemplate}
          onNavigateToDatabase={() => attemptNavigation(() => setView('database'))}
        />;
      case 'database':
        return <DatabaseView
          archive={archive}
          onViewProject={handleViewProject}
          onDeleteProject={handleDeleteProject}
          onUpdateProjectStatus={handleUpdateProjectStatus}
          onBack={() => setView('welcome')}
          onExport={exportDatabase}
          onImport={importDatabase}
        />;
      case 'view_archived':
        return selectedArchivedProject && <SummaryDisplay
            project={selectedArchivedProject}
            onRestart={project.resetProject}
            onSaveProject={() => {}}
            isArchived={true}
            isSaved={true}
            onBackToArchive={() => setView('database')}
            onUpdateProjectStatus={handleUpdateProjectStatus}
            onSaveAsTemplate={handleSaveAsTemplate}
        />;
      case 'new_project':
        return <ProjectWorkspace
            project={project}
            aiSettings={aiSettings}
            onSaveProject={handleSaveProject}
            onSaveAsTemplate={handleSaveAsTemplate}
            onPlaySpeech={(text, stepId) => handlePlaySpeech(text, stepId)}
            speechPlayingForStep={speechState.forStep}
        />;
      case 'admin':
        return <AdminPanel
            archive={archive}
            templates={templates}
            onDeleteProject={handleDeleteProject}
            onUpdateProjectStatus={handleUpdateProjectStatus}
            onDeleteTemplate={handleDeleteTemplate}
            onLoadProjectToWorkspace={(p) => attemptNavigation(() => handleLoadProjectToWorkspace(p))}
            onExport={exportDatabase}
            onImport={importDatabase}
            onClose={() => setView('welcome')}
        />
      default:
        return <div>Error: Vista desconocida</div>;
    }
  };

  const allStepsComplete = project.stepsData.every(step => step.userInput.trim().length > 0);
  const isSaveable = project.projectName.trim().length > 0 && project.currentProjectProfile.name.trim().length > 0 && allStepsComplete;

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {isSettingsModalOpen && (
          <SettingsModal
              currentSettings={aiSettings}
              onSave={(s) => { handleSaveSettings(s); setIsSettingsModalOpen(false); }}
              onClose={() => setIsSettingsModalOpen(false)}
          />
      )}
      {isSaveTemplateModalOpen && (
          <SaveTemplateModal
              onSave={handleConfirmSaveTemplate}
              onClose={() => setIsSaveTemplateModalOpen(false)}
          />
      )}
      {pendingNavigation && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[110] p-4 animate-fade-in-up">
            <div className="bg-sky-800 rounded-2xl shadow-2xl p-8 max-w-md w-full" role="dialog" aria-modal="true">
                <h2 className="text-2xl font-bold text-slate-100">¿Descartar cambios?</h2>
                <p className="text-slate-300 my-4">Tienes cambios sin guardar. Si continúas, se perderá tu progreso actual.</p>
                <div className="flex justify-end gap-4 mt-8">
                    <button onClick={() => setPendingNavigation(null)} className="px-6 py-2 bg-slate-600 text-slate-100 font-bold rounded-lg hover:bg-slate-500 transition-colors">Cancelar</button>
                    <button onClick={() => { pendingNavigation?.(); setPendingNavigation(null); }} className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">Descartar</button>
                </div>
            </div>
        </div>
      )}
        
      <header className="flex justify-between items-center mb-8 sticky top-0 bg-sky-950/80 backdrop-blur-md py-4 z-40 -mx-4 px-4 border-b border-sky-800">
           <h1 onClick={() => view !== 'welcome' && attemptNavigation(() => setView('welcome'))} className={`text-3xl md:text-4xl font-black text-slate-100 tracking-tighter sm:tracking-normal ${view !== 'welcome' ? 'cursor-pointer' : ''}`}>
              S.H.I.P. <span className="font-light text-slate-500 hidden sm:inline">Helper</span>
           </h1>
          
          <div className="flex items-center gap-3">
              {autoSaveStatus !== 'idle' && view === 'new_project' && (
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                       {autoSaveStatus === 'saving' ? <RotateCcw className="animate-spin h-3 w-3" /> : '✓'} {autoSaveStatus === 'saving' ? 'Auto-guardando...' : 'Borrador guardado'}
                  </div>
              )}

              <div className="flex items-center bg-sky-900/50 rounded-full px-2 py-1 border border-sky-800">
                  <button onClick={() => attemptNavigation(() => setView('database'))} className={`p-2 rounded-full transition-colors ${view === 'database' ? 'text-orange-400 bg-sky-800/80' : 'text-slate-400 hover:text-slate-200'}`} title="Base de datos">
                    <Database className="h-5 w-5" />
                  </button>
                  <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-full text-slate-400 hover:text-slate-200 transition-colors" title="Ajustes">
                    <Settings className="h-5 w-5" />
                  </button>
                  <div className="w-px h-6 bg-sky-800 mx-1" />
                  <div className="flex items-center gap-2 pl-2 pr-1">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                          {currentUser.photoURL ? <img src={currentUser.photoURL} alt="" referrerPolicy="no-referrer" /> : <UserIcon className="w-4 h-4" />}
                      </div>
                      <button onClick={() => signOut(auth)} className="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Cerrar sesión">
                          <LogOut className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          </div>
      </header>
      
      {isDataLoading ? <LoadingSpinner /> : renderContent()}

      <VoiceControl
        onCommand={handleVoiceCommand}
        view={view}
        showSummary={false} 
        isProjectSaveable={!project.isProjectSaved && isSaveable}
      />
    </main>
  );
};

export default App;
