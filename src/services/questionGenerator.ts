import { DrillType, Difficulty } from '@/types';
import { groqQuestionGeneratorService } from './groqQuestionGenerator';

export interface QuestionGenerationRequest {
  content: string;
  type: DrillType;
  difficulty: Difficulty;
  questionCount: number;
  language: 'vi' | 'en';
}

export interface GeneratedQuestion {
  question: string;
  choices: string[];
  answer: string;
  explain_vi: string;
  explain_en: string;
  tags: string[];
}

export interface QuestionGenerationResponse {
  questions: GeneratedQuestion[];
  success: boolean;
  error?: string;
}

class QuestionGeneratorService {
  constructor() {
    // Chỉ sử dụng Groq
    console.log('🔍 DEBUG: Groq Question Generator Service initialized');
    console.log('  VITE_GROQ_API_KEY:', import.meta.env.VITE_GROQ_API_KEY ? 'SET' : 'NOT SET');
  }

  /**
   * Refresh API key from localStorage
   */
  refreshApiKey(): void {
    groqQuestionGeneratorService.refreshApiKey();
  }

  /**
   * Tạo câu hỏi từ nội dung sử dụng Groq (miễn phí)
   */
  async generateQuestions(request: QuestionGenerationRequest): Promise<QuestionGenerationResponse> {
    console.log('🤖 Using Groq AI Provider');
    console.log('🔍 DEBUG: generateQuestions called with request:', request);
    
    // Chỉ sử dụng Groq
    console.log('🔍 DEBUG: Calling Groq service');
    return await groqQuestionGeneratorService.generateQuestions(request);
  }

  /**
   * Generate Part 6 questions with passage
   */
  async generatePart6Questions(request: QuestionGenerationRequest): Promise<{
    success: boolean;
    passage?: {
      content: string;
      blanks: number[];
    };
    questions?: GeneratedQuestion[];
    error?: string;
  }> {
    console.log('🤖 Using Groq AI Provider for Part 6');
    return await groqQuestionGeneratorService.generatePart6Questions(request);
  }

  /**
   * Generate Part 7 questions with passage(s)
   */
  async generatePart7Questions(request: QuestionGenerationRequest & { passageCount?: number }): Promise<{
    success: boolean;
    passages?: Array<{
      content: string;
      type: string;
      title?: string;
    }>;
    questions?: GeneratedQuestion[];
    error?: string;
  }> {
    console.log('🤖 Using Groq AI Provider for Part 7');
    return await groqQuestionGeneratorService.generatePart7Questions(request);
  }

  /**
   * Tạo câu hỏi từ file sử dụng Groq
   */
  async generateFromFile(file: File, options: Omit<QuestionGenerationRequest, 'content'>): Promise<QuestionGenerationResponse> {
    console.log('🤖 Generating from file using Groq');
    
    try {
      const content = await this.readFileContent(file);
      return await this.generateQuestions({
        ...options,
        content
      });
    } catch (error) {
      console.error('Error reading file:', error);
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Failed to read file'
      };
    }
  }

  /**
   * Tạo câu hỏi từ URL sử dụng Groq
   */
  async generateFromUrl(url: string, options: Omit<QuestionGenerationRequest, 'content'>): Promise<QuestionGenerationResponse> {
    console.log('🤖 Generating from URL using Groq');
    
    try {
      const content = await this.fetchUrlContent(url);
      return await this.generateQuestions({
        ...options,
        content
      });
    } catch (error) {
      console.error('Error fetching URL:', error);
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch URL content'
      };
    }
  }

  /**
   * Đọc nội dung file
   */
  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content) {
          reject(new Error('Failed to read file content'));
          return;
        }
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Lấy nội dung từ URL
   */
  private async fetchUrlContent(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    return await response.text();
  }
}

// Export singleton instance
export const questionGeneratorService = new QuestionGeneratorService();