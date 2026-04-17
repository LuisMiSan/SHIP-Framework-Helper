import { useState, useEffect, useRef } from 'react';
import { StepData, UserProfile, InProgressProject } from '../types';

export function useAutoSave(projectState: { stepsData: StepData[], projectName: string, currentProjectProfile: UserProfile }) {
    const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
    const latestStateRef = useRef(projectState);

    useEffect(() => {
        latestStateRef.current = projectState;
    }, [projectState]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            const { stepsData, projectName, currentProjectProfile } = latestStateRef.current;
            const isPristine = stepsData.every(step => !step.userInput.trim() && !step.aiResponse.trim()) && !projectName.trim() && !currentProjectProfile.name.trim();

            if (isPristine) return;

            setAutoSaveStatus('saving');
            try {
                const inProgressData: InProgressProject = {
                    projectName,
                    userProfile: currentProjectProfile,
                    stepsData,
                };
                localStorage.setItem('ship-framework-data', JSON.stringify(inProgressData));
                setTimeout(() => setAutoSaveStatus('saved'), 500);
                setTimeout(() => setAutoSaveStatus('idle'), 3000);
            } catch (error) {
                console.error("Failed to auto-save", error);
                setAutoSaveStatus('idle');
            }
        }, 30000); // More frequent autosave for lead experience

        return () => clearInterval(intervalId);
    }, []);

    return autoSaveStatus;
}
