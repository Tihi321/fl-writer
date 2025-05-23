export interface Project {
  id: string;
  title: string;
  description: string;
  genre: string;
  wordCount: number;
  targetWordCount: number;
  status: "planning" | "writing" | "editing" | "completed";
  createdAt: Date;
  updatedAt: Date;
  chapters: Chapter[];
  characters: Character[];
  settings: Setting[];
  plotPoints: PlotPoint[];
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  order: number;
  status: "draft" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  role: "protagonist" | "antagonist" | "supporting" | "minor";
  appearance: string;
  personality: string;
  background: string;
  goals: string;
  conflicts: string;
  relationships: string;
  notes: string;
}

export interface Setting {
  id: string;
  name: string;
  description: string;
  type: "location" | "time-period" | "world";
  details: string;
  atmosphere: string;
  significance: string;
}

export interface PlotPoint {
  id: string;
  title: string;
  description: string;
  type:
    | "setup"
    | "inciting-incident"
    | "plot-point-1"
    | "midpoint"
    | "plot-point-2"
    | "climax"
    | "resolution";
  order: number;
  completed: boolean;
}

export interface AiSuggestion {
  id: string;
  type: "continuation" | "improvement" | "alternative" | "description" | "dialogue";
  content: string;
  context: string;
  confidence: number;
  timestamp: Date;
}

export interface WritingSession {
  id: string;
  projectId: string;
  startTime: Date;
  endTime?: Date;
  wordsWritten: number;
  notes: string;
}

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  fontSize: number;
  fontFamily: string;
  autoSave: boolean;
  autoSaveInterval: number;
  aiProvider: "openai" | "anthropic" | "local";
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
  showWordCount: boolean;
  showReadingTime: boolean;
  targetDailyWords: number;
}

export interface ExportOptions {
  format: "pdf" | "docx" | "txt" | "html" | "epub";
  includeMetadata: boolean;
  includeCharacters: boolean;
  includeSettings: boolean;
  customFormatting: boolean;
}
