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

class GroqQuestionGeneratorService {
  private baseUrl: string = 'https://api.groq.com/openai/v1';
  private model: string = 'llama-3.1-8b-instant'; // Updated free model
  private apiKey: string = '';

  constructor() {
    // Hardcode API key để test
    this.apiKey = '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';
    this.model = import.meta.env.VITE_GROQ_MODEL || this.model;
    console.log('🔍 DEBUG: Groq constructor - API Key:', this.apiKey ? 'SET' : 'NOT SET');
    console.log('🔍 DEBUG: Groq constructor - Model:', this.model);
    console.log('🔍 DEBUG: Groq constructor - Raw env:', import.meta.env.VITE_GROQ_API_KEY);
  }

  /**
   * Generate questions using Groq
   */
  async generateQuestions(request: QuestionGenerationRequest): Promise<QuestionGenerationResponse> {
    console.log('🔍 DEBUG: Groq generateQuestions started');
    
    if (!this.apiKey) {
      console.error('🔍 DEBUG: Groq API key not configured');
      return {
        questions: [],
        success: false,
        error: 'Groq API key not configured. Get free API key at https://console.groq.com/'
      };
    }

    try {
      console.log(`⚡ Generating ${request.questionCount} questions using Groq...`);
      console.log('🔍 DEBUG: Groq API key found, building prompt...');
      
      const prompt = this.buildPrompt(request);
      console.log('🔍 DEBUG: Groq prompt built, length:', prompt.length);
      
      console.log('🔍 DEBUG: Groq making API request to:', `${this.baseUrl}/chat/completions`);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert TOEIC test creator. Generate high-quality questions based on the provided content. Always return exactly the requested number of questions in valid JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: Math.max(4000, request.questionCount * 800),
          top_p: 0.9
        })
      });

      console.log('🔍 DEBUG: Groq response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔍 DEBUG: Groq API error response:', errorText);
        throw new Error(`Groq API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔍 DEBUG: Groq API data received:', data);
      
      const generatedText = data.choices[0]?.message?.content;
      console.log('🔍 DEBUG: Groq generated text length:', generatedText?.length || 0);

      if (!generatedText) {
        throw new Error('No response from Groq');
      }

      const questions = this.parseGeneratedQuestions(generatedText);
      console.log('🔍 DEBUG: Groq questions parsed, count:', questions.length);
      
      return {
        questions,
        success: questions.length > 0
      };

    } catch (error) {
      console.error('Error generating questions with Groq:', error);
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build prompt for Groq
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

    return `You are an expert TOEIC test creator. You MUST create EXACTLY ${questionCount} questions.

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
    }
  ]
}

CRITICAL: Return ONLY the JSON object with EXACTLY ${questionCount} questions. No additional text before or after the JSON.

Language preference: ${language === 'vi' ? 'Vietnamese explanations should be detailed, English explanations should be concise' : 'English explanations should be detailed, Vietnamese explanations should be concise'}`;
  }

  /**
   * Parse generated questions
   */
  private parseGeneratedQuestions(text: string): GeneratedQuestion[] {
    try {
      console.log('🔍 Parsing Groq response...');
      
      // Clean text
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Find JSON
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Invalid response format');
      }

      return parsed.questions.map((q: any, index: number) => ({
        question: q.question || `Question ${index + 1}`,
        choices: Array.isArray(q.choices) ? q.choices : ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: q.answer || 'A',
        explain_vi: q.explain_vi || 'Giải thích không có sẵn',
        explain_en: q.explain_en || 'Explanation not available',
        tags: Array.isArray(q.tags) ? q.tags : ['generated']
      }));

    } catch (error) {
      console.error('Error parsing Groq response:', error);
      return [];
    }
  }

  /**
   * Check if Groq is available
   */
  async checkConnection(): Promise<boolean> {
    if (!this.apiKey) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const groqQuestionGeneratorService = new GroqQuestionGeneratorService();
