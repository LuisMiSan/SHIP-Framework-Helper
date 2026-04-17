import { useState, useEffect, useCallback } from 'react';
import { ArchivedProject, ProjectTemplate, AISettings, View } from '../types';
import { initialStepsData } from '../data/initialData';
import { preloadedTemplates } from '../data/templates';
import { auth, db } from '../lib/firebase';
import { firestoreService } from '../lib/firestoreService';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export function useAppData() {
    const [archive, setArchive] = useState<ArchivedProject[]>([]);
    const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
    const [aiSettings, setAiSettings] = useState<AISettings>({ temperature: 0.7, model: 'gemini-3.1-flash-lite-preview', useThinkingMode: false, useGoogleSearch: false });
    const [isLoading, setIsLoading] = useState(true);

    // Initial load for settings and data subscription
    useEffect(() => {
        if (!auth.currentUser) return;

        const loadSettings = async () => {
            try {
                const settingsRef = doc(db, 'users', auth.currentUser!.uid);
                const settingsSnap = await getDoc(settingsRef);
                if (settingsSnap.exists() && settingsSnap.data().settings) {
                    setAiSettings(current => ({ ...current, ...settingsSnap.data().settings }));
                }
            } catch (error) {
                console.error("Failed to load settings from Firestore", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();

        // Subscribe to projects and templates
        const unsubProjects = firestoreService.subscribeToProjects(setArchive);
        const unsubTemplates = firestoreService.subscribeToTemplates(setTemplates);

        return () => {
            unsubProjects();
            unsubTemplates();
        };
    }, []);

    const handleSaveSettings = useCallback(async (newSettings: AISettings) => {
        setAiSettings(newSettings);
        if (auth.currentUser) {
            try {
                await setDoc(doc(db, 'users', auth.currentUser.uid), { settings: newSettings }, { merge: true });
            } catch (error) {
                console.error("Failed to save settings to Firestore", error);
            }
        }
    }, []);

    const exportDatabase = useCallback(() => {
        const data = {
            archive,
            templates,
            settings: aiSettings,
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `SHIP_Framework_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [archive, templates, aiSettings]);

    const importDatabase = useCallback(async (jsonString: string) => {
        try {
            const data = JSON.parse(jsonString);
            if (data.archive) {
                for (const project of data.archive) {
                    await firestoreService.saveProject(project);
                }
            }
            if (data.templates && auth.currentUser) {
                // Determine if user is admin or if they should save as personal templates?
                // For simplicity, we just save them.
                for (const template of data.templates) {
                    await firestoreService.saveTemplate(template);
                }
            }
            if (data.settings) await handleSaveSettings(data.settings);
            return true;
        } catch (e) {
            console.error("Import failed", e);
            return false;
        }
    }, [handleSaveSettings]);

    return {
        archive,
        templates,
        aiSettings,
        isLoading,
        updateAndSaveArchive: async (newArchive: ArchivedProject[]) => {
           // We use specialized firestore service methods instead
        },
        updateAndSaveTemplates: async (newTemplates: ProjectTemplate[]) => {
           // We use specialized firestore service methods instead
        },
        handleSaveSettings,
        exportDatabase,
        importDatabase
    };
}
