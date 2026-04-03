// Mock services to avoid circular dependencies
const mockQuestionService = {
  createQuestion: async (data: any) => ({ data: { id: 'mock-id' }, error: null })
};

const mockPassageService = {
  createPassage: async (data: any) => ({ data: { id: 'mock-id' }, error: null })
};

const mockFileService = {
  uploadFile: async (file: File) => ({ data: { url: 'mock-url' }, error: null })
};
import { TOEICPart, Difficulty } from '@/types';
import * as XLSX from 'xlsx';

export interface TOEICQuestion {
  id?: string;
  part: number;
  prompt_text: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correct_choice: string;
  explain_vi: string;
  explain_en: string;
  tags: string[];
  difficulty: Difficulty;
  status: 'draft' | 'published' | 'archived';
  passage_id?: string;
  passage_title?: string;
  passage_content?: string;
  blank_index?: number;
  audio_url?: string;
  transcript?: string;
  image_url?: string;
  validation_status: 'pending' | 'valid' | 'invalid' | 'imported';
  errors?: string[];
}

export interface TOEICPassage {
  part: number;
  passage_type: 'single' | 'double' | 'triple';
  title: string;
  content: string;
  additional?: string;
  audio_url?: string;
  topic?: string;
  word_count?: number;
}

export interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    question: TOEICQuestion;
    error: string;
  }>;
}

export interface ImportProgress {
  status: 'idle' | 'processing' | 'importing' | 'completed' | 'error';
  current: number;
  total: number;
  percentage: number;
  error: string | null;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  errors: string[];
}

export interface TOEICBulkUploadState {
  questions: TOEICQuestion[];
  passages: TOEICPassage[];
  progress: ImportProgress;
  loading: boolean;
  error: string | null;
}

export class TOEICBulkUploadController {
  private questionService: any;
  private passageService: any;
  private fileService: any;
  private state: TOEICBulkUploadState;

  constructor() {
    this.questionService = mockQuestionService;
    this.passageService = mockPassageService;
    this.fileService = mockFileService;
    this.state = this.getInitialState();
  }

  // Initial State
  private getInitialState(): TOEICBulkUploadState {
    return {
      questions: [],
      passages: [],
      progress: {
        status: 'idle',
        current: 0,
        total: 0,
        percentage: 0,
        error: null
      },
      loading: false,
      error: null
    };
  }

  // State Management
  getState(): TOEICBulkUploadState {
    return { ...this.state };
  }

  updateState(updates: Partial<TOEICBulkUploadState>): void {
    this.state = { ...this.state, ...updates };
  }

