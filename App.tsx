import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { StepData, ArchivedProject, VoiceCommand } from './types';
import ProgressBar from './components/ProgressBar';
import StepCard from './components/IdeaInput';
import SummaryDisplay from './components/ArchitectureDisplay';
import ApiKeySetup from './components/ApiKeySetup';
import WelcomeScreen from './components/WelcomeScreen';
import ArchiveView from './components/ArchiveView';
import VoiceControl from './components/VoiceControl';

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

type View = 'welcome' | 'new_project' | 'archive' | 'view_archived';

const App: React.FC = () => {
  const [view, setView] = useState<View>('welcome');
  const [archive, setArchive] = useState<ArchivedProject[]>([]);
  const [selectedArchivedProject, setSelectedArchivedProject] = useState<ArchivedProject | null>(null);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepsData, setStepsData] = useState<StepData[]>(initialStepsData);
  const [isProjectSaved, setIsProjectSaved] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<'valid' | 'missing' | 'invalid'>('valid');


  // API Key Check & Initial view determination
  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyStatus('missing');
    }

    try {
        const savedArchive = localStorage.getItem('ship-framework-archive');
        if (savedArchive) {
          setArchive(JSON.parse(savedArchive));
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

  // Save progress to localStorage
  useEffect(() => {
    if (view === 'new_project') {
      try {
        localStorage.setItem('ship-framework-data', JSON.stringify(stepsData));
        localStorage.setItem('ship-framework-step', JSON.stringify(currentStep));
      } catch (error) {
        console.error("Failed to save progress to localStorage", error);
      }
    }
  }, [stepsData, currentStep, view]);

  // Save archive to localStorage
  useEffect(() => {
    try {
        localStorage.setItem('ship-framework-archive', JSON.stringify(archive));
    } catch (error) {
        console.error("Failed to save archive to localStorage", error);
    }
  }, [archive]);

  const handleInputChange = (value: string) => {
    const newStepsData = [...stepsData];
    newStepsData[currentStep].userInput = value;
    setStepsData(newStepsData);
  };

  const handleGetAIHelp = async () => {
    const currentStepData = stepsData[currentStep];
    if (!currentStepData.userInput.trim()) return;

    setError(null);
    
    const previousResponse = currentStepData.aiResponse.trim();

    setStepsData(prevData => {
        const newData = [...prevData];
        const stepToUpdate = newData[currentStep];
        
        stepToUpdate.isLoading = true;
        stepToUpdate.aiResponse = '';
        
        if (previousResponse) {
          stepToUpdate.aiResponseHistory = [previousResponse, ...stepToUpdate.aiResponseHistory];
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
        model: 'gemini-2.5-flash',
        contents: prompt,
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
      if (err instanceof Error) {
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
        setError("No pude contactar a la IA. Por favor, inténtalo de nuevo más tarde.");
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
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    try {
      localStorage.removeItem('ship-framework-data');
      localStorage.removeItem('ship-framework-step');
    } catch (error) {
      console.error("Failed to clear localStorage", error);
    }
    setStepsData(initialStepsData);
    setCurrentStep(0);
    setError(null);
    setIsProjectSaved(false);
    setView('welcome');
  };

  const handleSaveProject = (projectName: string) => {
    if (!projectName) return;
    const newArchivedProject: ArchivedProject = {
        id: new Date().toISOString(),
        name: projectName,
        savedAt: new Date().toISOString(),
        data: stepsData
    };
    setArchive([newArchivedProject, ...archive]);
    setIsProjectSaved(true);
  };

  const handleDeleteProject = (projectId: string) => {
    setArchive(archive.filter(p => p.id !== projectId));
  };
  
  const handleViewProject = (project: ArchivedProject) => {
    setSelectedArchivedProject(project);
    setView('view_archived');
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
                setStepsData(initialStepsData);
                setCurrentStep(0);
                setView('new_project');
            }
            break;
        case 'VIEW_ARCHIVE':
            if (view === 'welcome' && archive.length > 0) setView('archive');
            break;
        case 'GO_BACK':
            if (view === 'archive' || view === 'view_archived') setView('welcome');
            if (view === 'view_archived') setView('archive');
            break;
        case 'SAVE_PROJECT':
            if (view === 'new_project' && currentStep === stepsData.length && !isProjectSaved) {
                const projectName = window.prompt("Por favor, introduce un nombre para este proyecto:", "Proyecto Guardado por Voz");
                if (projectName) handleSaveProject(projectName);
            }
            break;
        case 'DOWNLOAD_PDF':
             if (view === 'new_project' && currentStep === stepsData.length) {
                // We trigger a click on the button, as the PDF logic is complex and encapsulated
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
                    onStartNew={() => {
                      handleRestart(); // Clear old data
                      setStepsData(initialStepsData); // Ensure clean state
                      setCurrentStep(0);
                      setView('new_project');
                    }}
                    onViewArchive={() => setView('archive')}
                    hasArchive={archive.length > 0}
                />
            );
        case 'archive':
            return (
                <ArchiveView 
                    archive={archive}
                    onViewProject={handleViewProject}
                    onDeleteProject={handleDeleteProject}
                    onBack={() => setView('welcome')}
                />
            );
        case 'view_archived':
            return (
                <SummaryDisplay
                    stepsData={selectedArchivedProject!.data}
                    onRestart={handleRestart}
                    onSaveProject={() => {}} // Not applicable
                    isArchived={true}
                    isSaved={true}
                    onBackToArchive={() => setView('archive')}
                />
            );
        case 'new_project':
            return (
                <>
                    <ProgressBar steps={stepsData.map(s => s.title.split(': ')[1])} currentStep={currentStep} />
                    
                    {error && <div className="my-4 text-center bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg">{error}</div>}

                    {isSummaryStep ? (
                        <SummaryDisplay 
                            stepsData={stepsData} 
                            onRestart={handleRestart} 
                            onSaveProject={handleSaveProject} 
                            isArchived={false}
                            isSaved={isProjectSaved}
                        />
                    ) : (
                        <>
                        <StepCard 
                            key={currentStep}
                            stepData={stepsData[currentStep]}
                            onInputChange={handleInputChange}
                            onGetAIHelp={handleGetAIHelp}
                        />
                        <div className="mt-6 flex justify-between">
                            <button
                            onClick={goToPrevStep}
                            disabled={currentStep === 0}
                            className="px-6 py-2 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed"
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
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 cursor-pointer" onClick={() => setView('welcome')}>
            SHIP Framework Helper
          </h1>
          {view === 'new_project' && <p className="text-lg text-gray-400 mt-2">Usa la IA para refinar y estructurar tus ideas de producto.</p>}
        </header>

        <main>
          {renderContent()}
        </main>
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