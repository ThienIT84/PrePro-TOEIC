import { BaseService } from '../BaseService';

export interface TOEICQuestion {
  id: string;
  part: number;
  type: 'listening' | 'reading';
  question: string;
  choices: string[];
  correct_answer: string;
  explanation?: string;
  audio_url?: string;
  image_url?: string;
  transcript?: string;
  tags: string[];
  created_at: string;
}

export interface ExamConfig {
  type: 'full' | 'mini' | 'custom' | 'retry';
  parts?: number[];
  questionCount?: number;
  timeLimit?: number;
  failedQuestionIds?: string[];
  examSetId?: string;
}

export interface PartConfig {
  part: number;
  questionCount: number;
  timeLimit: number; // in minutes
  description: string;
}

export const PART_CONFIGS: Record<number, PartConfig> = {
  1: { part: 1, questionCount: 6, timeLimit: 5, description: 'Photos - Mô tả hình ảnh' },
  2: { part: 2, questionCount: 25, timeLimit: 20, description: 'Question-Response - Hỏi đáp ngắn' },
  3: { part: 3, questionCount: 39, timeLimit: 30, description: 'Conversations - Hội thoại ngắn' },
  4: { part: 4, questionCount: 30, timeLimit: 25, description: 'Talks - Bài nói dài' },
  5: { part: 5, questionCount: 30, timeLimit: 15, description: 'Incomplete Sentences - Hoàn thành câu' },
  6: { part: 6, questionCount: 16, timeLimit: 10, description: 'Text Completion - Hoàn thành đoạn văn' },
  7: { part: 7, questionCount: 54, timeLimit: 45, description: 'Reading Comprehension - Đọc hiểu' }
};

export class QuestionGenerationService extends BaseService {
  /**
   * Generate questions based on exam configuration
   */
  async generateQuestions(config: ExamConfig): Promise<TOEICQuestion[]> {
    try {
      this.log('generateQuestions', config);
      
      if (config.type === 'retry' && config.failedQuestionIds) {
        return await this.getFailedQuestions(config.failedQuestionIds);
      }

      // If examSetId is provided, use exam set specific questions
      if (config.examSetId) {
        return await this.generateExamSetQuestions(config);
      }

      if (config.type === 'custom' && config.parts) {
        return await this.generateCustomTestQuestions(config);
      }

      if (config.type === 'mini') {
        return await this.generateMiniTestQuestions(config);
      }

      if (config.type === 'full') {
        return await this.generateFullTestQuestions();
      }

      return [];
    } catch (error) {
      this.handleError(error, 'generateQuestions');
      throw error;
    }
  }

  /**
   * Generate questions from a specific exam set
   */
  private async generateExamSetQuestions(config: ExamConfig): Promise<TOEICQuestion[]> {
    const { examSetId, parts } = config;

    try {
      const { data: examQuestions, error } = await (this.supabase as any)
        .from('exam_questions')
        .select(`
          question_id,
          order_index,
          questions (
            id,
            part,
            prompt_text,
            choices,
            correct_choice,
            explain_vi,
            explain_en,
            audio_url,
            image_url,
            transcript,
            tags,
            created_at
          )
        `)
        .eq('exam_set_id', examSetId)
        .order('order_index', { ascending: true });

      if (error) {
        this.handleError(error, 'generateExamSetQuestions');
        throw error;
      }

      if (!examQuestions || examQuestions.length === 0) {
        if (parts && parts.length > 0) {
          return await this.generateCustomTestQuestions(config);
        }
        return await this.generateFullTestQuestions();
      }

      let questions: TOEICQuestion[] = examQuestions
        .map((eq: any) => {
          const q = eq.questions;
          if (!q) return null;
          return this.convertQuestionToTOEICQuestion(q, q.part);
        })
        .filter((q: any) => q !== null) as TOEICQuestion[];

      if (parts && parts.length > 0) {
        questions = questions.filter(q => parts.includes(q.part));
      }

      return questions;
    } catch (error) {
      if (parts && parts.length > 0) {
        return await this.generateCustomTestQuestions(config);
      }
      return await this.generateFullTestQuestions();
    }
  }

