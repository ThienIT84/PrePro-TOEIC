// Mock services for now
const mockQuestionService = {
  createQuestion: async (data: any) => ({ id: '1', ...data }),
  updateQuestion: async (id: string, data: any) => ({ id, ...data })
};

const mockFileService = {
  uploadAudio: async (file: File) => 'mock-audio-url',
  uploadImage: async (file: File) => 'mock-image-url'
};

const mockPassageService = {
  createPassage: async (data: any) => ({ id: '1', ...data }),
  getPassagesByPart: async (part: number) => []
};

import { TOEICPart, Difficulty, CorrectChoice, PassageType, Question, Passage } from '@/types';

export interface QuestionCreateData {
  part: TOEICPart;
  difficulty: Difficulty;
  prompt_text: string;
  choices: { A: string; B: string; C: string; D: string };
  correct_choice: CorrectChoice;
  explain_vi: string;
  explain_en: string;
  tags: string[];
  blank_index: number | null;
  image_url: string;
  audio_url: string;
  passage_id?: string;
}

export interface PassageCreateData {
  part: TOEICPart;
  passage_type: PassageType;
  texts: {
    title: string;
    content: string;
    additional: string;
  };
  translation_vi?: {
    content: string;
  };
  translation_en?: {
    content: string;
  };
  audio_url: string;
  assets: {
    images: string[];
    charts: string[];
  };
  meta: {
    word_count: number;
    reading_time: number;
    topic: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  errors: string[];
}

export interface TOEICQuestionCreatorState {
  questionData: QuestionCreateData;
  passageData: PassageCreateData;
  passages: Passage[];
  selectedPassageId: string | null;
  loading: boolean;
  error: string | null;
  activeTab: 'question' | 'passage';
}

export class TOEICQuestionCreatorController {
  private questionService: any;
  private fileService: any;
  private passageService: any;
  private state: TOEICQuestionCreatorState;

  constructor() {
    this.questionService = mockQuestionService;
    this.fileService = mockFileService;
    this.passageService = mockPassageService;
    this.state = this.getInitialState();
  }

  // Initial State
  private getInitialState(): TOEICQuestionCreatorState {
    return {
      questionData: {
        part: 1,
        difficulty: 'medium',
        prompt_text: '',
        choices: { A: '', B: '', C: '', D: '' },
        correct_choice: 'A',
        explain_vi: '',
        explain_en: '',
        tags: [],
        blank_index: null,
        image_url: '',
        audio_url: ''
      },
      passageData: {
        part: 3,
        passage_type: 'single',
        texts: { title: '', content: '', additional: '' },
        translation_vi: { content: '' },
        translation_en: { content: '' },
        audio_url: '',
        assets: { images: [], charts: [] },
        meta: { word_count: 0, reading_time: 0, topic: '' }
      },
      passages: [],
      selectedPassageId: null,
      loading: false,
      error: null,
      activeTab: 'question'
    };
  }

  // State Management
  getState(): TOEICQuestionCreatorState {
    return { ...this.state };
  }

  updateState(updates: Partial<TOEICQuestionCreatorState>): void {
    this.state = { ...this.state, ...updates };
  }

