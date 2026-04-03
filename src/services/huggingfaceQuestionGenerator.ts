import { Item, DrillType, Difficulty } from '@/types';

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

class HuggingFaceQuestionGeneratorService {
  private baseUrl: string = 'https://api-inference.huggingface.co/models';
  private model: string = 'microsoft/DialoGPT-medium'; // Free model
  private apiKey: string = ''; // Optional, có thể dùng không cần key

  constructor() {
    // Hugging Face có thể dùng không cần API key với rate limit
    this.apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY || '';
  }

  /**
   * Generate questions using Hugging Face
   */
  async generateQuestions(request: QuestionGenerationRequest): Promise<QuestionGenerationResponse> {
    try {
      console.log(`🤗 Generating ${request.questionCount} questions using Hugging Face...`);
      
      const prompt = this.buildPrompt(request);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: Math.max(1000, request.questionCount * 200),
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false
          }
        })
      });

      if (!response.ok) {
        if (response.status === 503) {
          throw new Error('Model is loading, please try again in a few seconds');
        }
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = Array.isArray(data) ? data[0]?.generated_text : data.generated_text;

      if (!generatedText) {
        throw new Error('No response from Hugging Face');
      }

      const questions = this.parseGeneratedQuestions(generatedText);
      
      return {
        questions,
        success: questions.length > 0
      };

    } catch (error) {
      console.error('Error generating questions with Hugging Face:', error);
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build prompt for Hugging Face
   */
  private buildPrompt(request: QuestionGenerationRequest): string {
    const { content, type, difficulty, questionCount, language } = request;
    
    const typeInstructions = {
      vocab: 'vocabulary questions',
      grammar: 'grammar questions',
      listening: 'listening questions',
      reading: 'reading questions',
      mix: 'mixed questions'
    };

    return `Create ${questionCount} TOEIC ${typeInstructions[type]} questions based on this content: "${content}"

Format each question as:
Q: [Question text]
A) [Option A]
B) [Option B] 
C) [Option C]
D) [Option D]
Answer: [A/B/C/D]
Explain: [Explanation]

Generate ${questionCount} questions:`;
  }

  /**
   * Parse generated questions
   */
  private parseGeneratedQuestions(text: string): GeneratedQuestion[] {
    try {
      console.log('🔍 Parsing Hugging Face response...');
      
      const questions: GeneratedQuestion[] = [];
      const lines = text.split('\n');
      
      let currentQuestion: Partial<GeneratedQuestion> = {};
      let questionIndex = 0;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('Q:')) {
          if (currentQuestion.question) {
            questions.push(this.finalizeQuestion(currentQuestion, questionIndex));
            questionIndex++;
          }
          currentQuestion = {
            question: trimmedLine.replace('Q:', '').trim(),
            choices: [],
            answer: '',
            explain_vi: '',
            explain_en: '',
            tags: ['generated']
          };
        } else if (trimmedLine.match(/^[A-D]\)/)) {
          if (currentQuestion.choices) {
            currentQuestion.choices.push(trimmedLine.substring(3).trim());
          }
        } else if (trimmedLine.startsWith('Answer:')) {
          currentQuestion.answer = trimmedLine.replace('Answer:', '').trim();
        } else if (trimmedLine.startsWith('Explain:')) {
          const explanation = trimmedLine.replace('Explain:', '').trim();
          currentQuestion.explain_vi = explanation;
          currentQuestion.explain_en = explanation;
        }
      }
      
      // Add the last question
      if (currentQuestion.question) {
        questions.push(this.finalizeQuestion(currentQuestion, questionIndex));
      }
      
      return questions;

    } catch (error) {
      console.error('Error parsing Hugging Face response:', error);
      return [];
    }
  }

  /**
   * Finalize question with defaults
   */
  private finalizeQuestion(question: Partial<GeneratedQuestion>, index: number): GeneratedQuestion {
    return {
      question: question.question || `Question ${index + 1}`,
      choices: question.choices && question.choices.length >= 4 
        ? question.choices.slice(0, 4)
        : ['Option A', 'Option B', 'Option C', 'Option D'],
      answer: question.answer || 'A',
      explain_vi: question.explain_vi || 'Giải thích không có sẵn',
      explain_en: question.explain_en || 'Explanation not available',
      tags: question.tags || ['generated']
    };
  }

  /**
   * Check if Hugging Face is available
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: 'test',
          parameters: { max_length: 10 }
        })
      });
      return response.ok || response.status === 503; // 503 means model loading
    } catch {
      return false;
    }
  }
}

export const huggingfaceQuestionGeneratorService = new HuggingFaceQuestionGeneratorService();