  /**
   * Generate full test questions (200 questions)
   */
  private async generateFullTestQuestions(): Promise<TOEICQuestion[]> {
    try {
      const { data: allQuestions, error } = await (this.supabase as any)
        .from('questions')
        .select('*')
        .in('part', [1, 2, 3, 4, 5, 6, 7])
        .limit(200);

      if (error) {
        this.handleError(error, 'generateFullTestQuestions');
        throw error;
      }

      const questionsByPart: Record<number, any[]> = {
        1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: []
      };

      if (allQuestions) {
        allQuestions.forEach((q: any) => {
          if (q.part >= 1 && q.part <= 7) {
            questionsByPart[q.part].push(q);
          }
        });
      }

      const questions: TOEICQuestion[] = [];
      
      for (let part = 1; part <= 7; part++) {
        const expectedCount = PART_CONFIGS[part].questionCount;
        const dbQuestions = questionsByPart[part] || [];
        
        const convertedQuestions = dbQuestions
          .slice(0, expectedCount)
          .map((q: any) => this.convertQuestionToTOEICQuestion(q, part));
        
        questions.push(...convertedQuestions);
        
        const missingCount = expectedCount - convertedQuestions.length;
        if (missingCount > 0) {
          const mockQuestions = this.generateMockPartQuestions(part, missingCount, 'medium');
          questions.push(...mockQuestions);
        }
      }

      return questions;
    } catch (error) {
      const questions: TOEICQuestion[] = [];
      for (let part = 1; part <= 7; part++) {
        const expectedCount = PART_CONFIGS[part].questionCount;
        const mockQuestions = this.generateMockPartQuestions(part, expectedCount, 'medium');
        questions.push(...mockQuestions);
      }
      return questions;
    }
  }

  /**
   * Generate mini test questions (50-75 questions)
   */
  private async generateMiniTestQuestions(config: ExamConfig): Promise<TOEICQuestion[]> {
    const questionCount = config.questionCount || 50;
    const questions: TOEICQuestion[] = [];
    
    const listeningCount = Math.floor(questionCount * 0.6);
    const readingCount = questionCount - listeningCount;

    const listeningDistribution = [
      { part: 1, count: Math.floor(listeningCount * 0.1) },
      { part: 2, count: Math.floor(listeningCount * 0.3) },
      { part: 3, count: Math.floor(listeningCount * 0.4) },
      { part: 4, count: Math.floor(listeningCount * 0.2) }
    ];

    const readingDistribution = [
      { part: 5, count: Math.floor(readingCount * 0.4) },
      { part: 6, count: Math.floor(readingCount * 0.2) },
      { part: 7, count: Math.floor(readingCount * 0.4) }
    ];

    if (questionCount >= 7) {
      listeningDistribution.forEach(dist => {
        if (dist.count === 0) dist.count = 1;
      });
      readingDistribution.forEach(dist => {
        if (dist.count === 0) dist.count = 1;
      });
    }

    for (const dist of listeningDistribution) {
      if (dist.count > 0) {
        const partQuestions = await this.generatePartQuestions(dist.part, dist.count);
        questions.push(...partQuestions);
      }
    }

    for (const dist of readingDistribution) {
      if (dist.count > 0) {
        const partQuestions = await this.generatePartQuestions(dist.part, dist.count);
        questions.push(...partQuestions);
      }
    }

    if (questions.length < questionCount) {
      const remaining = questionCount - questions.length;
      const allParts = [1, 2, 3, 4, 5, 6, 7];
      for (let i = 0; i < remaining; i++) {
        const randomPart = allParts[Math.floor(Math.random() * allParts.length)];
        const partQuestions = await this.generatePartQuestions(randomPart, 1);
        questions.push(...partQuestions);
      }
    }

    if (questions.length > questionCount) {
      questions.splice(questionCount);
    }

    return questions;
  }

