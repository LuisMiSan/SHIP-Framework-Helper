import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { StepData, ArchivedProject, VoiceCommand, UserProfile, ProjectStatus, AISettings } from './types';
import ProgressBar from './components/ProgressBar';
import StepCard from './components/IdeaInput';
import SummaryDisplay from './components/ArchitectureDisplay';
import ApiKeySetup from './components/ApiKeySetup';
import WelcomeScreen from './components/WelcomeScreen';
import ArchiveView from './components/ArchiveView';
import VoiceControl from './components/VoiceControl';
import UserProfileSetup from './components/UserProfileSetup';
import SaveProjectModal from './components/SaveProjectModal';
import SettingsModal from './components/SettingsModal';

const initialStepsData: StepData[] = [
  {
    id: 'solve',
    title: 'Paso 1: Definir el Problema',
    description: [
      'Describe claramente el problema que quieres resolver. ¿Para quién es? ¿Por qué es importante? Intenta llegar a la ',
      { word: 'causa raíz', tip: 'El problema fundamental que, si se resolviera, eliminaría muchos problemas superficiales.' },
      '.'
    ],
    placeholder: 'Ej: Los cocineros aficionados tienen dificultades para encontrar recetas saludables y fáciles que se ajusten a sus restricciones dietéticas...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: [],
  },
  {
    id: 'hypothesize',
    title: 'Paso 2: Formular una Hipótesis',
    description: [
      'Propón una solución. ¿Cuál es tu ',
      { word: 'hipótesis', tip: 'Una suposición comprobable sobre cómo tu solución resolverá el problema para tus usuarios.' },
      ' sobre cómo resolver el problema y cómo medirás el éxito?'
    ],
    placeholder: 'Ej: Creemos que una app móvil con filtros de recetas por dieta, alergias y tiempo de preparación ayudará a los cocineros a encontrar comidas adecuadas rápidamente. El éxito se medirá por el número de recetas guardadas...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: [],
  },
  {
    id: 'implement',
    title: 'Paso 3: Planificar la Implementación (MVP)',
    description: [
      'Define el ',
      { word: 'Producto Mínimo Viable (MVP)', tip: 'La versión más simple de un producto que se puede lanzar para probar la hipótesis principal con el menor esfuerzo.' },
      '. ¿Cuáles son las características esenciales para probar tu hipótesis?'
    ],
    placeholder: 'Ej: 1. Buscador de recetas con filtros. 2. Página de detalles de la receta. 3. Opción para guardar recetas favoritas...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: [],
  },
  {
    id: 'persevere',
    title: 'Paso 4: Perseverar o Pivotar',
    description: [
      'Imagina que has lanzado tu MVP. Describe los resultados (reales o imaginarios) y reflexiona sobre los siguientes pasos. ¿Debes ',
      { word: 'Perseverar', tip: 'Continuar con la misma estrategia porque los resultados son prometedores.' },
      ' o ',
      { word: 'Pivotar', tip: 'Hacer un cambio fundamental en tu estrategia basado en lo que has aprendido.' },
      '?'
    ],
    placeholder: 'Ej: Después del lanzamiento, notamos que muchos usuarios guardan recetas pero pocos las cocinan. Los comentarios indican que los ingredientes son difíciles de encontrar...',
    userInput: '',
    aiResponse: '',
    isLoading: false,
    aiResponseHistory: [],
  },
];

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

  // Se han eliminado todas las validaciones de palabras clave para fomentar un enfoque más empático y flexible.
  // Confiamos en que la IA guíe al usuario para refinar sus ideas, en lugar de imponer reglas estrictas sobre cómo deben expresarlas.
  // El único requisito es una longitud mínima para asegurar que la IA tenga suficiente contexto para proporcionar ayuda de calidad.

  return { isValid: true, message: '' };
};

type View = 'welcome' | 'new_project' | 'archive' | 'view_archived';

