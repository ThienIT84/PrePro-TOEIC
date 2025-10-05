// Database types
export type DrillType = 'vocab' | 'grammar' | 'listening' | 'reading' | 'mix';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type AppRole = 'student' | 'teacher';

// TOEIC specific types
export type TOEICPart = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type PassageType = 'single' | 'double' | 'triple';
export type QuestionStatus = 'draft' | 'published' | 'archived';
export type CorrectChoice = 'A' | 'B' | 'C' | 'D';

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

// TOEIC Question interface (new structure)
export interface Question {
  id: string;
  part: TOEICPart;
  passage_id: string | null;
  blank_index: number | null; // For Part 6 (1-4)
  prompt_text: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_choice: CorrectChoice;
  explain_vi: string;
  explain_en: string;
  tags: string[];
  difficulty: Difficulty;
  status: QuestionStatus;
  image_url: string | null; // For Part 1
  audio_url: string | null; // For Parts 1, 2, 3, 4
  transcript: string | null; // For Parts 2, 3, 4
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// TOEIC Passage interface
export interface Passage {
  id: string;
  part: TOEICPart; // 3, 4, 6, 7
  passage_type: PassageType;
  texts: {
    title?: string;
    content: string;
    additional?: string; // For double/triple passages
  };
  audio_url: string | null;
  assets: {
    images?: string[];
    charts?: string[];
  } | null;
  meta: {
    word_count?: number;
    reading_time?: number;
    topic?: string;
  } | null;
  created_by: string | null;
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
  item?: Question;
}

export interface ExamSet {
  id: string;
  title: string;
  description: string | null;
  type: DrillType;
  difficulty: Difficulty;
  question_count: number;
  time_limit: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion {
  id: string;
  exam_set_id: string;
  question_id: string;
  order_index: number;
  created_at: string;
  question?: Question;
}

// UI types
export interface DrillSession {
  items: Question[];
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