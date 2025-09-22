// Database types
export type DrillType = 'vocab' | 'grammar' | 'listening' | 'reading' | 'mix';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AppRole = 'user' | 'admin';

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  role: AppRole;
  target_score: number;
  test_date: string | null;
  locales: string;
  focus: string[];
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  type: DrillType;
  difficulty: Difficulty;
  question: string;
  choices: string[];
  answer: string;
  explain_vi: string;
  explain_en: string;
  audio_url: string | null;
  transcript: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  item_id: string;
  correct: boolean;
  response: string | null;
  time_ms: number | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  item_id: string;
  due_at: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  created_at: string;
  updated_at: string;
  item?: Item;
}

// UI types
export interface DrillSession {
  items: Item[];
  currentIndex: number;
  startTime: Date;
  answers: { itemId: string; response: string; timeMs: number }[];
}

export interface Analytics {
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
  streakDays: number;
  byType: Record<DrillType, { attempts: number; correct: number; accuracy: number }>;
  byDifficulty: Record<Difficulty, { attempts: number; correct: number; accuracy: number }>;
}