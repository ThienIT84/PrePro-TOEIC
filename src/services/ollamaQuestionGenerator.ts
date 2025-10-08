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

class OllamaQuestionGeneratorService {
  private baseUrl: string = 'http://localhost:11434'; // Ollama default port
  private model: string = 'llama3.1:8b'; // Free model

  /**
   * Generate questions using Ollama (Local AI)
   */
  async generateQuestions(request: QuestionGenerationRequest): Promise<QuestionGenerationResponse> {
    try {
      console.log(`🦙 Generating ${request.questionCount} questions using Ollama...`);
      
      const prompt = this.buildPrompt(request);
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: Math.max(4000, request.questionCount * 800)
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const generatedText = data.response;

      if (!generatedText) {
        throw new Error('No response from Ollama');
      }

      const questions = this.parseGeneratedQuestions(generatedText);
      
      return {
        questions,
        success: questions.length > 0
      };

    } catch (error) {
      console.error('Error generating questions with Ollama:', error);
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build prompt for Ollama
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

    return `You are an expert TOEIC test creator. Create EXACTLY ${questionCount} questions.

Content: "${content}"

Create ${questionCount} TOEIC ${typeInstructions[type]} at ${difficultyInstructions[difficulty]} level.

Requirements:
1. Create EXACTLY ${questionCount} questions
2. Each question has 4 choices (A, B, C, D)
3. Only one correct answer per question
4. Provide explanations in Vietnamese and English
5. Include relevant tags
6. Make questions realistic and TOEIC-like

Output JSON format:
{
  "questions": [
    {
      "question": "Question text?",
      "choices": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "A",
      "explain_vi": "Vietnamese explanation",
      "explain_en": "English explanation",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Return ONLY the JSON object.`;
  }

  /**
   * Parse generated questions
   */
  private parseGeneratedQuestions(text: string): GeneratedQuestion[] {
    try {
      console.log('🔍 Parsing Ollama response...');
      
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

      return parsed.questions.map((q: unknown, index: number) => ({
        question: q.question || `Question ${index + 1}`,
        choices: Array.isArray(q.choices) ? q.choices : ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: q.answer || 'A',
        explain_vi: q.explain_vi || 'Giải thích không có sẵn',
        explain_en: q.explain_en || 'Explanation not available',
        tags: Array.isArray(q.tags) ? q.tags : ['generated']
      }));

    } catch (error) {
      console.error('Error parsing Ollama response:', error);
      return [];
    }
  }

  /**
   * Check if Ollama is running
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models?.map((m: unknown) => m.name) || [];
    } catch {
      return [];
    }
  }
}

export const ollamaQuestionGeneratorService = new OllamaQuestionGeneratorService();

