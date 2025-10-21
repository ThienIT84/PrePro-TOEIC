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
  private model: string = 'llama3:latest'; // Use your available model

  /**
   * Set the model to use
   */
  setModel(model: string): void {
    this.model = model;
    console.log('🦙 Ollama model set to:', model);
  }

  /**
   * Get current model
   */
  getCurrentModel(): string {
    return this.model;
  }

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
        console.error('❌ No JSON found in response');
        throw new Error('No JSON found in response');
      }

      console.log('🔍 JSON match length:', jsonMatch[0].length);

      // Remove formatting whitespace (same as Groq)
      let jsonStr = jsonMatch[0]
        .replace(/\r\n/g, ' ')  // Remove Windows newlines
        .replace(/\n/g, ' ')    // Remove Unix newlines
        .replace(/\r/g, ' ')    // Remove Mac newlines
        .replace(/\t/g, ' ')    // Remove tabs
        .replace(/\s+/g, ' ');  // Collapse multiple spaces

      console.log('🔍 Cleaned JSON length:', jsonStr.length);
      console.log('🔍 Cleaned JSON preview:', jsonStr.substring(0, 300));

      const parsed = JSON.parse(jsonStr);
      
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        console.error('❌ Invalid response format:', parsed);
        throw new Error('Invalid response format');
      }

      console.log('✅ Successfully parsed', parsed.questions.length, 'questions');

      return parsed.questions.map((q: any, index: number) => ({
        question: q.question || `Question ${index + 1}`,
        choices: Array.isArray(q.choices) ? q.choices : ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: q.answer || 'A',
        explain_vi: q.explain_vi || 'Giải thích không có sẵn',
        explain_en: q.explain_en || 'Explanation not available',
        tags: Array.isArray(q.tags) ? q.tags : ['generated']
      }));

    } catch (error) {
      console.error('❌ Error parsing Ollama response:', error);
      console.error('Raw text preview:', text.substring(0, 500));
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
    try {
      console.log(`🦙 Generating Part 6 questions using Ollama...`);
      console.log('🔍 Model:', this.model);
      console.log('🔍 Content length:', request.content.length);
      
      const prompt = this.buildPart6Prompt(request);
      console.log('🔍 Prompt length:', prompt.length);
      
      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minutes timeout
      
      try {
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
              num_predict: 2000 // Limit response length
            }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Ollama API error:', response.status, errorText);
          throw new Error(`Ollama API error: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Received response from Ollama');
        
        const generatedText = data.response;

        if (!generatedText) {
          console.error('❌ No response from Ollama');
          throw new Error('No response from Ollama');
        }

        console.log('🔍 Response length:', generatedText.length);
        console.log('🔍 Response preview:', generatedText.substring(0, 200));

        const result = this.parsePart6Response(generatedText);
        
        if (!result.success) {
          console.error('❌ Parse failed:', result.error);
          throw new Error(result.error || 'Failed to parse response');
        }
        
        console.log('✅ Successfully generated Part 6 questions');
        
        return {
          success: result.success,
          passage: result.passage,
          questions: result.questions,
          error: result.error
        };
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Ollama mất quá nhiều thời gian (>2 phút). Thử giảm độ dài nội dung hoặc sử dụng model nhẹ hơn (gemma3:1b)');
        }
        throw fetchError;
      }

    } catch (error) {
      console.error('❌ Error generating Part 6 questions with Ollama:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: `Ollama error: ${errorMessage}. Vui lòng kiểm tra: 1) Ollama đang chạy, 2) Model '${this.model}' đã được pull, 3) Nội dung không quá dài`
      };
    }
  }

  /**
   * Generate Part 7 questions with passages
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
    try {
      console.log(`🦙 Generating Part 7 questions using Ollama...`);
      
      const prompt = this.buildPart7Prompt(request);
      
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
            max_tokens: 8000
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

      const result = this.parsePart7Response(generatedText);
      
      return {
        success: result.success,
        passages: result.passages,
        questions: result.questions,
        error: result.error
      };

    } catch (error) {
      console.error('Error generating Part 7 questions with Ollama:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build prompt for Part 6
   */
  private buildPart6Prompt(request: QuestionGenerationRequest): string {
    return `You are an expert TOEIC test creator. Create a Part 6 passage with 4 questions.

Content: "${request.content}"

Create:
1. A passage with 4 blanks (marked with numbers like (135), (136), (137), (138))
2. 4 questions with 4 choices each
3. Explanations in Vietnamese and English