  // Question Management
  async createQuestion(data: QuestionCreateData): Promise<Question> {
    try {
      this.updateState({ loading: true, error: null });

      // Validate question data
      const validation = this.validateQuestionData(data);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Create question
      const question = await this.questionService.createQuestion(data);
      
      this.updateState({ loading: false });
      return question;
    } catch (error: any) {
      this.updateState({ 
        loading: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  async updateQuestion(id: string, data: Partial<QuestionCreateData>): Promise<Question> {
    try {
      this.updateState({ loading: true, error: null });

      const question = await this.questionService.updateQuestion(id, data);
      
      this.updateState({ loading: false });
      return question;
    } catch (error: any) {
      this.updateState({ 
        loading: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  // Passage Management
  async createPassage(data: PassageCreateData): Promise<Passage> {
    try {
      this.updateState({ loading: true, error: null });

      // Validate passage data
      const validation = this.validatePassageData(data);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Create passage
      const passage = await this.passageService.createPassage(data);
      
      this.updateState({ loading: false });
      return passage;
    } catch (error: any) {
      this.updateState({ 
        loading: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  async loadPassages(part: TOEICPart): Promise<Passage[]> {
    try {
      this.updateState({ loading: true, error: null });

      const passages = await this.passageService.getPassagesByPart(part);
      
      this.updateState({ 
        loading: false, 
        passages 
      });
      return passages;
    } catch (error: any) {
      this.updateState({ 
        loading: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  // File Upload
  async uploadAudio(file: File): Promise<string> {
    try {
      this.updateState({ loading: true, error: null });

      // Validate file
      const validation = this.validateAudioFile(file);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Upload file
      const url = await this.fileService.uploadAudio(file);
      
      this.updateState({ loading: false });
      return url;
    } catch (error: any) {
      this.updateState({ 
        loading: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  async uploadImage(file: File): Promise<string> {
    try {
      this.updateState({ loading: true, error: null });

      // Validate file
      const validation = this.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.message);
      }

      // Upload file
      const url = await this.fileService.uploadImage(file);
      
      this.updateState({ loading: false });
      return url;
    } catch (error: any) {
      this.updateState({ 
        loading: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  // Validation Methods
  validateQuestionData(data: QuestionCreateData): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!data.prompt_text || data.prompt_text.trim().length === 0) {
      errors.push('Question prompt is required');
    }

    if (!data.part) {
      errors.push('TOEIC part is required');
    }

    if (!data.difficulty) {
      errors.push('Difficulty level is required');
    }

    // Validate choices
    const choices = Object.values(data.choices);
    if (choices.some(choice => !choice || choice.trim().length === 0)) {
      errors.push('All answer choices must be filled');
    }

    if (!data.correct_choice) {
      errors.push('Correct answer is required');
    }

    // Validate audio for listening parts
    if (this.isAudioRequired(data.part) && !data.audio_url) {
      errors.push('Audio file is required for listening parts');
    }

    // Validate passage for parts that need it
    if (this.needsPassage(data.part) && !data.passage_id) {
      errors.push('Passage is required for this part');
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(', '),
      errors
    };
  }

  validatePassageData(data: PassageCreateData): ValidationResult {
    const errors: string[] = [];

    // Required fields
    if (!data.texts.content || data.texts.content.trim().length === 0) {
      errors.push('Passage content is required');
    }

    if (!data.part) {
      errors.push('TOEIC part is required');
    }

    if (!data.passage_type) {
      errors.push('Passage type is required');
    }

    // Validate word count
    if (data.meta.word_count < 50) {
      errors.push('Passage must have at least 50 words');
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(', '),
      errors
    };
  }

  validateAudioFile(file: File): ValidationResult {
    const errors: string[] = [];

    if (!file) {
      errors.push('File is required');
    }

    if (file && file.size > 10 * 1024 * 1024) { // 10MB
      errors.push('File size must be less than 10MB');
    }

    if (file && !file.type.startsWith('audio/')) {
      errors.push('File must be an audio file');
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(', '),
      errors
    };
  }

  validateImageFile(file: File): ValidationResult {
    const errors: string[] = [];

    if (!file) {
      errors.push('File is required');
    }

    if (file && file.size > 5 * 1024 * 1024) { // 5MB
      errors.push('File size must be less than 5MB');
    }

    if (file && !file.type.startsWith('image/')) {
      errors.push('File must be an image file');
    }

    return {
      isValid: errors.length === 0,
      message: errors.join(', '),
      errors
    };
  }

  // Helper Methods
  isAudioRequired(part: TOEICPart): boolean {
    return [1, 2, 3, 4].includes(part);
  }

  needsPassage(part: TOEICPart): boolean {
    return [3, 4, 6, 7].includes(part);
  }

  getPartInfo(part: TOEICPart) {
    const partInfo = {
      1: { name: 'Part 1: Photos', description: 'Mô tả hình ảnh', icon: '📷', needsPassage: false },
      2: { name: 'Part 2: Question-Response', description: 'Hỏi đáp', icon: '💬', needsPassage: false },
      3: { name: 'Part 3: Conversations', description: 'Hội thoại', icon: '👥', needsPassage: true },
      4: { name: 'Part 4: Talks', description: 'Bài nói', icon: '🎤', needsPassage: true },
      5: { name: 'Part 5: Incomplete Sentences', description: 'Hoàn thành câu', icon: '✏️', needsPassage: false },
      6: { name: 'Part 6: Text Completion', description: 'Hoàn thành đoạn văn', icon: '📝', needsPassage: true },
      7: { name: 'Part 7: Reading Comprehension', description: 'Đọc hiểu', icon: '📖', needsPassage: true },
    };
    return partInfo[part];
  }

  // Utility Methods
  resetState(): void {
    this.state = this.getInitialState();
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  setActiveTab(tab: 'question' | 'passage'): void {
    this.updateState({ activeTab: tab });
  }

  setSelectedPassageId(passageId: string | null): void {
    this.updateState({ selectedPassageId: passageId });
  }
}
