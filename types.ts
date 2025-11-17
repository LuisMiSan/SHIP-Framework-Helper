export type DescriptionPart = string | { word: string; tip: string };

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface StepData {
  id: 'solve' | 'hypothesize' | 'implement' | 'persevere';
  title: string;
  description: DescriptionPart[];
  helpText: string;
  placeholder: string;
  userInput: string;
  aiResponse: string;
  isLoading: boolean;
  aiResponseHistory: string[];
  groundingChunks?: GroundingChunk[];
}

export interface UserProfile {
  name: string;
  company: string;
  email: string;
  phone: string;
}

export type ProjectStatus = 'pending' | 'success' | 'failed';

export interface ArchivedProject {
  id: string;
  name: string;
  savedAt: string;
  data: StepData[];
  userProfile: UserProfile;
  status: ProjectStatus;
}

export interface InProgressProject {
  projectName: string;
  userProfile: UserProfile;
  stepsData: StepData[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  createdAt: string;
  data: StepData[];
}

export type AvailableModel = 'gemini-2.5-flash-lite' | 'gemini-2.5-flash' | 'gemini-2.5-pro';

export interface AISettings {
  temperature: number;
  model: AvailableModel;
  useThinkingMode: boolean;
  useGoogleSearch: boolean;
}

export type View = 'welcome' | 'new_project' | 'database' | 'view_archived';

export type VoiceCommand =
  | 'NEXT_STEP'
  | 'PREV_STEP'
  | 'GET_AI_HELP'
  | 'START_NEW'
  | 'VIEW_DATABASE'
  | 'GO_BACK'
  | 'SAVE_PROJECT'
  | 'DOWNLOAD_PDF'
  | 'DICTATE';