  /**
   * Generate custom test questions
   */
  private async generateCustomTestQuestions(config: ExamConfig): Promise<TOEICQuestion[]> {
    const parts = config.parts || [];
    const questionCount = config.questionCount || 50;

    try {
      const { data: allQuestions, error } = await (this.supabase as any)
        .from('questions')
        .select('*')
        .in('part', parts)
        .limit(questionCount * 2);

      if (error) {
        this.handleError(error, 'generateCustomTestQuestions');
        throw error;
      }

      const questionsByPart: Record<number, any[]> = {};
      parts.forEach(p => questionsByPart[p] = []);

      if (allQuestions) {
        allQuestions.forEach((q: any) => {
          if (parts.includes(q.part)) {
            questionsByPart[q.part].push(q);
          }
        });
      }

      const questionsPerPart = Math.floor(questionCount / parts.length);
      const remainingQuestions = questionCount % parts.length;
      const questions: TOEICQuestion[] = [];

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const count = questionsPerPart + (i < remainingQuestions ? 1 : 0);
        const dbQuestions = questionsByPart[part] || [];
        
        const convertedQuestions = dbQuestions
          .slice(0, count)
          .map((q: any) => this.convertQuestionToTOEICQuestion(q, part));
        
        questions.push(...convertedQuestions);
        
        const missingCount = count - convertedQuestions.length;
        if (missingCount > 0) {
          const mockQuestions = this.generateMockPartQuestions(part, missingCount, 'medium');
          questions.push(...mockQuestions);
        }
      }

      return questions;
    } catch (error) {
      const questions: TOEICQuestion[] = [];
      const questionsPerPart = Math.floor(questionCount / parts.length);
      const remainingQuestions = questionCount % parts.length;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const count = questionsPerPart + (i < remainingQuestions ? 1 : 0);
        const mockQuestions = this.generateMockPartQuestions(part, count, 'medium');
        questions.push(...mockQuestions);
      }
      return questions;
    }
  }

  /**
   * Generate questions for a specific part
   */
  private async generatePartQuestions(part: number, count: number): Promise<TOEICQuestion[]> {
    try {
      if (part < 1 || part > 7) {
        part = 1;
      }

      let { data: existingQuestions, error } = await (this.supabase as any)
        .from('questions')
        .select('*')
        .eq('part', part)
        .limit(count);

      if (!error && existingQuestions && existingQuestions.length < count) {
        const { data: moreQuestions, error: moreError } = await (this.supabase as any)
          .from('questions')
          .select('*')
          .eq('part', part)
          .limit(count);
        
        if (!moreError && moreQuestions) {
          existingQuestions = moreQuestions;
          error = moreError;
        }
      }

      if (!error && existingQuestions && existingQuestions.length > 0) {
        const convertedQuestions = existingQuestions.map((q: any) => this.convertQuestionToTOEICQuestion(q, part));
        
        if (convertedQuestions.length >= count) {
          return convertedQuestions.slice(0, count);
        }
        
        const remainingCount = count - convertedQuestions.length;
        const mockQuestions = this.generateMockPartQuestions(part, remainingCount, 'medium');
        return [...convertedQuestions, ...mockQuestions];
      }

      const mockQuestions = this.generateMockPartQuestions(part, count, 'medium');
      return mockQuestions;
    } catch (error) {
      const fallbackQuestions = this.generateMockPartQuestions(part, count, 'medium');
      return fallbackQuestions;
    }
  }

  /**
   * Convert database item to TOEIC question format
   */
  private convertQuestionToTOEICQuestion(question: any, part: number): TOEICQuestion {
    let choicesArray: string[] = [];
    if (question.choices) {
      if (Array.isArray(question.choices)) {
        choicesArray = question.choices;
      } else if (typeof question.choices === 'object') {
        choicesArray = [
          question.choices.A || question.choices.a || '',
          question.choices.B || question.choices.b || '',
          question.choices.C || question.choices.c || '',
          question.choices.D || question.choices.d || ''
        ];
      }
    }
    
    return {
      id: question.id,
      part,
      type: part <= 4 ? 'listening' : 'reading',
      question: question.prompt_text || question.question || '',
      choices: choicesArray,
      correct_answer: question.correct_choice || question.answer || 'A',
      explanation: question.explain_vi || question.explain_en,
      audio_url: question.audio_url,
      image_url: question.image_url,
      transcript: question.transcript,
      tags: question.tags || [],
      created_at: question.created_at
    };
  }

  /**
   * Generate mock questions for a specific part
   */
  private generateMockPartQuestions(part: number, count: number, difficulty: 'easy' | 'medium' | 'hard'): TOEICQuestion[] {
    const questions: TOEICQuestion[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      try {
        const question = this.createMockQuestion(part, i + 1, difficulty, now);
        questions.push(question);
      } catch (error) {
        const genericQuestion = this.createGenericQuestion(`mock-p${part}-${i + 1}`, part, i + 1, difficulty, now);
        questions.push(genericQuestion);
      }
    }

    return questions;
  }

  private createMockQuestion(part: number, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    const id = `mock-p${part}-${index}-${Date.now()}`;
    
    switch (part) {
      case 1:
        return this.createPart1Question(id, index, difficulty, timestamp);
      case 2:
        return this.createPart2Question(id, index, difficulty, timestamp);
      case 3:
        return this.createPart3Question(id, index, difficulty, timestamp);
      case 4:
        return this.createPart4Question(id, index, difficulty, timestamp);
      case 5:
        return this.createPart5Question(id, index, difficulty, timestamp);
      case 6:
        return this.createPart6Question(id, index, difficulty, timestamp);
      case 7:
        return this.createPart7Question(id, index, difficulty, timestamp);
      default:
        return this.createGenericQuestion(id, part, index, difficulty, timestamp);
    }
  }

  private createPart1Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    const scenarios = [
      {
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        prompt: 'Look at the photograph and choose the statement that best describes what you see.',
        choices: [
          'A woman is writing on a whiteboard in a conference room.',
          'Several people are sitting around a meeting table with laptops.',
          'A man is giving a presentation to an audience.',
          'The office chairs are stacked against the wall.'
        ],
        correct: 'B',
        explanation: 'The image shows people sitting at a conference table with laptops.',
        tags: ['office', 'meeting', 'people']
      },
      {
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
        prompt: 'Look at the photograph and choose the statement that best describes what you see.',
        choices: [
          'Two colleagues are collaborating at a desk with dual monitors.',
          'A woman is filing documents in a cabinet.',
          'Workers are leaving the building through the front entrance.',
          'The computer screens are all turned off.'
        ],
        correct: 'A',
        explanation: 'Two colleagues are seen collaborating at a workstation.',
        tags: ['technology', 'collaboration', 'workplace']
      }
    ];

    const scenario = scenarios[(index - 1) % scenarios.length];

    return {
      id,
      part: 1,
      type: 'listening',
      question: scenario.prompt,
      choices: scenario.choices,
      correct_answer: scenario.correct,
      explanation: scenario.explanation,
      image_url: scenario.image,
      audio_url: 'https://prepro-toeic.s3.amazonaws.com/audio/sample_part1.mp3',
      transcript: scenario.choices.map((c, i) => `(${String.fromCharCode(65 + i)}) ${c}`).join(' '),
      tags: ['mock', 'part1', difficulty, ...scenario.tags],
      created_at: timestamp
    };
  }

  private createPart2Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    const questions = [
      {
        question: 'Where is the annual shareholders meeting being held this year?',
        choices: [
          'In the grand ballroom at the Hilton Hotel.',
          'Yes, I attended it last week.',
          'The shares have increased by 15 percent.'
        ],
        correct: 'A',
        explanation: 'Option A directly answers the location question "Where".',
        tags: ['location', 'meeting']
      },
      {
        question: 'When will the quarterly financial report be ready?',
        choices: [
          'By the end of this Friday afternoon.',
          'Our revenue increased significantly.',
          'Yes, I reported it to the supervisor.'
        ],
        correct: 'A',
        explanation: 'Option A answers the time question "When".',
        tags: ['time', 'report']
      }
    ];

    const q = questions[(index - 1) % questions.length];

    return {
      id,
      part: 2,
      type: 'listening',
      question: q.question,
      choices: q.choices,
      correct_answer: q.correct,
      explanation: q.explanation,
      audio_url: 'https://prepro-toeic.s3.amazonaws.com/audio/sample_part2.mp3',
      transcript: `Question: ${q.question} (A) ${q.choices[0]} (B) ${q.choices[1]} (C) ${q.choices[2]}`,
      tags: ['mock', 'part2', difficulty, ...q.tags],
      created_at: timestamp
    };
  }

  private createPart3Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    return {
      id,
      part: 3,
      type: 'listening',
      question: 'What problem are the speakers discussing?',
      choices: [
        'A delayed shipment from a supplier',
        'A budget deficit in the marketing department',
        'A malfunctioning air conditioning system',
        'A scheduling conflict for the boardroom'
      ],
      correct_answer: 'A',
      explanation: 'The conversation centers around an urgent supplier shipment delay.',
      audio_url: 'https://prepro-toeic.s3.amazonaws.com/audio/sample_part3.mp3',
      transcript: 'Man: Have you heard from the logistics team about the shipment? Woman: Not yet, they said it might be delayed until tomorrow.',
      tags: ['mock', 'part3', difficulty, 'conversation'],
      created_at: timestamp
    };
  }

  private createPart4Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    return {
      id,
      part: 4,
      type: 'listening',
      question: 'What is the main purpose of the announcement?',
      choices: [
        'To announce a company reorganization',
        'To explain new office parking regulations',
        'To introduce a new software system',
        'To congratulate employees on sales targets'
      ],
      correct_answer: 'B',
      explanation: 'The speaker outlines the new parking permit requirements.',
      audio_url: 'https://prepro-toeic.s3.amazonaws.com/audio/sample_part4.mp3',
      transcript: 'Good morning, everyone. Starting next Monday, all employees must display the new green parking permits.',
      tags: ['mock', 'part4', difficulty, 'talk'],
      created_at: timestamp
    };
  }

  private createPart5Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    const questions = [
      {
        question: 'The newly appointed marketing director has proposed a _____ campaign that targets younger demographics.',
        choices: ['comprehensive', 'comprehend', 'comprehensively', 'comprehension'],
        correct: 'A',
        explanation: 'An adjective is needed to modify the noun "campaign". "Comprehensive" is the correct adjective form.',
        tags: ['grammar', 'parts-of-speech', 'adjective']
      },
      {
        question: 'All employees are required to submit their travel expense reports _____ five business days of returning.',
        choices: ['within', 'among', 'during', 'between'],
        correct: 'A',
        explanation: '"Within" indicates a time limit before which an action must be completed.',
        tags: ['grammar', 'prepositions', 'time']
      }
    ];

    const q = questions[(index - 1) % questions.length];

    return {
      id,
      part: 5,
      type: 'reading',
      question: q.question,
      choices: q.choices,
      correct_answer: q.correct,
      explanation: q.explanation,
      tags: ['mock', 'part5', difficulty, ...q.tags],
      created_at: timestamp
    };
  }

  private createPart6Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    return {
      id,
      part: 6,
      type: 'reading',
      question: 'To all staff: Please be advised that the annual performance review cycle will _____ next Monday.',
      choices: ['commence', 'commenced', 'commencement', 'commencing'],
      correct_answer: 'A',
      explanation: 'The modal verb "will" must be followed by the base form of the verb "commence".',
      tags: ['mock', 'part6', difficulty, 'text-completion'],
      created_at: timestamp
    };
  }

  private createPart7Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    return {
      id,
      part: 7,
      type: 'reading',
      question: 'According to the memo, why was the project deadline extended?',
      choices: [
        'Key team members were attending an overseas conference',
        'Inclement weather caused unexpected logistical delays',
        'The client requested substantial design modifications',
        'Software license renewals were temporarily suspended'
      ],
      correct_answer: 'C',
      explanation: 'The third paragraph indicates that the client requested significant scope adjustments.',
      tags: ['mock', 'part7', difficulty, 'reading-comprehension'],
      created_at: timestamp
    };
  }

  private createGenericQuestion(id: string, part: number, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    return {
      id,
      part,
      type: part <= 4 ? 'listening' : 'reading',
      question: `Part ${part} Question #${index} (${difficulty})`,
      choices: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 'A',
      explanation: `Explanation for Part ${part} Question #${index}`,
      tags: ['mock', `part${part}`, difficulty],
      created_at: timestamp
    };
  }

  private async getFailedQuestions(failedQuestionIds: string[]): Promise<TOEICQuestion[]> {
    try {
      const { data: questions, error } = await (this.supabase as any)
        .from('questions')
        .select('*')
        .in('id', failedQuestionIds);

      if (error) {
        this.handleError(error, 'getFailedQuestions');
        throw error;
      }

      return questions?.map((q: any) => this.convertQuestionToTOEICQuestion(q, q.part)) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get part configuration
   */
  getPartConfig(part: number): PartConfig | null {
    return PART_CONFIGS[part] || null;
  }

  /**
   * Get all part configurations
   */
  getAllPartConfigs(): PartConfig[] {
    return Object.values(PART_CONFIGS);
  }
}

export const questionGenerationService = new QuestionGenerationService();