  // Excel Processing
  async processExcelFile(file: File): Promise<{ questions: TOEICQuestion[]; passages: TOEICPassage[] }> {
    try {
      this.updateState({ loading: true, error: null });

      // Validate file
      const validation = this.validateExcelFile(file);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Read Excel file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      
      const questions: TOEICQuestion[] = [];
      const passages: TOEICPassage[] = [];

      // Process each sheet
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (sheetName.toLowerCase().includes('question')) {
          const sheetQuestions = this.parseQuestionsFromSheet(jsonData as any[][]);
          questions.push(...sheetQuestions);
        } else if (sheetName.toLowerCase().includes('passage')) {
          const sheetPassages = this.parsePassagesFromSheet(jsonData as any[][]);
          passages.push(...sheetPassages);
        }
      }

      // Validate processed data
      const questionsValidation = this.validateQuestions(questions);
      const passagesValidation = this.validatePassages(passages);

      if (!questionsValidation.isValid) {
        throw new Error(`Questions validation failed: ${questionsValidation.message}`);
      }

      if (!passagesValidation.isValid) {
        throw new Error(`Passages validation failed: ${passagesValidation.message}`);
      }

      this.updateState({ 
        loading: false, 
        questions, 
        passages 
      });

      return { questions, passages };
    } catch (error) {
      this.updateState({ 
        loading: false, 
        error: (error as any)?.message || 'Unknown error' 
      });
      throw error;
    }
  }

  // Import Questions
  async importQuestions(questions: TOEICQuestion[]): Promise<ImportResult> {
    try {
      this.updateProgress({
        status: 'importing',
        current: 0,
        total: questions.length,
        percentage: 0,
        error: null
      });

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < questions.length; i++) {
        try {
          const question = questions[i];
          
          // Transform to database format
          const questionData = this.transformQuestionToDBFormat(question);
          
          // Create question
          await this.questionService.createQuestion(questionData);
          result.success++;

          // Update progress
          this.updateProgress({
            current: i + 1,
            percentage: Math.round(((i + 1) / questions.length) * 100)
          });
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            question: questions[i],
            error: (error as any)?.message || 'Unknown error'
          });
        }
      }

      this.updateProgress({ status: 'completed' });
      return result;
    } catch (error) {
      this.updateProgress({ 
        status: 'error', 
        error: (error as any)?.message || 'Unknown error' 
      });
      throw error;
    }
  }

  // Import Passages
  async importPassages(passages: TOEICPassage[]): Promise<ImportResult> {
    try {
      this.updateProgress({
        status: 'importing',
        current: 0,
        total: passages.length,
        percentage: 0,
        error: null
      });

      const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: []
      };

      for (let i = 0; i < passages.length; i++) {
        try {
          const passage = passages[i];
          
          // Transform to database format
          const passageData = this.transformPassageToDBFormat(passage);
          
          // Create passage
          await this.passageService.createPassage(passageData);
          result.success++;

          // Update progress
          this.updateProgress({
            current: i + 1,
            percentage: Math.round(((i + 1) / passages.length) * 100)
          });
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: i + 1,
            question: passages[i] as any,
            error: (error as any)?.message || 'Unknown error'
          });
        }
      }

      this.updateProgress({ status: 'completed' });
      return result;
    } catch (error) {
      this.updateProgress({ 
        status: 'error', 
        error: (error as any)?.message || 'Unknown error' 
      });
      throw error;
    }
  }

  // Progress Management
  getProgress(): ImportProgress {
    return { ...this.state.progress };
  }

  updateProgress(updates: Partial<ImportProgress>): void {
    this.state.progress = { ...this.state.progress, ...updates };
  }

  // Validation Methods
  validateExcelFile(file: File): ValidationResult {
    const errors: string[] = [];

    if (!file) {
      errors.push('File is required');
    }

    if (file && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      errors.push('File must be an Excel file (.xlsx or .xls)');
    }

    if (file && file.size > 50 * 1024 * 1024) { // 50MB
      errors.push('File size must be less than 50MB');
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(', '),
      errors
    };
  }

  validateQuestions(questions: TOEICQuestion[]): ValidationResult {
    const errors: string[] = [];

    if (questions.length === 0) {
      errors.push('No questions found in file');
    }

    questions.forEach((question, index) => {
      if (!question.prompt_text || question.prompt_text.trim().length === 0) {
        errors.push(`Question ${index + 1}: Prompt text is required`);
      }

      if (!question.part || question.part < 1 || question.part > 7) {
        errors.push(`Question ${index + 1}: Invalid part number`);
      }

      if (!question.choiceA || !question.choiceB || !question.choiceC || !question.choiceD) {
        errors.push(`Question ${index + 1}: All choices are required`);
      }

      if (!question.correct_choice || !['A', 'B', 'C', 'D'].includes(question.correct_choice)) {
        errors.push(`Question ${index + 1}: Valid correct choice is required`);
      }

      if (!question.difficulty || !['easy', 'medium', 'hard'].includes(question.difficulty)) {
        errors.push(`Question ${index + 1}: Valid difficulty is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      message: errors.join(', '),
      errors
    };
  }

  validatePassages(passages: TOEICPassage[]): ValidationResult {
    const errors: string[] = [];

    passages.forEach((passage, index) => {
      if (!passage.content || passage.content.trim().length === 0) {
        errors.push(`Passage ${index + 1}: Content is required`);
      }

      if (!passage.part || passage.part < 1 || passage.part > 7) {
        errors.push(`Passage ${index + 1}: Invalid part number`);
      }

      if (!passage.passage_type || !['single', 'double', 'triple'].includes(passage.passage_type)) {
        errors.push(`Passage ${index + 1}: Valid passage type is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      message: errors.join(', '),
      errors
    };
  }

  // Data Transformation
  private transformQuestionToDBFormat(question: TOEICQuestion) {
    return {
      part: question.part,
      difficulty: question.difficulty,
      prompt_text: question.prompt_text,
      choices: {
        A: question.choiceA,
        B: question.choiceB,
        C: question.choiceC,
        D: question.choiceD
      },
      correct_choice: question.correct_choice,
      explain_vi: question.explain_vi,
      explain_en: question.explain_en,
      tags: question.tags || [],
      blank_index: question.blank_index,
      image_url: question.image_url,
      audio_url: question.audio_url,
      passage_id: question.passage_id
    };
  }

  private transformPassageToDBFormat(passage: TOEICPassage) {
    return {
      part: passage.part,
      passage_type: passage.passage_type,
      texts: {
        title: passage.title,
        content: passage.content,
        additional: passage.additional || ''
      },
      audio_url: passage.audio_url,
      meta: {
        word_count: passage.word_count || 0,
        reading_time: 0,
        topic: passage.topic || ''
      }
    };
  }

  // Sheet Parsing
  private parseQuestionsFromSheet(data: any[][]): TOEICQuestion[] {
    if (data.length < 2) return [];

    const headers = data[0];
    const questions: TOEICQuestion[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.length === 0) continue;

      const question: TOEICQuestion = {
        part: parseInt(String(row[0])) || 1,
        prompt_text: String(row[1] || ''),
        choiceA: String(row[2] || ''),
        choiceB: String(row[3] || ''),
        choiceC: String(row[4] || ''),
        choiceD: String(row[5] || ''),
        correct_choice: String(row[6] || 'A'),
        explain_vi: String(row[7] || ''),
        explain_en: String(row[8] || ''),
        tags: row[9] ? String(row[9]).split(',').map(tag => tag.trim()) : [],
        difficulty: (row[10] as Difficulty) || 'medium',
        status: 'draft',
        validation_status: 'pending',
        passage_id: row[11] ? String(row[11]) : undefined,
        passage_title: row[12] ? String(row[12]) : undefined,
        passage_content: row[13] ? String(row[13]) : undefined,
        blank_index: row[14] ? parseInt(String(row[14])) : undefined,
        audio_url: row[15] ? String(row[15]) : undefined,
        transcript: row[16] ? String(row[16]) : undefined,
        image_url: row[17] ? String(row[17]) : undefined
      };

      questions.push(question);
    }

    return questions;
  }

  private parsePassagesFromSheet(data: any[][]): TOEICPassage[] {
    if (data.length < 2) return [];

    const headers = data[0];
    const passages: TOEICPassage[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row.length === 0) continue;

      const passage: TOEICPassage = {
        part: parseInt(String(row[0])) || 3,
        passage_type: (row[1] as 'single' | 'double' | 'triple') || 'single',
        title: String(row[2] || ''),
        content: String(row[3] || ''),
        additional: row[4] ? String(row[4]) : undefined,
        audio_url: row[5] ? String(row[5]) : undefined,
        topic: row[6] ? String(row[6]) : undefined,
        word_count: row[7] ? parseInt(String(row[7])) : undefined
      };

      passages.push(passage);
    }

    return passages;
  }

  // Template Generation
  generateTemplate(): void {
    const templateData = [
      // Questions template
      [
        'part', 'prompt_text', 'choiceA', 'choiceB', 'choiceC', 'choiceD', 
        'correct_choice', 'explain_vi', 'explain_en', 'tags', 'difficulty',
        'passage_id', 'passage_title', 'passage_content', 'blank_index',
        'audio_url', 'transcript', 'image_url'
      ],
      [
        1, 'Describe the photo', 'A', 'B', 'C', 'D', 'A', 
        'Vietnamese explanation', 'English explanation', 'listening,part1', 'medium',
        '', '', '', '', '', '', ''
      ],
      // Passages template
      [
        'part', 'passage_type', 'title', 'content', 'additional', 'audio_url', 'topic', 'word_count'
      ],
      [
        3, 'single', 'Sample Passage', 'Passage content here...', '', '', 'business', 150
      ]
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'TOEIC_Questions_Template.xlsx');
  }

  // Utility Methods
  resetState(): void {
    this.state = this.getInitialState();
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  getPartInfo(part: TOEICPart) {
    const partInfo = {
      1: { name: 'Photos', description: 'Mô tả hình ảnh', type: 'listening', count: 6 },
      2: { name: 'Question-Response', description: 'Hỏi đáp ngắn', type: 'listening', count: 25 },
      3: { name: 'Conversations', description: 'Hội thoại ngắn', type: 'listening', count: 39 },
      4: { name: 'Talks', description: 'Bài nói dài', type: 'listening', count: 30 },
      5: { name: 'Incomplete Sentences', description: 'Hoàn thành câu', type: 'reading', count: 30 },
      6: { name: 'Text Completion', description: 'Hoàn thành đoạn văn', type: 'reading', count: 16 },
      7: { name: 'Reading Comprehension', description: 'Đọc hiểu', type: 'reading', count: 54 }
    };
    return partInfo[part];
  }
}





