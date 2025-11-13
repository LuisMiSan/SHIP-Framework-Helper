

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { StepData, ArchivedProject, VoiceCommand, UserProfile, ProjectStatus, AISettings, ProjectTemplate, InProgressProject, View } from './types';
import { initialStepsData } from './data/initialData';
import { preloadedTemplates } from './data/templates';
import StepCard from './components/IdeaInput';
import SummaryDisplay from './components/ArchitectureDisplay';
import ApiKeySetup from './components/ApiKeySetup';
import WelcomeScreen from './components/WelcomeScreen';
import DatabaseView from './components/DatabaseView';
import VoiceControl from './components/VoiceControl';
import ProjectInfoForm from './components/ProjectInfoForm';
import SettingsModal from './components/SettingsModal';
import SaveTemplateModal from './components/SaveTemplateModal';

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

const App: React.FC = () => {
  const [view, setView] = useState<View>('welcome');
  const [archive, setArchive] = useState<ArchivedProject[]>([]);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [selectedArchivedProject, setSelectedArchivedProject] = useState<ArchivedProject | null>(null);

  const [stepsData, setStepsData] = useState<StepData[]>(initialStepsData);
  const [projectName, setProjectName] = useState<string>('');
  const [currentProjectProfile, setCurrentProjectProfile] = useState<UserProfile>({ name: '', company: '', email: '', phone: '' });

  const [showSummary, setShowSummary] = useState(false);
  const [isProjectSaved, setIsProjectSaved] = useState(false);
  
  const [isSaveTemplateModalOpen, setIsSaveTemplateModalOpen] = useState(false);
  const [projectToTemplate, setProjectToTemplate] = useState<StepData[] | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [apiKeyStatus, setApiKeyStatus] = useState<'valid' | 'missing' | 'invalid'>('valid');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [aiSettings, setAiSettings] = useState<AISettings>({ temperature: 0.7, model: 'gemini-2.5-flash' });
  const latestStateRef = useRef({ stepsData, projectName, currentProjectProfile });
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastScrolledStepIndex = useRef<number>(0);

  useEffect(() => {
    latestStateRef.current = { stepsData, projectName, currentProjectProfile };
  }, [stepsData, projectName, currentProjectProfile]);
  
  useEffect(() => {
    if (view !== 'new_project') {
      return;
    }
  
    const intervalId = setInterval(() => {
      const { stepsData: latestStepsData, projectName: latestProjectName, currentProjectProfile: latestProfile } = latestStateRef.current;
      const isPristine = latestStepsData.every(step => step.userInput.trim() === '' && step.aiResponse.trim() === '') && latestProjectName.trim() === '' && latestProfile.name.trim() === '';

      if (isPristine) {
        return;
      }
        
      setAutoSaveStatus('saving');
      
      try {
        const inProgressData: InProgressProject = {
          projectName: latestProjectName,
          userProfile: latestProfile,
          stepsData: latestStepsData,
        };
        localStorage.setItem('ship-framework-data', JSON.stringify(inProgressData));
        
        setTimeout(() => setAutoSaveStatus('saved'), 500);
        setTimeout(() => setAutoSaveStatus('idle'), 3000);
  
      } catch (error) {
        console.error("Failed to auto-save progress to localStorage", error);
        setAutoSaveStatus('idle');
      }
    }, 90000);
  
    return () => clearInterval(intervalId);
  }, [view]);

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
                setAiSettings({ temperature: parsedSettings.temperature, model: 'gemini-2.5-flash' });
            }
          } catch(e) {
            console.error("Failed to parse AI settings.", e);
          }
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
        
        const savedTemplates = localStorage.getItem('ship-framework-templates');
        if (savedTemplates) {
            try {
                setTemplates(JSON.parse(savedTemplates));
            } catch(e) {
                console.error("Failed to parse templates, loading defaults.", e);
                localStorage.removeItem('ship-framework-templates');
                setTemplates(preloadedTemplates);
            }
        } else {
            setTemplates(preloadedTemplates);
        }

        const savedData = localStorage.getItem('ship-framework-data');
        if(savedData) {
            const parsedData: InProgressProject = JSON.parse(savedData);
            if (parsedData && parsedData.stepsData && Array.isArray(parsedData.stepsData) && parsedData.stepsData.length === initialStepsData.length) {
                setStepsData(parsedData.stepsData.map((step: Partial<StepData>) => ({
                    ...initialStepsData.find(s => s.id === step.id)!,
                    ...step,
                    aiResponseHistory: step.aiResponseHistory || [],
                })));
                setProjectName(parsedData.projectName || '');
                setCurrentProjectProfile(parsedData.userProfile || { name: '', company: '', email: '', phone: '' });
                setIsProjectSaved(false);
                setShowSummary(false);
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
  
  const updateAndSaveTemplates = (newTemplates: ProjectTemplate[]) => {
    setTemplates(newTemplates);
    try {
      if (newTemplates.length > 0) {
        localStorage.setItem('ship-framework-templates', JSON.stringify(newTemplates));
      } else {
        localStorage.removeItem('ship-framework-templates');
      }
    } catch (error) {
      console.error("Failed to save templates to localStorage", error);
    }
  };

  const handleInputChange = (index: number, value: string) => {
    setValidationErrors({});
    const newStepsData = [...stepsData];
    newStepsData[index].userInput = value;
    setStepsData(newStepsData);
  };

  const handleDictation = (index: number, text: string) => {
    const currentInput = stepsData[index].userInput;
    const separator = currentInput.trim() && text ? ' ' : '';
    const newValue = currentInput + separator + text;
    
    const newStepsData = [...stepsData];
    newStepsData[index].userInput = newValue;
    setStepsData(newStepsData);
  };

  const handleGetAIHelp = async (index: number) => {
    const currentStepData = stepsData[index];

    const validation = validateInput(currentStepData.id, currentStepData.userInput);
    if (!validation.isValid) {
        setValidationErrors({ ...validationErrors, [currentStepData.id]: validation.message });
        return;
    }
    setValidationErrors({ ...validationErrors, [currentStepData.id]: '' });
    
    if (!currentStepData.userInput.trim()) return;

    setError(null);
    
    const previousResponse = currentStepData.aiResponse.trim();

    setStepsData(prevData => {
        const newData = [...prevData];
        const stepToUpdate = newData[index];
        
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
            newData[index].aiResponse += chunk.text;
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
            newData[index].isLoading = false;
            return newData;
        });
    }
  };

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
      setError(null);
      window.scrollTo(0, 0);
    } else {
      setError("Por favor, completa todos los campos obligatorios antes de ver el resumen.");
    }
  };

  const startNewProjectFlow = () => {
    try {
      localStorage.removeItem('ship-framework-data');
    } catch (error) {
      console.error("Failed to clear localStorage", error);
    }
    setStepsData(initialStepsData);
    setProjectName('');
    setCurrentProjectProfile({ name: '', company: '', email: '', phone: '' });
    setError(null);
    setValidationErrors({});
    setIsProjectSaved(false);
    setShowSummary(false);
    setView('new_project');
  };

  const handleSaveProject = () => {
      const newArchivedProject: ArchivedProject = {
          id: new Date().toISOString(),
          name: projectName,
          savedAt: new Date().toISOString(),
          data: stepsData,
          userProfile: currentProjectProfile,
          status: 'pending'
      };
      updateAndSaveArchive([newArchivedProject, ...archive]);
      
      try {
        localStorage.removeItem('ship-framework-data');
      } catch (error) {
        console.error("Failed to clear in-progress session from localStorage", error);
      }
      
      setIsProjectSaved(true);
      
      setTimeout(() => {
        setView('welcome');
        setProjectName('');
        setCurrentProjectProfile({ name: '', company: '', email: '', phone: '' });
        setStepsData(initialStepsData);
        setShowSummary(false);
      }, 500);
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

  const handleRestoreAIResponse = (index: number, responseToRestore: string) => {
    setStepsData(prevData => {
      const newData = [...prevData];
      const stepToUpdate = newData[index];
      const oldResponse = stepToUpdate.aiResponse;

      stepToUpdate.aiResponse = responseToRestore;

      if (oldResponse && oldResponse !== responseToRestore) {
          stepToUpdate.aiResponseHistory = [
              oldResponse,
              ...stepToUpdate.aiResponseHistory.filter(h => h !== responseToRestore)
          ];
      } else {
          stepToUpdate.aiResponseHistory = stepToUpdate.aiResponseHistory.filter(h => h !== responseToRestore);
      }
      
      return newData;
    });
  };

  const handleSaveAsTemplate = (data: StepData[]) => {
    setProjectToTemplate(data);
    setIsSaveTemplateModalOpen(true);
  };
  
  const handleConfirmSaveTemplate = (templateName: string) => {
    if (!projectToTemplate) return;
    const newTemplate: ProjectTemplate = {
      id: new Date().toISOString(),
      name: templateName,
      createdAt: new Date().toISOString(),
      data: projectToTemplate,
    };
    updateAndSaveTemplates([newTemplate, ...templates]);
    setIsSaveTemplateModalOpen(false);
    setProjectToTemplate(null);
  };

  const handleStartFromTemplate = (template: ProjectTemplate) => {
    setStepsData(template.data.map((step: Partial<StepData>) => ({
        ...initialStepsData.find(s => s.id === step.id)!,
        userInput: step.userInput || '',
        aiResponse: '',
        isLoading: false,
        aiResponseHistory: [],
    })));
    setProjectName('');
    setCurrentProjectProfile({ name: '', company: '', email: '', phone: '' });
    setError(null);
    setValidationErrors({});
    setIsProjectSaved(false);
    setShowSummary(false);
    setView('new_project');
  };

  const handleDeleteTemplate = (templateId: string) => {
    updateAndSaveTemplates(templates.filter(t => t.id !== templateId));
  };
  
  const handleVoiceCommand = (command: VoiceCommand, value?: string) => {
    const scrollToStep = (index: number) => {
        const stepElement = stepRefs.current[index];
        if (stepElement) {
            stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            lastScrolledStepIndex.current = index;
        }
    };
    
    switch (command) {
        case 'NEXT_STEP': {
            if (view === 'new_project' && !showSummary) {
                const newIndex = Math.min(lastScrolledStepIndex.current + 1, stepsData.length - 1);
                scrollToStep(newIndex);
            }
            break;
        }
        case 'PREV_STEP': {
            if (view === 'new_project' && !showSummary) {
                const newIndex = Math.max(lastScrolledStepIndex.current - 1, 0);
                scrollToStep(newIndex);
            }
            break;
        }
        case 'GET_AI_HELP': {
             if (view === 'new_project' && !showSummary) {
                const stepNumber = value ? parseInt(value, 10) : -1;
                let targetIndex;
                if (stepNumber > 0 && stepNumber <= stepsData.length) {
                    targetIndex = stepNumber - 1;
                } else {
                    targetIndex = lastScrolledStepIndex.current;
                }
                scrollToStep(targetIndex);
                setTimeout(() => handleGetAIHelp(targetIndex), 500);
            }
            break;
        }
        case 'DICTATE': {
            if (value && view === 'new_project' && !showSummary) {
                handleDictation(lastScrolledStepIndex.current, value);
            }
            break;
        }
        case 'START_NEW':
            if (view === 'welcome') startNewProjectFlow();
            break;
        case 'VIEW_DATABASE':
            setView('database');
            break;
        case 'GO_BACK':
            if (showSummary) {
                setShowSummary(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (view === 'view_archived' || view === 'database') {
                setView('welcome');
            }
            break;
        case 'SAVE_PROJECT':
            if (showSummary) handleSaveProject();
            break;
        case 'DOWNLOAD_PDF':
            if(showSummary || view === 'view_archived') {
                 document.getElementById('download-pdf-button')?.click();
            }
            break;
        default:
            break;
    }
  };

  if (apiKeyStatus !== 'valid') {
    return <ApiKeySetup reason={apiKeyStatus} />;
  }

  const allStepsComplete = stepsData.every(step => step.userInput.trim().length > 0);
  const isSaveable = projectName.trim().length > 0 && currentProjectProfile.name.trim().length > 0 && allStepsComplete;
  
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
        {isSettingsModalOpen && (
            <SettingsModal
                currentSettings={aiSettings}
                onSave={handleSaveSettings}
                onClose={() => setIsSettingsModalOpen(false)}
            />
        )}
        {isSaveTemplateModalOpen && projectToTemplate && (
            <SaveTemplateModal
                onSave={handleConfirmSaveTemplate}
                onClose={() => setIsSaveTemplateModalOpen(false)}
            />
        )}
        
        <header className="flex justify-between items-center mb-8 sticky top-0 bg-slate-200/80 backdrop-blur-sm py-4 z-40 -mx-4 px-4">
             <h1 onClick={() => view !== 'welcome' && setView('welcome')} className={`text-4xl font-extrabold text-slate-800 tracking-tight ${view !== 'welcome' ? 'cursor-pointer' : ''}`}>
                S.H.I.P. <span className="font-light text-slate-500">Framework Helper</span>
             </h1>
            <div className="flex items-center gap-2">
                {autoSaveStatus !== 'idle' && view === 'new_project' && (
                    <div className="text-sm text-slate-500 flex items-center gap-2 transition-opacity duration-300">
                        {autoSaveStatus === 'saving' && <> <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Guardando...</>}
                        {autoSaveStatus === 'saved' && <>✔️ Guardado</>}
                    </div>
                )}
                 <button onClick={() => setView('database')} className="p-2 rounded-full hover:bg-slate-300 transition-colors" aria-label="Abrir base de datos de proyectos">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                 </button>
                 <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 rounded-full hover:bg-slate-300 transition-colors" aria-label="Abrir configuración">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                 </button>
            </div>
        </header>

      {view === 'welcome' && (
        <WelcomeScreen
          onStartNew={startNewProjectFlow}
          templates={templates}
          onStartFromTemplate={handleStartFromTemplate}
          onDeleteTemplate={handleDeleteTemplate}
          onNavigateToDatabase={() => setView('database')}
        />
      )}
      {view === 'database' && (
        <DatabaseView
          archive={archive}
          onViewProject={handleViewProject}
          onDeleteProject={handleDeleteProject}
          onUpdateProjectStatus={handleUpdateProjectStatus}
          onBack={() => setView('welcome')}
        />
      )}
       {view === 'view_archived' && selectedArchivedProject && (
        <SummaryDisplay
            project={selectedArchivedProject}
            onRestart={startNewProjectFlow}
            onSaveProject={() => {}}
            isArchived={true}
            isSaved={true}
            onBackToArchive={() => setView('database')}
            onUpdateProjectStatus={handleUpdateProjectStatus}
            onSaveAsTemplate={handleSaveAsTemplate}
        />
      )}
      {view === 'new_project' && (
        <>
            {showSummary ? (
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
                    onSaveProject={handleSaveProject}
                    isArchived={false}
                    isSaved={isProjectSaved}
                    onUpdateProjectStatus={() => {}}
                    onSaveAsTemplate={handleSaveAsTemplate}
                />
            ) : (
                <div className="max-w-5xl mx-auto">
                    <ProjectInfoForm
                        projectName={projectName}
                        userProfile={currentProjectProfile}
                        onProjectNameChange={setProjectName}
                        onProfileChange={setCurrentProjectProfile}
                        errors={validationErrors}
                    />

                    <div className="my-8 h-px bg-slate-300" />

                    {stepsData.map((step, index) => (
                        <div key={step.id} ref={el => stepRefs.current[index] = el} className="mb-8 scroll-mt-24">
                            <StepCard
                                stepData={step}
                                onInputChange={(value) => handleInputChange(index, value)}
                                onGetAIHelp={() => handleGetAIHelp(index)}
                                validationError={validationErrors[step.id] || null}
                                onRestoreAIResponse={(response) => handleRestoreAIResponse(index, response)}
                                onDictate={(text) => handleDictation(index, text)}
                            />
                        </div>
                    ))}

                    <div className="mt-12 text-center">
                         {error && (
                            <div role="alert" className="mb-4 p-4 bg-red-50 border border-red-400 text-red-700 rounded-md">
                                {error}
                            </div>
                        )}
                        <button
                            onClick={handleShowSummary}
                            className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-lg text-xl hover:from-teal-600 hover:to-cyan-600 transition-all transform hover:scale-105 shadow-lg shadow-teal-500/30"
                        >
                            Ver Resumen del Proyecto
                        </button>
                    </div>
                </div>
            )}
        </>
      )}

      <VoiceControl
        onCommand={handleVoiceCommand}
        view={view}
        showSummary={showSummary}
        isProjectSaveable={!isProjectSaved && isSaveable}
      />
    </main>
  );
};

export default App;