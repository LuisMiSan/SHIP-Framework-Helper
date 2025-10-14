export type DescriptionPart = string | { word: string; tip: string };

export interface StepData {
  id: 'solve' | 'hypothesize' | 'implement' | 'persevere';
  title: string;
  description: DescriptionPart[];
  placeholder: string;
  userInput: string;
  aiResponse: string;
  isLoading: boolean;
  aiResponseHistory: string[];
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

export type VoiceCommand =
  | 'NEXT_STEP'
  | 'PREV_STEP'
  | 'GET_AI_HELP'
  | 'START_NEW'
  | 'VIEW_ARCHIVE'
  | 'GO_BACK'
  | 'SAVE_PROJECT'
  | 'DOWNLOAD_PDF'
  | 'DICTATE';