const App: React.FC = () => {
  const [view, setView] = useState<View>('welcome');
  const [archive, setArchive] = useState<ArchivedProject[]>([]);
  const [selectedArchivedProject, setSelectedArchivedProject] = useState<ArchivedProject | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepsData, setStepsData] = useState<StepData[]>(initialStepsData);
  const [isProjectSaved, setIsProjectSaved] = useState(false);
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [profileSetupIntent, setProfileSetupIntent] = useState<'start_new' | 'save_project' | null>(null);


  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<'valid' | 'missing' | 'invalid'>('valid');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [aiSettings, setAiSettings] = useState<AISettings>({ temperature: 0.7, model: 'gemini-2.5-flash' });
  const latestStateRef = useRef({ stepsData, currentStep });

  // Keep the ref updated with the latest state for the auto-save interval
  useEffect(() => {
    latestStateRef.current = { stepsData, currentStep };
  }, [stepsData, currentStep]);
  
  // Auto-save progress
  useEffect(() => {
    if (view !== 'new_project') {
      return;
    }
  
    const intervalId = setInterval(() => {
      const { stepsData: latestStepsData, currentStep: latestCurrentStep } = latestStateRef.current;
      // Don't save if the project is pristine and empty
      const isPristine = latestStepsData.every(step => step.userInput.trim() === '' && step.aiResponse.trim() === '');
      if (isPristine) {
        return;
      }
        
      setAutoSaveStatus('saving');
      
      try {
        localStorage.setItem('ship-framework-data', JSON.stringify(latestStepsData));
        localStorage.setItem('ship-framework-step', JSON.stringify(latestCurrentStep));
        
        setTimeout(() => setAutoSaveStatus('saved'), 500);
        setTimeout(() => setAutoSaveStatus('idle'), 3000); // Hide notification after 3 seconds
  
      } catch (error) {
        console.error("Failed to auto-save progress to localStorage", error);
        setAutoSaveStatus('idle'); // Reset on error
      }
    }, 90000); // Auto-save every 90 seconds (1.5 minutes)
  
    return () => clearInterval(intervalId);
  }, [view]);

  // API Key Check & Initial data loading
  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyStatus('missing');
    }

    try {
        const savedSettings = localStorage.getItem('ship-framework-settings');
        if (savedSettings) {
          try {
            const parsedSettings = JSON.parse(savedSettings);
            if (
                typeof parsedSettings.temperature === 'number' &&
                (parsedSettings.model === 'gemini-2.5-flash' || parsedSettings.model === 'gemini-2.5-pro')
            ) {
                setAiSettings(parsedSettings);
            } else if (typeof parsedSettings.temperature === 'number') {
                // Handle old settings format without model by adding the default
                setAiSettings({ temperature: parsedSettings.temperature, model: 'gemini-2.5-flash' });
            }
          } catch(e) {
            console.error("Failed to parse AI settings.", e);
          }
        }

        const savedProfile = localStorage.getItem('ship-framework-user-profile');
        if(savedProfile) {
          setUserProfile(JSON.parse(savedProfile));
        }

        const savedArchive = localStorage.getItem('ship-framework-archive');
        if (savedArchive) {
          try {
            setArchive(JSON.parse(savedArchive));
          } catch(e) {
            console.error("Failed to parse archive, clearing.", e);
            localStorage.removeItem('ship-framework-archive');
          }
        }

        const savedData = localStorage.getItem('ship-framework-data');
        const savedStep = localStorage.getItem('ship-framework-step');
        if(savedData && savedStep) {
            const parsedData = JSON.parse(savedData);
            const parsedStep = JSON.parse(savedStep);
            if (Array.isArray(parsedData) && parsedData.length === initialStepsData.length && typeof parsedStep === 'number') {
                setStepsData(parsedData.map((step: Partial<StepData>) => ({
                    ...initialStepsData.find(s => s.id === step.id)!,
                    ...step,
                    aiResponseHistory: step.aiResponseHistory || [],
                })));
                setCurrentStep(parsedStep);
                setIsProjectSaved(false); // A resumed project is not saved yet
                setView('new_project');
                return;
            }
        }
        
        setView('welcome');

    } catch (error) {
        console.error("Failed to load data from localStorage", error);
        setView('welcome');
    }

  }, []);

  const updateAndSaveArchive = (newArchive: ArchivedProject[]) => {
    setArchive(newArchive);
    try {
      if (newArchive.length > 0) {
        localStorage.setItem('ship-framework-archive', JSON.stringify(newArchive));
      } else {
        localStorage.removeItem('ship-framework-archive');
      }
    } catch (error) {
      console.error("Failed to save archive to localStorage", error);
    }
  };

  const handleInputChange = (value: string) => {
    setValidationError(null);
    const newStepsData = [...stepsData];
    newStepsData[currentStep].userInput = value;
    setStepsData(newStepsData);
  };

  const handleDictation = (text: string) => {
    const currentInput = stepsData[currentStep].userInput;
    const separator = currentInput.trim() && text ? ' ' : '';
    handleInputChange(currentInput + separator + text);
  };

  const handleGetAIHelp = async () => {
    const currentStepData = stepsData[currentStep];

    const validation = validateInput(currentStepData.id, currentStepData.userInput);
    if (!validation.isValid) {
        setValidationError(validation.message);
        return;
    }
    setValidationError(null);
    
    if (!currentStepData.userInput.trim()) return;

    setError(null);
    
    const previousResponse = currentStepData.aiResponse.trim();

    setStepsData(prevData => {
        const newData = [...prevData];
        const stepToUpdate = newData[currentStep];
        
        stepToUpdate.isLoading = true;
        stepToUpdate.aiResponse = '';
        
        if (previousResponse) {
          const currentHistory = stepToUpdate.aiResponseHistory;
          if (currentHistory.length === 0 || currentHistory[0] !== previousResponse) {
            stepToUpdate.aiResponseHistory = [previousResponse, ...currentHistory];
          }
        }

        return newData;
    });
    
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        setApiKeyStatus('missing');
        throw new Error("API key not found.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const context = {
        solve: stepsData[0].userInput,
        hypothesize: stepsData[1].userInput,
        implement: stepsData[2].userInput,
        persevere: stepsData[3].userInput,
      };

      const prompt = getAIPrompt(currentStepData.id, context, previousResponse);
      
      const responseStream = await ai.models.generateContentStream({
        model: aiSettings.model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          temperature: aiSettings.temperature,
        },
      });

      for await (const chunk of responseStream) {
        setStepsData(prevData => {
            const newData = [...prevData];
            newData[currentStep].aiResponse += chunk.text;
            return newData;
        });
      }
    } catch (err) {
      console.error("Error getting AI help:", err);
      let isKeyError = false;
      let detailedError = "Ocurrió un error inesperado.";

      if (err instanceof Error) {
        detailedError = err.message;
        const lowerCaseError = err.message.toLowerCase();
        if (lowerCaseError.includes('api key not valid') || lowerCaseError.includes('invalid api key')) {
          setApiKeyStatus('invalid');
          isKeyError = true;
        } else if (lowerCaseError.includes('api key not found')) {
          setApiKeyStatus('missing');
          isKeyError = true;
        }
      }
      
      if (!isKeyError) {
        setError(`No pude contactar a la IA. Por favor, inténtalo de nuevo más tarde. (Detalle: ${detailedError})`);
      }

    } finally {
        setStepsData(prevData => {
            const newData = [...prevData];
            newData[currentStep].isLoading = false;
            return newData;
        });
    }
  };

  const goToNextStep = () => {
    if (currentStep < stepsData.length) {
        const currentStepData = stepsData[currentStep];
        const validation = validateInput(currentStepData.id, currentStepData.userInput);
        if (!validation.isValid) {
            setValidationError(validation.message);
            return;
        }
    }
    setValidationError(null);

    if (currentStep < stepsData.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startNewProjectFlow = () => {
    try {
      localStorage.removeItem('ship-framework-data');
      localStorage.removeItem('ship-framework-step');
    } catch (error) {
      console.error("Failed to clear localStorage", error);
    }
    setStepsData(initialStepsData);
    setCurrentStep(0);
    setError(null);
    setValidationError(null);
    setIsProjectSaved(false);
    setView('new_project');
  };

  const handleRestart = () => {
    if (!userProfile) {
      setProfileSetupIntent('start_new');
      setIsProfileModalOpen(true);
    } else {
      startNewProjectFlow();
    }
  };

  const handleSaveRequest = () => {
    if (!userProfile) {
      setProfileSetupIntent('save_project');
      setIsProfileModalOpen(true);
    } else {
      setIsSaveModalOpen(true);
    }
  };

  const handleSaveProjectRequest = (projectName: string) => {
    if (!projectName.trim()) return;
    setIsSaveModalOpen(false);
    if (userProfile) {
      saveProject(projectName, userProfile);
    } else {
      console.error("Attempted to save project without a user profile.");
      setError("No se pudo guardar el proyecto porque falta el perfil de usuario.");
    }
  };

  const saveProject = (projectName: string, profile: UserProfile) => {
      const newArchivedProject: ArchivedProject = {
          id: new Date().toISOString(),
          name: projectName,
          savedAt: new Date().toISOString(),
          data: stepsData,
          userProfile: profile,
          status: 'pending'
      };
      updateAndSaveArchive([newArchivedProject, ...archive]);
      
      try {
        localStorage.removeItem('ship-framework-data');
        localStorage.removeItem('ship-framework-step');
      } catch (error) {
        console.error("Failed to clear in-progress session from localStorage", error);
      }
      
      setIsProjectSaved(true);
      setIsProfileModalOpen(false);
      
      setTimeout(() => {
        setView('welcome');
      }, 500); // Brief delay to show "Saved" status before navigating
  };

  const handleProfileSave = (profile: UserProfile) => {
    setUserProfile(profile);
    try {
        localStorage.setItem('ship-framework-user-profile', JSON.stringify(profile));
    } catch (error) {
        console.error("Failed to save user profile to localStorage", error);
    }

    setIsProfileModalOpen(false);

    if (profileSetupIntent === 'start_new') {
      setProfileSetupIntent(null);
      startNewProjectFlow();
    } else if (profileSetupIntent === 'save_project') {
        setProfileSetupIntent(null);
        setIsSaveModalOpen(true);
    }
  };

  const handleSaveSettings = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    try {
        localStorage.setItem('ship-framework-settings', JSON.stringify(newSettings));
    } catch (error) {
        console.error("Failed to save AI settings to localStorage", error);
    }
    setIsSettingsModalOpen(false);
  };


  const handleDeleteProject = (projectId: string) => {
    updateAndSaveArchive(archive.filter(p => p.id !== projectId));
  };
  
  const handleUpdateProjectStatus = (projectId: string, status: ProjectStatus) => {
    updateAndSaveArchive(archive.map(p => p.id === projectId ? { ...p, status } : p));
  };
  
  const handleViewProject = (project: ArchivedProject) => {
    setSelectedArchivedProject(project);
    setView('view_archived');
  };

  const handleRestoreAIResponse = (responseToRestore: string) => {
    setStepsData(prevData => {
        const newData = [...prevData];
        const stepToUpdate = newData[currentStep];

        const currentResponse = stepToUpdate.aiResponse;
        const oldHistory = stepToUpdate.aiResponseHistory;

        let newHistory = oldHistory.filter(item => item !== responseToRestore);

        if (currentResponse.trim()) {
            newHistory.unshift(currentResponse);
        }

        newHistory.unshift(responseToRestore);

        stepToUpdate.aiResponse = responseToRestore;
        stepToUpdate.aiResponseHistory = newHistory;

        return newData;
    });
  };

  const handleVoiceCommand = (command: VoiceCommand, value?: string) => {
    switch(command) {
        case 'NEXT_STEP':
            if (view === 'new_project' && currentStep < stepsData.length) goToNextStep();
            break;
        case 'PREV_STEP':
            if (view === 'new_project' && currentStep > 0) goToPrevStep();
            break;
        case 'GET_AI_HELP':
            if (view === 'new_project' && currentStep < stepsData.length) handleGetAIHelp();
            break;
        case 'DICTATE':
            if (view === 'new_project' && currentStep < stepsData.length && value) {
                const currentInput = stepsData[currentStep].userInput;
                const separator = currentInput.trim() ? ' ' : '';
                handleInputChange(currentInput + separator + value);
            }
            break;
        case 'START_NEW':
            if (view === 'welcome') {
                handleRestart();
            }
            break;
        case 'VIEW_ARCHIVE':
             // This command is now obsolete as archive is part of welcome view
            break;
        case 'GO_BACK':
            if (view === 'view_archived') setView('welcome');
            break;
        case 'SAVE_PROJECT':
            if (view === 'new_project' && currentStep === stepsData.length && !isProjectSaved) {
                handleSaveRequest();
            }
            break;
        case 'DOWNLOAD_PDF':
             if ((view === 'new_project' && currentStep === stepsData.length) || view === 'view_archived') {
                const downloadButton = document.getElementById('download-pdf-button');
                downloadButton?.click();
            }
            break;
    }
  };

  if (apiKeyStatus !== 'valid') {
    return <ApiKeySetup reason={apiKeyStatus} />;
  }
  
  const isSummaryStep = view === 'new_project' && currentStep === stepsData.length;

  const renderContent = () => {
    switch (view) {
        case 'welcome':
            return (
                <WelcomeScreen 
                    onStartNew={handleRestart}
                    archive={archive}
                    onViewProject={handleViewProject}
                    onDeleteProject={handleDeleteProject}
                    onUpdateProjectStatus={handleUpdateProjectStatus}
                />
            );
        case 'archive':
             // This view is deprecated, navigate to welcome instead.
             // For safety, render a minimal fallback.
            return <ArchiveView archive={[]} onBack={() => setView('welcome')} onDeleteProject={()=>{}} onUpdateProjectStatus={()=>{}} onViewProject={()=>{}}/>
        case 'view_archived':
            return (
                <SummaryDisplay
                    project={selectedArchivedProject!}
                    onRestart={handleRestart}
                    onSaveProject={() => {}} // Not applicable
                    isArchived={true}
                    isSaved={true}
                    onBackToArchive={() => setView('welcome')}
                    onUpdateProjectStatus={handleUpdateProjectStatus}
                />
            );
        case 'new_project':
            return (
                <>
                    <ProgressBar steps={stepsData.map(s => s.title.split(': ')[1])} currentStep={currentStep} />
                    
                    {error && <div className="my-4 text-center bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg">{error}</div>}

                    {isSummaryStep ? (
                        <SummaryDisplay 
                            project={{ 
                              id: 'current', 
                              name: 'Proyecto Actual', 
                              savedAt: new Date().toISOString(),
                              data: stepsData,
                              userProfile: userProfile || { name: '', company: '', email: '', phone: '' },
                              status: 'pending',
                            }}
                            onRestart={handleRestart} 
                            onSaveProject={handleSaveRequest} 
                            isArchived={false}
                            isSaved={isProjectSaved}
                            onUpdateProjectStatus={() => {}}
                        />
                    ) : (
                        <>
                        <StepCard 
                            key={currentStep}
                            stepData={stepsData[currentStep]}
                            onInputChange={handleInputChange}
                            onGetAIHelp={handleGetAIHelp}
                            validationError={validationError}
                            onRestoreAIResponse={handleRestoreAIResponse}
                            onDictate={handleDictation}
                        />
                        <div className="mt-6 flex justify-between">
                            <button
                            onClick={goToPrevStep}
                            disabled={currentStep === 0}
                            className="px-6 py-2 bg-slate-200 text-slate-800 font-bold rounded-lg hover:bg-slate-300 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                            >
                            Anterior
                            </button>
                            <button
                            onClick={goToNextStep}
                            className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors"
                            >
                            {currentStep === stepsData.length - 1 ? 'Ver Resumen' : 'Siguiente'}
                            </button>
                        </div>
                        </>
                    )}
                </>
            );
    }
  }

  return (
    <div className="min-h-screen text-slate-800 font-sans p-4 sm:p-6 md:p-8">
      {isSaveModalOpen && (
          <SaveProjectModal
              onSave={handleSaveProjectRequest}
              onClose={() => setIsSaveModalOpen(false)}
              defaultName="Mi Nuevo Proyecto"
          />
      )}
      {isProfileModalOpen && (
          <UserProfileSetup
              onSave={handleProfileSave}
              onClose={() => {
                  setIsProfileModalOpen(false);
                  setProfileSetupIntent(null);
              }}
              existingProfile={userProfile}
          />
      )}
      {isSettingsModalOpen && (
        <SettingsModal
          currentSettings={aiSettings}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}
      <div className="bg-white max-w-7xl mx-auto p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl">
        <header className="relative text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 cursor-pointer" onClick={() => setView('welcome')}>
            S.H.I.P. Helper
          </h1>
          {view === 'new_project' && (
            <>
            <p className="text-lg text-slate-600 mt-2">Estructura, refina y planifica tus ideas con la ayuda de la IA.</p>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="absolute top-0 right-0 p-2 text-slate-500 hover:text-indigo-600 transition-colors"
              aria-label="Configuración de IA"
              title="Configuración de IA"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            </>
          )}
        </header>

        <main>
          {renderContent()}
        </main>
      </div>

      <div
        aria-live="polite"
        className={`fixed bottom-6 left-6 z-50 transition-all duration-500 transform ${
            autoSaveStatus !== 'idle' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        >
        <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-sm text-white text-sm rounded-lg px-4 py-2 shadow-lg border border-slate-600">
            {autoSaveStatus === 'saving' && (
            <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Guardando progreso...</span>
            </>
            )}
            {autoSaveStatus === 'saved' && (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Progreso guardado automáticamente.</span>
            </>
            )}
        </div>
        </div>

      <VoiceControl
        onCommand={handleVoiceCommand}
        view={view}
        currentStep={currentStep}
        isSummaryStep={isSummaryStep}
        isProjectSaveable={!isProjectSaved}
      />
    </div>
  );
};

export default App;
