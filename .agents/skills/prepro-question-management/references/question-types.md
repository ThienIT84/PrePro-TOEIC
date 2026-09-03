# Data Structures — Question System

## Core Types (from `@/types/index.ts`)

### Question
```typescript
interface Question {
  id: string;                    // UUID
  part: TOEICPart;               // 1-7
  passage_id: string | null;     // FK to passages (Part 3,4,6,7)
  blank_index: number | null;    // Part 6 only (1-4)
  prompt_text: string;           // Nội dung câu hỏi
  choices: {                     // 4 đáp án
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_choice: CorrectChoice; // 'A' | 'B' | 'C' | 'D'
  explain_vi: string;            // Giải thích tiếng Việt
  explain_en: string;            // Giải thích tiếng Anh
  tags: string[];                // Tags phân loại
  difficulty: Difficulty;        // 'easy' | 'medium' | 'hard'
  status: QuestionStatus;        // 'draft' | 'published' | 'archived'
  image_url: string | null;      // Part 1
  audio_url: string | null;      // Part 1-4
  transcript: string | null;     // Part 2-4
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
```

### Passage
```typescript
interface Passage {
  id: string;
  part: TOEICPart;               // 3, 4, 6, 7
  passage_type: PassageType;     // 'single' | 'double' | 'triple'
  texts: {
    title?: string;
    content: string;             // Đoạn 1
    content2?: string;           // Đoạn 2 (double/triple)
    content3?: string;           // Đoạn 3 (triple)
    img_url?: string;
    img_url2?: string;
    img_url3?: string;
  };
  translation_vi?: { content: string; content2?: string; content3?: string; };
  translation_en?: { content: string; content2?: string; content3?: string; };
  audio_url: string | null;
  assets: { images?: string[]; charts?: string[]; } | null;
  meta: { word_count?: number; reading_time?: number; topic?: string; } | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
```

### ExamSet
```typescript
interface ExamSet {
  id: string;
  title: string;
  description: string | null;
  type: DrillType;              // 'vocab' | 'grammar' | 'listening' | 'reading' | 'mix'
  difficulty: Difficulty;
  question_count: number;
  time_limit: number;           // minutes
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}
```

## Database Tables

| Table | Mô tả | Key Relationships |
|-------|--------|-------------------|
| `questions` | Ngân hàng câu hỏi | → passages (FK) |
| `passages` | Đoạn văn | ← questions (1:N) |
| `exam_sets` | Đề thi | ← exam_questions (1:N) |
| `exam_questions` | Liên kết câu hỏi-đề | → exam_sets, questions (FK) |
| `exam_sessions` | Phiên thi | → exam_sets (FK) |
| `exam_attempts` | Chi tiết câu trả lời | → exam_sessions (FK) |
| `exam_statistics` | Thống kê đề | → exam_sets (1:1) |

## Model Layer (`src/models/entities/`)

- `BaseModel` — abstract class với validation helpers
- `QuestionModel` extends `BaseModel` — validate theo part-specific rules
- `PassageModel` extends `BaseModel` — validate passage_type vs texts
- `ExamSetModel` extends `BaseModel` — validate time_limit, question_count
- `UserModel` extends `BaseModel` — validate profile data

## AI Question Generation

Các AI providers (trong `src/services/`):

| Service | Model | Mục đích |
|---------|-------|----------|
| `groqQuestionGenerator.ts` | Llama 3.1-8B | Primary generator (production) |
| `ollamaQuestionGenerator.ts` | Local models | Offline development |
| `huggingfaceQuestionGenerator.ts` | HF models | Alternative |
| `freeQuestionGenerator.ts` | Template-based | Fallback (no AI) |
| `toeicQuestionGenerator.ts` | Combined | Orchestrator cho tất cả generators |