Output JSON format:
{
  "passage": {
    "content": "Passage text with blanks like (135), (136), (137), (138)",
    "blanks": [135, 136, 137, 138]
  },
  "questions": [
    {
      "question": "Question for blank (135)?",
      "choices": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "A",
      "explain_vi": "Vietnamese explanation",
      "explain_en": "English explanation",
      "tags": ["grammar", "part6"]
    }
  ]
}

Return ONLY the JSON object.`;
  }

  /**
   * Build prompt for Part 7
   */
  private buildPart7Prompt(request: QuestionGenerationRequest & { passageCount?: number }): string {
    const passageCount = request.passageCount || 1;
    return `You are an expert TOEIC test creator. Create Part 7 passages with questions.

Content: "${request.content}"
Passage Count: ${passageCount}

Create:
1. ${passageCount} passage(s) (single, double, or triple)
2. Questions based on the passages
3. Explanations in Vietnamese and English

Output JSON format:
{
  "passages": [
    {
      "content": "Passage content",
      "type": "email|article|notice|etc",
      "title": "Optional title"
    }
  ],
  "questions": [
    {
      "question": "Question text?",
      "choices": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "A",
      "explain_vi": "Vietnamese explanation",
      "explain_en": "English explanation",
      "tags": ["reading", "part7"]
    }
  ]
}

Return ONLY the JSON object.`;
  }

  /**
   * Parse Part 6 response
   */
  private parsePart6Response(text: string): {
    success: boolean;
    passage?: { content: string; blanks: number[] };
    questions?: GeneratedQuestion[];
    error?: string;
  } {
    try {
      console.log('🔍 Parsing Part 6 response...');
      
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in response');
        throw new Error('No JSON found in response');
      }

      console.log('🔍 JSON match length:', jsonMatch[0].length);

      // Remove formatting whitespace (same as Groq)
      let jsonStr = jsonMatch[0]
        .replace(/\r\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ');

      console.log('🔍 Cleaned JSON length:', jsonStr.length);
      console.log('🔍 Cleaned JSON preview:', jsonStr.substring(0, 300));
      
      const parsed = JSON.parse(jsonStr);
      
      if (!parsed.passage || !parsed.questions) {
        console.error('❌ Invalid response format:', parsed);
        throw new Error('Invalid response format');
      }

      console.log('✅ Successfully parsed Part 6 response');
      
      return {
        success: true,
        passage: parsed.passage,
        questions: parsed.questions.map((q: any, index: number) => ({
          question: q.question || `Question ${index + 1}`,
          choices: Array.isArray(q.choices) ? q.choices : ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: q.answer || 'A',
          explain_vi: q.explain_vi || 'Giải thích không có sẵn',
          explain_en: q.explain_en || 'Explanation not available',
          tags: Array.isArray(q.tags) ? q.tags : ['generated']
        }))
      };

    } catch (error) {
      console.error('❌ Error parsing Part 6 response:', error);
      console.error('Raw text preview:', text.substring(0, 500));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Parse error'
      };
    }
  }

  /**
   * Parse Part 7 response
   */
  private parsePart7Response(text: string): {
    success: boolean;
    passages?: Array<{ content: string; type: string; title?: string }>;
    questions?: GeneratedQuestion[];
    error?: string;
  } {
    try {
      console.log('🔍 Parsing Part 7 response...');
      
      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in response');
        throw new Error('No JSON found in response');
      }

      console.log('🔍 JSON match length:', jsonMatch[0].length);

      // Remove formatting whitespace (same as Groq)
      let jsonStr = jsonMatch[0]
        .replace(/\r\n/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ');

      console.log('🔍 Cleaned JSON length:', jsonStr.length);
      console.log('🔍 Cleaned JSON preview:', jsonStr.substring(0, 300));
      
      const parsed = JSON.parse(jsonStr);
      
      if (!parsed.passages || !parsed.questions) {
        console.error('❌ Invalid response format:', parsed);
        throw new Error('Invalid response format');
      }

      console.log('✅ Successfully parsed Part 7 response');

      return {
        success: true,
        passages: parsed.passages,
        questions: parsed.questions.map((q: any, index: number) => ({
          question: q.question || `Question ${index + 1}`,
          choices: Array.isArray(q.choices) ? q.choices : ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: q.answer || 'A',
          explain_vi: q.explain_vi || 'Giải thích không có sẵn',
          explain_en: q.explain_en || 'Explanation not available',
          tags: Array.isArray(q.tags) ? q.tags : ['generated']
        }))
      };

    } catch (error) {
      console.error('❌ Error parsing Part 7 response:', error);
      console.error('Raw text preview:', text.substring(0, 500));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Parse error'
      };
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }
}

export const ollamaQuestionGeneratorService = new OllamaQuestionGeneratorService();

