import { useState, useCallback, useRef, useEffect } from 'react';
import { StepData, UserProfile, InProgressProject, ProjectTemplate, ArchivedProject } from '../types';
import { initialStepsData } from '../data/initialData';

export function useProject(onStartNewProject: () => void) {
    const [stepsData, setStepsData] = useState<StepData[]>(initialStepsData);
    const [projectName, setProjectName] = useState<string>('');
    const [currentProjectProfile, setCurrentProjectProfile] = useState<UserProfile>({ name: '', company: '', email: '', phone: '' });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [isProjectSaved, setIsProjectSaved] = useState(false);

    const loadInProgressProject = useCallback(() => {
        try {
            const savedData = localStorage.getItem('ship-framework-data');
            if (savedData) {
                const parsedData: InProgressProject = JSON.parse(savedData);
                if (parsedData?.stepsData?.length === initialStepsData.length) {
                    setStepsData(parsedData.stepsData.map(step => ({
                        ...initialStepsData.find(s => s.id === step.id)!,
                        ...step,
                        aiResponseHistory: step.aiResponseHistory || [],
                        groundingChunks: step.groundingChunks || [],
                    })));
                    setProjectName(parsedData.projectName || '');
                    setCurrentProjectProfile(parsedData.userProfile || { name: '', company: '', email: '', phone: '' });
                    setIsProjectSaved(false);
                    return true;
                }
            }
        } catch (error) {
            console.error("Failed to load in-progress project", error);
        }
        return false;
    }, []);

    const handleInputChange = useCallback((index: number, value: string) => {
        setValidationErrors({});
        setStepsData(prev => {
            const newSteps = [...prev];
            newSteps[index].userInput = value;
            return newSteps;
        });
    }, []);

    const handleDictation = useCallback((index: number, text: string) => {
        setStepsData(prev => {
            const newSteps = [...prev];
            const currentInput = newSteps[index].userInput;
            const separator = currentInput.trim() && text ? ' ' : '';
            newSteps[index].userInput = currentInput + separator + text;
            return newSteps;
        });
    }, []);
    
    const handleRestoreAIResponse = useCallback((index: number, responseToRestore: string) => {
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
    }, []);

    const resetProject = useCallback(() => {
        localStorage.removeItem('ship-framework-data');
        setStepsData(initialStepsData);
        setProjectName('');
        setCurrentProjectProfile({ name: '', company: '', email: '', phone: '' });
        setValidationErrors({});
        setIsProjectSaved(false);
        onStartNewProject();
    }, [onStartNewProject]);

    const startFromTemplate = useCallback((template: ProjectTemplate) => {
        resetProject();
        setStepsData(template.data.map(step => ({
            ...initialStepsData.find(s => s.id === step.id)!,
            userInput: step.userInput || '',
            aiResponse: '',
            isLoading: false,
            aiResponseHistory: [],
            groundingChunks: [],
        })));
    }, [resetProject]);

    const loadArchivedProject = useCallback((archived: ArchivedProject) => {
        resetProject();
        setStepsData(archived.data.map(step => ({
             ...initialStepsData.find(s => s.id === step.id)!,
             ...step,
             aiResponseHistory: step.aiResponseHistory || [],
             groundingChunks: step.groundingChunks || [],
        })));
        setProjectName(archived.name);
        setCurrentProjectProfile(archived.userProfile);
        setIsProjectSaved(true);
    }, [resetProject]);

    return {
        stepsData, setStepsData,
        projectName, setProjectName,
        currentProjectProfile, setCurrentProjectProfile,
        validationErrors, setValidationErrors,
        isProjectSaved, setIsProjectSaved,
        loadInProgressProject,
        handleInputChange,
        handleDictation,
        handleRestoreAIResponse,
        resetProject,
        startFromTemplate,
        loadArchivedProject
    };
}
