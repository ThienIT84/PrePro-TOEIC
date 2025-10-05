import { Item, DrillType } from '@/types';

export interface QuestionGenerationRequest {
  content: string;
  type: DrillType;
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

class FreeQuestionGeneratorService {
  // Template patterns for different question types
  private templates = {
    vocab: [
      {
        pattern: 'What does "{word}" mean?',
        choices: ['{wrong1}', '{correct}', '{wrong2}', '{wrong3}'],
        explanation_vi: '"{word}" có nghĩa là {meaning}.',
        explanation_en: '"{word}" means {meaning}.'
      },
      {
        pattern: 'Choose the correct meaning of "{word}":',
        choices: ['{wrong1}', '{correct}', '{wrong2}', '{wrong3}'],
        explanation_vi: 'Đáp án đúng là {correct} vì "{word}" có nghĩa là {meaning}.',
        explanation_en: 'The correct answer is {correct} because "{word}" means {meaning}.'
      }
    ],
    grammar: [
      {
        pattern: 'Choose the correct form: "{sentence}"',
        choices: ['{wrong1}', '{correct}', '{wrong2}', '{wrong3}'],
        explanation_vi: 'Câu đúng là {correct} vì {grammar_rule}.',
        explanation_en: 'The correct answer is {correct} because {grammar_rule}.'
      }
    ],
    listening: [
      {
        pattern: 'Listen to the conversation. What is the main topic?',
        choices: ['{wrong1}', '{correct}', '{wrong2}', '{wrong3}'],
        explanation_vi: 'Chủ đề chính của cuộc hội thoại là {correct}.',
        explanation_en: 'The main topic of the conversation is {correct}.'
      }
    ],
    reading: [
      {
        pattern: 'What is the main idea of the passage?',
        choices: ['{wrong1}', '{correct}', '{wrong2}', '{wrong3}'],
        explanation_vi: 'Ý chính của đoạn văn là {correct}.',
        explanation_en: 'The main idea of the passage is {correct}.'
      }
    ]
  };

  async generateQuestions(request: QuestionGenerationRequest): Promise<QuestionGenerationResponse> {
    try {
      const questions: GeneratedQuestion[] = [];
      const templates = this.templates[request.type] || [];
      
      if (templates.length === 0) {
        return {
          questions: [],
          success: false,
          error: `No templates available for type: ${request.type}`
        };
      }

      // Extract words/phrases from content
      const contentWords = this.extractWords(request.content);
      
      for (let i = 0; i < request.questionCount && i < contentWords.length; i++) {
        const word = contentWords[i];
        const template = templates[i % templates.length];
        
        // Generate wrong choices
        const wrongChoices = this.generateWrongChoices(word, request.type);
        
        // Create question
        const question = this.replacePlaceholders(template.pattern, { word, context: request.content });
        const choices = template.choices.map(choice => 
          this.replacePlaceholders(choice, { 
            word, 
            correct: this.getCorrectAnswer(word, request.type),
            wrong1: wrongChoices[0],
            wrong2: wrongChoices[1], 
            wrong3: wrongChoices[2]
          })
        );
        
        const correctAnswer = this.getCorrectAnswer(word, request.type);
        const answerIndex = choices.findIndex(choice => choice === correctAnswer);
        const answer = String.fromCharCode(65 + answerIndex); // A, B, C, D
        
        questions.push({
          question,
          choices,
          answer,
          explain_vi: this.replacePlaceholders(template.explanation_vi, { 
            word, 
            correct: correctAnswer,
            meaning: this.getMeaning(word, request.type)
          }),
          explain_en: this.replacePlaceholders(template.explanation_en, { 
            word, 
            correct: correctAnswer,
            meaning: this.getMeaning(word, request.type)
          }),
          tags: [request.type, 'generated']
        });
      }

      return {
        questions,
        success: true
      };
    } catch (error) {
      return {
        questions: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private extractWords(content: string): string[] {
    // Simple word extraction - can be improved
    return content
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 20); // Limit to 20 words
  }

  private generateWrongChoices(word: string, type: DrillType): string[] {
    // Simple wrong choice generation - can be improved
    const wrongChoices = [
      `${word}ing`,
      `${word}ed`, 
      `${word}s`,
      `un${word}`,
      `${word}ly`,
      `re${word}`
    ];
    
    return wrongChoices.slice(0, 3);
  }

  private getCorrectAnswer(word: string, type: DrillType): string {
    // Simple correct answer generation - can be improved
    return word;
  }

  private getMeaning(word: string, type: DrillType): string {
    // Simple meaning generation - can be improved
    return `the meaning of ${word}`;
  }

  private replacePlaceholders(text: string, replacements: Record<string, string>): string {
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return replacements[key] || match;
    });
  }
}

export const freeQuestionGeneratorService = new FreeQuestionGeneratorService();
export default freeQuestionGeneratorService;
