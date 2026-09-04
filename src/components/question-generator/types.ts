import { DrillType, Difficulty, Question } from '@/types';
import { GeneratedQuestion } from '@/services/questionGenerator';

export interface QuestionGeneratorProps {
  onQuestionsGenerated?: (questions: Question[]) => void;
}

export interface QuestionGeneratorFormData {
  content: string;
  type: DrillType | 'mix';
  difficulty: Difficulty | 'mix';
  questionCount: number;
  language: 'vi' | 'en';
  part: number;
}

export interface Part6ResultData {
  passage: { content: string; blanks: number[] };
  questions: GeneratedQuestion[];
}

export interface Part7ResultData {
  passages: Array<{
    content: string;
    type: string;
    title?: string;
  }>;
  questions: GeneratedQuestion[];
}

export type AIProvider = 'groq' | 'ollama';
export type OllamaStatus = 'checking' | 'connected' | 'disconnected';
export type GeneratorTab = 'text' | 'file' | 'url';
