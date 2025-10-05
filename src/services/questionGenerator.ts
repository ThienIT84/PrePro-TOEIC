import { Item, DrillType, Difficulty } from '@/types';
import { ollamaQuestionGeneratorService } from './ollamaQuestionGenerator';
import { huggingfaceQuestionGeneratorService } from './huggingfaceQuestionGenerator';
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
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';
  private aiProvider: 'openai' | 'ollama' | 'huggingface' | 'groq' = 'openai';

  constructor() {
    // Force sử dụng Groq thay vì OpenAI
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    this.aiProvider = 'groq'; // Force Groq
    
    // Debug environment variables
    console.log('🔍 DEBUG: Environment variables:');
    console.log('  VITE_AI_PROVIDER:', import.meta.env.VITE_AI_PROVIDER);
    console.log('  VITE_GROQ_API_KEY:', import.meta.env.VITE_GROQ_API_KEY ? 'SET' : 'NOT SET');
    console.log('  VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? 'SET' : 'NOT SET');
    console.log('  Selected provider:', this.aiProvider);
  }

  /**
   * Tạo câu hỏi từ nội dung sử dụng Groq (miễn phí)
   */
  async generateQuestions(request: QuestionGenerationRequest): Promise<QuestionGenerationResponse> {
    console.log(`🤖 Using AI Provider: ${this.aiProvider}`);
    console.log('🔍 DEBUG: generateQuestions called with request:', request);
    
    // Route to appropriate AI service - Only Groq
    switch (this.aiProvider) {
      case 'ollama':
        console.log('🔍 DEBUG: Calling Ollama service');
        return await ollamaQuestionGeneratorService.generateQuestions(request);
      case 'huggingface':
        console.log('🔍 DEBUG: Calling HuggingFace service');
        return await huggingfaceQuestionGeneratorService.generateQuestions(request);
      case 'groq':
      default:
        console.log('🔍 DEBUG: Calling Groq service (default)');
        return await groqQuestionGeneratorService.generateQuestions(request);
    }
  }

  // OpenAI method removed - only using Groq now

  /**
   * Xây dựng prompt cho Groq
   */
  private buildPrompt(request: QuestionGenerationRequest): string {
    const { content, type, difficulty, questionCount, language } = request;
    
    const typeInstructions = {
      vocab: 'vocabulary and word meaning questions',
      grammar: 'grammar and sentence structure questions',
      listening: 'listening comprehension questions (provide audio transcript)',
      reading: 'reading comprehension questions',
      mix: 'mixed type questions (vocabulary, grammar, reading)'
    };

    const difficultyInstructions = {
      easy: 'basic level suitable for beginners (400-500 TOEIC score)',
      medium: 'intermediate level suitable for intermediate learners (500-700 TOEIC score)',
      hard: 'advanced level suitable for advanced learners (700+ TOEIC score)'
    };

    return `
You are an expert TOEIC test creator. You MUST create EXACTLY ${questionCount} questions.

IMPORTANT: You must return EXACTLY ${questionCount} questions, no more, no less.

Content to base questions on:
"${content}"

Create ${questionCount} TOEIC ${typeInstructions[type]} at ${difficultyInstructions[difficulty]} level.

STRICT REQUIREMENTS:
1. You MUST create EXACTLY ${questionCount} questions
2. Each question must have exactly 4 multiple choice options (A, B, C, D)
3. Only one correct answer per question
4. Provide explanations in both Vietnamese and English
5. Include relevant tags for categorization
6. Questions should test understanding of the content, not just memorization
7. Make questions realistic and similar to actual TOEIC format
8. Each question must be unique and different from others
9. Cover different aspects of the content for variety

EXAMPLE OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "question": "What is the main topic of the restaurant?",
      "choices": ["Fine dining", "Fast food", "Coffee shop", "Food truck"],
      "answer": "A",
      "explain_vi": "Nhà hàng chuyên về fine dining với menu cao cấp.",
      "explain_en": "The restaurant specializes in fine dining with upscale menu.",
      "tags": ["restaurant", "dining", "vocabulary"]
    },
    {
      "question": "What time does the restaurant close?",
      "choices": ["9 PM", "10 PM", "11 PM", "Midnight"],
      "answer": "B",
      "explain_vi": "Nhà hàng đóng cửa lúc 10 giờ tối.",
      "explain_en": "The restaurant closes at 10 PM.",
      "tags": ["restaurant", "time", "reading"]
    }
  ]
}

CRITICAL: Return ONLY the JSON object with EXACTLY ${questionCount} questions. No additional text before or after the JSON.

Language preference: ${language === 'vi' ? 'Vietnamese explanations should be detailed, English explanations should be concise' : 'English explanations should be detailed, Vietnamese explanations should be concise'}
`;
  }

  /**
   * Parse generated questions từ response
   */
  private parseGeneratedQuestions(text: string): GeneratedQuestion[] {
    try {
      console.log('🔍 Parsing AI response:', text.substring(0, 500) + '...');
      
      // Clean the text - remove markdown code blocks if present
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Try to find JSON object - more robust regex
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in response');
        throw new Error('No JSON found in response');
      }

      const jsonString = jsonMatch[0];
      console.log('📝 Extracted JSON:', jsonString.substring(0, 200) + '...');
      
      const parsed = JSON.parse(jsonString);
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        console.error('❌ Invalid response format - no questions array');
        throw new Error('Invalid response format - no questions array');
      }

      const questions = parsed.questions.map((q: any, index: number) => {
        // Validate each question
        if (!q.question || !q.choices || !q.answer) {
          console.warn(`⚠️ Question ${index + 1} is missing required fields:`, q);
        }
        
        return {
          question: q.question || `Question ${index + 1}`,
          choices: Array.isArray(q.choices) ? q.choices : ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: q.answer || 'A',
          explain_vi: q.explain_vi || 'Giải thích không có sẵn',
          explain_en: q.explain_en || 'Explanation not available',
          tags: Array.isArray(q.tags) ? q.tags : ['generated']
        };
      });

      console.log(`✅ Successfully parsed ${questions.length} questions`);
      return questions;

    } catch (error) {
      console.error('❌ Error parsing generated questions:', error);
      console.error('📝 Raw response:', text);
      return [];
    }
  }

  /**
   * Tạo câu hỏi từ file text
   */
  async generateFromFile(file: File, request: Omit<QuestionGenerationRequest, 'content'>): Promise<QuestionGenerationResponse> {
    try {
      const content = await this.readFileContent(file);
      return this.generateQuestions({
        ...request,
        content
      });
    } catch (error) {
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Error reading file'
      };
    }
  }

  /**
   * Đọc nội dung file
   */
  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Tạo câu hỏi từ URL
   */
  async generateFromUrl(url: string, request: Omit<QuestionGenerationRequest, 'content'>): Promise<QuestionGenerationResponse> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }
      
      const content = await response.text();
      return this.generateQuestions({
        ...request,
        content
      });
    } catch (error) {
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Error fetching URL'
      };
    }
  }
}

export const questionGeneratorService = new QuestionGeneratorService();
