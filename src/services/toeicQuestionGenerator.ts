import { supabase } from '@/integrations/supabase/client';

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

const PART_CONFIGS: Record<number, PartConfig> = {
  1: { part: 1, questionCount: 6, timeLimit: 5, description: 'Photos - Mô tả hình ảnh' },
  2: { part: 2, questionCount: 25, timeLimit: 20, description: 'Question-Response - Hỏi đáp ngắn' },
  3: { part: 3, questionCount: 39, timeLimit: 30, description: 'Conversations - Hội thoại ngắn' },
  4: { part: 4, questionCount: 30, timeLimit: 25, description: 'Talks - Bài nói dài' },
  5: { part: 5, questionCount: 30, timeLimit: 15, description: 'Incomplete Sentences - Hoàn thành câu' },
  6: { part: 6, questionCount: 16, timeLimit: 10, description: 'Text Completion - Hoàn thành đoạn văn' },
  7: { part: 7, questionCount: 54, timeLimit: 45, description: 'Reading Comprehension - Đọc hiểu' }
};

class TOEICQuestionGenerator {
  /**
   * Generate questions based on exam configuration
   */
  async generateQuestions(config: ExamConfig): Promise<TOEICQuestion[]> {
    try {
      console.log('🎯 Generating TOEIC questions with config:', config);
      
      if (config.type === 'retry' && config.failedQuestionIds) {
        return await this.getFailedQuestions(config.failedQuestionIds);
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
      console.error('❌ Error generating TOEIC questions:', error);
      throw error;
    }
  }

  /**
   * Generate full test questions (200 questions)
   */
  private async generateFullTestQuestions(): Promise<TOEICQuestion[]> {
    console.log('🎯 Generating Full Test (200 questions)...');
    const questions: TOEICQuestion[] = [];
    
    // Generate all parts
    for (let part = 1; part <= 7; part++) {
      const expectedCount = PART_CONFIGS[part].questionCount;
      console.log(`🔄 Generating Part ${part}: expecting ${expectedCount} questions...`);
      
      const partQuestions = await this.generatePartQuestions(part, expectedCount);
      questions.push(...partQuestions);
      
      console.log(`✅ Generated ${partQuestions.length}/${expectedCount} questions for Part ${part}`);
      
      // Debug: log first question details
      if (partQuestions.length > 0) {
        console.log(`📝 Sample question for Part ${part}:`, {
          id: partQuestions[0].id,
          type: partQuestions[0].type,
          hasChoices: partQuestions[0].choices?.length || 0
        });
      }
    }

    console.log(`🎉 Full Test generated: ${questions.length} total questions`);
    console.log(`📊 Question distribution:`, questions.reduce((acc, q) => {
      acc[q.part] = (acc[q.part] || 0) + 1;
      return acc;
    }, {} as Record<number, number>));
    
    return questions;
  }

  /**
   * Generate mini test questions (50-75 questions)
   */
  private async generateMiniTestQuestions(config: ExamConfig): Promise<TOEICQuestion[]> {
    const questionCount = config.questionCount || 50;
    console.log(`⚡ Generating Mini Test (${questionCount} questions)...`);
    
    const questions: TOEICQuestion[] = [];
    
    // Distribute questions across parts (more listening focus)
    const listeningCount = Math.floor(questionCount * 0.6); // 60% listening
    const readingCount = questionCount - listeningCount; // 40% reading

    // Calculate distribution more precisely
    const listeningDistribution = [
      { part: 1, count: Math.floor(listeningCount * 0.1) }, // 10% Part 1
      { part: 2, count: Math.floor(listeningCount * 0.3) }, // 30% Part 2
      { part: 3, count: Math.floor(listeningCount * 0.4) }, // 40% Part 3
      { part: 4, count: Math.floor(listeningCount * 0.2) }  // 20% Part 4
    ];

    const readingDistribution = [
      { part: 5, count: Math.floor(readingCount * 0.4) }, // 40% Part 5
      { part: 6, count: Math.floor(readingCount * 0.2) }, // 20% Part 6
      { part: 7, count: Math.floor(readingCount * 0.4) }  // 40% Part 7
    ];

    // Ensure at least 1 question per part if we have enough questions
    if (questionCount >= 7) {
      listeningDistribution.forEach(dist => {
        if (dist.count === 0) dist.count = 1;
      });
      readingDistribution.forEach(dist => {
        if (dist.count === 0) dist.count = 1;
      });
    }

    // Generate listening questions
    for (const dist of listeningDistribution) {
      if (dist.count > 0) {
        const partQuestions = await this.generatePartQuestions(dist.part, dist.count);
        questions.push(...partQuestions);
        console.log(`✅ Generated ${partQuestions.length} questions for Part ${dist.part}`);
      }
    }

    // Generate reading questions
    for (const dist of readingDistribution) {
      if (dist.count > 0) {
        const partQuestions = await this.generatePartQuestions(dist.part, dist.count);
        questions.push(...partQuestions);
        console.log(`✅ Generated ${partQuestions.length} questions for Part ${dist.part}`);
      }
    }

    // If we don't have enough questions, generate more to reach the target
    if (questions.length < questionCount) {
      const remaining = questionCount - questions.length;
      console.log(`⚠️ Need ${remaining} more questions to reach target`);
      
      // Generate additional questions from random parts
      const allParts = [1, 2, 3, 4, 5, 6, 7];
      for (let i = 0; i < remaining; i++) {
        const randomPart = allParts[Math.floor(Math.random() * allParts.length)];
        const partQuestions = await this.generatePartQuestions(randomPart, 1);
        questions.push(...partQuestions);
      }
    }

    // If we have too many questions, trim to target
    if (questions.length > questionCount) {
      questions.splice(questionCount);
      console.log(`✂️ Trimmed to ${questionCount} questions`);
    }

    console.log(`🎉 Mini Test generated: ${questions.length} total questions`);
    return questions;
  }

  /**
   * Generate custom test questions
   */
  private async generateCustomTestQuestions(config: ExamConfig): Promise<TOEICQuestion[]> {
    const questions: TOEICQuestion[] = [];
    const parts = config.parts || [];
    const questionCount = config.questionCount || 50;

    console.log(`🎨 Generating Custom Test (${questionCount} questions for parts: ${parts.join(', ')})...`);

    // Distribute questions across selected parts
    const questionsPerPart = Math.floor(questionCount / parts.length);
    const remainingQuestions = questionCount % parts.length;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const count = questionsPerPart + (i < remainingQuestions ? 1 : 0);
      
      if (count > 0) {
        const partQuestions = await this.generatePartQuestions(part, count);
        questions.push(...partQuestions);
        console.log(`✅ Generated ${partQuestions.length} questions for Part ${part}`);
      }
    }

    console.log(`🎉 Custom Test generated: ${questions.length} total questions`);
    return questions;
  }

  /**
   * Generate questions for a specific part
   */
  private async generatePartQuestions(part: number, count: number): Promise<TOEICQuestion[]> {
    try {
      console.log(`🔍 Generating ${count} questions for Part ${part}...`);
      
      // Validate part number
      if (part < 1 || part > 7) {
        console.warn(`⚠️ Invalid part number: ${part}. Using Part 1 instead.`);
        part = 1;
      }

      // First try to get real questions from database
      // Map TOEIC parts to database types
      const dbType = part <= 4 ? 'listening' : 'reading';
      
      // Try to get questions from database
      let { data: existingQuestions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('type', dbType)
        .limit(count);

      // If not enough questions with specific difficulty, try any difficulty
      if (!error && existingQuestions && existingQuestions.length < count) {
        console.log(`📚 Found only ${existingQuestions.length} questions, trying to get more...`);
        const { data: moreQuestions, error: moreError } = await supabase
          .from('questions')
          .select('*')
          .eq('type', dbType)
          .limit(count);
        
        if (!moreError && moreQuestions) {
          existingQuestions = moreQuestions;
          error = moreError;
        }
      }

      if (!error && existingQuestions && existingQuestions.length > 0) {
        console.log(`📚 Found ${existingQuestions.length} real questions from database`);
        const convertedQuestions = existingQuestions.map(q => this.convertQuestionToTOEICQuestion(q, part));
        
        // If we have enough real questions, return them
        if (convertedQuestions.length >= count) {
          return convertedQuestions.slice(0, count);
        }
        
        // If not enough real questions, supplement with mock questions
        const remainingCount = count - convertedQuestions.length;
        console.log(`🎭 Supplementing with ${remainingCount} mock questions for Part ${part}`);
        const mockQuestions = this.generateMockPartQuestions(part, remainingCount, difficulty);
        return [...convertedQuestions, ...mockQuestions];
      }

      // If no real questions at all, generate all mock questions
      console.log(`🎭 Generating ${count} mock questions for Part ${part}`);
      const mockQuestions = this.generateMockPartQuestions(part, count, difficulty);
      
      // Ensure we have the right number of questions
      if (mockQuestions.length !== count) {
        console.warn(`⚠️ Expected ${count} questions but got ${mockQuestions.length} for Part ${part}`);
      }
      
      return mockQuestions;
    } catch (error) {
      console.error(`❌ Error generating Part ${part} questions:`, error);
      console.log(`🔄 Falling back to mock questions for Part ${part}`);
      const fallbackQuestions = this.generateMockPartQuestions(part, count, difficulty);
      
      // Ensure we have the right number of questions even in fallback
      if (fallbackQuestions.length !== count) {
        console.warn(`⚠️ Fallback: Expected ${count} questions but got ${fallbackQuestions.length} for Part ${part}`);
      }
      
      return fallbackQuestions;
    }
  }

  /**
   * Convert database item to TOEIC question format
   */
  private convertQuestionToTOEICQuestion(question: any, part: number): TOEICQuestion {
    return {
      id: question.id,
      part,
      type: part <= 4 ? 'listening' : 'reading',
      question: question.question,
      choices: question.choices || [],
      correct_answer: question.answer, // Fix: use 'answer' instead of 'correct_answer'
      explanation: question.explain_vi || question.explain_en, // Use Vietnamese explanation first
      audio_url: question.audio_url,
      image_url: question.image_url,
      transcript: question.transcript,
      difficulty: question.difficulty,
      tags: question.tags || [],
      created_at: question.created_at
    };
  }

  /**
   * Generate mock questions for a specific part
   */
  private generateMockPartQuestions(part: number, count: number, difficulty: 'easy' | 'medium' | 'hard'): TOEICQuestion[] {
    console.log(`🎭 Creating ${count} mock questions for Part ${part} (${difficulty})`);
    const questions: TOEICQuestion[] = [];
    const now = new Date().toISOString();

    for (let i = 0; i < count; i++) {
      try {
        const question = this.createMockQuestion(part, i + 1, difficulty, now);
        questions.push(question);
      } catch (error) {
        console.error(`❌ Error creating question ${i + 1} for Part ${part}:`, error);
        // Create a fallback generic question
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const baseId = `fallback_${part}_${i + 1}_${randomSuffix}_${Date.now()}`;
        const fallbackQuestion = this.createGenericQuestion(baseId, part, i + 1, difficulty, now);
        questions.push(fallbackQuestion);
      }
    }

    console.log(`✅ Successfully created ${questions.length} mock questions for Part ${part}`);
    
    // Ensure we have the right number of questions
    if (questions.length !== count) {
      console.warn(`⚠️ Expected ${count} questions but got ${questions.length} for Part ${part}`);
    }
    
    return questions;
  }

  /**
   * Create a mock question for specific part
   */
  private createMockQuestion(part: number, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    try {
      // Use a more unique ID with random component
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const baseId = `mock_${part}_${index}_${randomSuffix}_${Date.now()}`;
      
      switch (part) {
        case 1:
          return this.createPart1Question(baseId, index, difficulty, timestamp);
        case 2:
          return this.createPart2Question(baseId, index, difficulty, timestamp);
        case 3:
          return this.createPart3Question(baseId, index, difficulty, timestamp);
        case 4:
          return this.createPart4Question(baseId, index, difficulty, timestamp);
        case 5:
          return this.createPart5Question(baseId, index, difficulty, timestamp);
        case 6:
          return this.createPart6Question(baseId, index, difficulty, timestamp);
        case 7:
          return this.createPart7Question(baseId, index, difficulty, timestamp);
        default:
          return this.createGenericQuestion(baseId, part, index, difficulty, timestamp);
      }
    } catch (error) {
      console.error(`❌ Error creating mock question for Part ${part}:`, error);
      // Fallback to generic question
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const baseId = `fallback_${part}_${index}_${randomSuffix}_${Date.now()}`;
      return this.createGenericQuestion(baseId, part, index, difficulty, timestamp);
    }
  }

  /**
   * Create Part 1 question (Photos)
   */
  private createPart1Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    const scenarios = [
      'People are having a meeting in a conference room.',
      'A woman is talking on the phone at her desk.',
      'Two people are shaking hands in an office.',
      'A man is giving a presentation to a group.',
      'People are eating lunch in a cafeteria.',
      'A woman is working at a computer.',
      'Two people are looking at documents together.',
      'A man is standing near a window.',
      'People are waiting in a reception area.',
      'A woman is organizing files in a cabinet.',
      'A man is using a photocopier.',
      'People are sitting around a table.',
      'A woman is writing on a whiteboard.',
      'Two people are looking at a computer screen.',
      'A man is carrying a briefcase.',
      'People are standing in a hallway.',
      'A woman is reading a newspaper.',
      'Two people are having a conversation.',
      'A man is looking at his watch.',
      'People are walking down stairs.'
    ];

    const question = scenarios[index % scenarios.length];
    const correctAnswer = 'A';
    
    return {
      id,
      part: 1,
      type: 'listening',
      question: 'Look at the picture. What do you see?',
      choices: [
        question,
        'The people are outside.',
        'The room is empty.',
        'Everyone is standing up.'
      ],
      correct_answer: correctAnswer,
      explanation: `This is a Part 1 listening question. The correct answer describes what is happening in the picture.`,
      audio_url: `/audio/part1_${index}.mp3`,
      image_url: `/images/part1_${index}.jpg`,
      difficulty,
      tags: ['photos', 'listening', 'part1'],
      created_at: timestamp
    };
  }

  /**
   * Create Part 2 question (Question-Response)
   */
  private createPart2Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    const questions = [
      'Where is the meeting room?',
      'When will the project be completed?',
      'Who is responsible for this task?',
      'How much does it cost?',
      'Why was the meeting cancelled?',
      'What time does the store close?',
      'Which department handles this?',
      'How often do you travel?',
      'Where can I find the restroom?',
      'When is the deadline?',
      'How long will it take?',
      'What\'s the weather like?',
      'Where did you buy this?',
      'How many people are coming?',
      'What\'s your phone number?',
      'When did you arrive?',
      'How far is the airport?',
      'What\'s the problem?',
      'Where are you going?',
      'How much time do we have?'
    ];

    const responses = [
      ['It\'s on the second floor.', 'Next to the elevator.', 'In the main building.', 'At 3 PM.'],
      ['By next Friday.', 'It\'s almost finished.', 'The manager knows.', 'About $500.'],
      ['The new employee.', 'I\'ll check with him.', 'In the morning.', 'It\'s very important.'],
      ['Around $50.', 'It\'s quite expensive.', 'I\'m not sure.', 'Yes, it is.'],
      ['Due to bad weather.', 'It was rescheduled.', 'The boss called.', 'At 2 PM.'],
      ['At 9 PM.', 'It\'s always busy.', 'On weekends.', 'Yes, it does.'],
      ['Human Resources.', 'I\'ll transfer you.', 'It\'s on hold.', 'No problem.'],
      ['Once a month.', 'By plane usually.', 'It\'s expensive.', 'Yes, I do.'],
      ['Down the hall.', 'It\'s occupied.', 'Next to the stairs.', 'Yes, there is.'],
      ['Tomorrow morning.', 'It\'s urgent.', 'The client called.', 'No, it isn\'t.'],
      ['About two hours.', 'It\'s not far.', 'I\'ll check the schedule.', 'Yes, we do.'],
      ['It\'s sunny today.', 'Very hot outside.', 'I love the rain.', 'No, it isn\'t.'],
      ['At the mall.', 'It was expensive.', 'Last week.', 'Yes, I did.'],
      ['About ten people.', 'It\'s a big group.', 'I\'ll count them.', 'No, they\'re not.'],
      ['555-1234.', 'It\'s in my phone.', 'I\'ll call you.', 'Yes, I have it.'],
      ['This morning.', 'By train.', 'It was delayed.', 'No, I didn\'t.'],
      ['About 30 minutes.', 'It\'s not far.', 'I\'ll drive you.', 'Yes, it is.'],
      ['The computer crashed.', 'I\'ll fix it.', 'It\'s working now.', 'No, there isn\'t.'],
      ['To the office.', 'I\'m running late.', 'It\'s on Main Street.', 'Yes, I am.'],
      ['About an hour.', 'It\'s not enough.', 'I\'ll hurry up.', 'No, we don\'t.']
    ];

    const questionIndex = index % questions.length;
    const correctAnswer = 'A';
    
    return {
      id,
      part: 2,
      type: 'listening',
      question: questions[questionIndex],
      choices: responses[questionIndex],
      correct_answer: correctAnswer,
      explanation: `This is a Part 2 listening question. Listen to the question and choose the most appropriate response.`,
      audio_url: `/audio/part2_${index}.mp3`,
      difficulty,
      tags: ['question-response', 'listening', 'part2'],
      created_at: timestamp
    };
  }

  /**
   * Create Part 3 question (Conversations)
   */
  private createPart3Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    const conversations = [
      {
        context: 'Two colleagues discussing a project deadline',
        question: 'What is the main concern?',
        choices: ['The deadline is too tight.', 'The budget is insufficient.', 'The team is too small.', 'The technology is outdated.']
      },
      {
        context: 'A customer service representative and a client',
        question: 'What does the customer want?',
        choices: ['A refund.', 'A replacement.', 'Technical support.', 'A discount.']
      },
      {
        context: 'Two friends planning a business trip',
        question: 'When are they leaving?',
        choices: ['Next Monday.', 'This Friday.', 'Next month.', 'In two weeks.']
      },
      {
        context: 'A manager and employee discussing performance',
        question: 'What is the manager\'s feedback?',
        choices: ['The work is excellent.', 'There are some issues.', 'More training is needed.', 'A promotion is coming.']
      },
      {
        context: 'Two coworkers talking about office supplies',
        question: 'What do they need to order?',
        choices: ['More paper.', 'New computers.', 'Office chairs.', 'Coffee supplies.']
      },
      {
        context: 'A client and consultant discussing a proposal',
        question: 'What is the client\'s main question?',
        choices: ['How much will it cost?', 'When can it start?', 'Who will do the work?', 'What are the benefits?']
      },
      {
        context: 'Two colleagues discussing a meeting',
        question: 'What time is the meeting?',
        choices: ['At 2 PM.', 'At 3 PM.', 'At 4 PM.', 'At 5 PM.']
      },
      {
        context: 'A customer and salesperson talking about a product',
        question: 'What is the customer asking about?',
        choices: ['The warranty.', 'The price.', 'The features.', 'The availability.']
      },
      {
        context: 'Two friends discussing weekend plans',
        question: 'What are they planning to do?',
        choices: ['Go to a movie.', 'Have dinner.', 'Visit a museum.', 'Go shopping.']
      },
      {
        context: 'A boss and employee discussing a project',
        question: 'What does the boss want?',
        choices: ['A progress report.', 'More details.', 'A meeting.', 'The final results.']
      }
    ];

    const convIndex = index % conversations.length;
    const correctAnswer = 'A';
    
    return {
      id,
      part: 3,
      type: 'listening',
      question: conversations[convIndex].question,
      choices: conversations[convIndex].choices,
      correct_answer: correctAnswer,
      explanation: `This is a Part 3 listening question. Listen to the conversation and answer the question.`,
      audio_url: `/audio/part3_${index}.mp3`,
      transcript: `Conversation ${index + 1}: ${conversations[convIndex].context}`,
      difficulty,
      tags: ['conversations', 'listening', 'part3'],
      created_at: timestamp
    };
  }

  /**
   * Create Part 4 question (Talks)
   */
  private createPart4Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    const talks = [
      {
        context: 'Airport announcement about flight delays',
        question: 'What should passengers do?',
        choices: ['Check the departure board.', 'Go to gate 12.', 'Contact customer service.', 'Wait in the lounge.']
      },
      {
        context: 'Company meeting about new policies',
        question: 'What is the main topic?',
        choices: ['New vacation policy.', 'Office relocation.', 'Salary increases.', 'Health benefits.']
      },
      {
        context: 'Weather forecast for the weekend',
        question: 'What weather is expected?',
        choices: ['Sunny and warm.', 'Rainy and cool.', 'Cloudy and mild.', 'Stormy and cold.']
      },
      {
        context: 'Restaurant special announcement',
        question: 'What is the special offer?',
        choices: ['50% off dinner.', 'Free dessert.', 'Buy one get one free.', 'Happy hour prices.']
      },
      {
        context: 'Museum tour information',
        question: 'What time does the tour start?',
        choices: ['At 10 AM.', 'At 11 AM.', 'At 2 PM.', 'At 3 PM.']
      },
      {
        context: 'Hotel check-in instructions',
        question: 'Where should guests go?',
        choices: ['To the front desk.', 'To their rooms.', 'To the restaurant.', 'To the parking lot.']
      },
      {
        context: 'Library announcement about books',
        question: 'What should people do?',
        choices: ['Return overdue books.', 'Check out new books.', 'Pay library fees.', 'Renew their cards.']
      },
      {
        context: 'Gym class schedule update',
        question: 'What class is cancelled?',
        choices: ['Yoga class.', 'Pilates class.', 'Zumba class.', 'Swimming class.']
      },
      {
        context: 'Store closing announcement',
        question: 'When does the store close?',
        choices: ['At 8 PM.', 'At 9 PM.', 'At 10 PM.', 'At 11 PM.']
      },
      {
        context: 'Conference presentation schedule',
        question: 'What is the next presentation about?',
        choices: ['Marketing strategies.', 'Financial planning.', 'Technology trends.', 'Customer service.']
      }
    ];

    const talkIndex = index % talks.length;
    const correctAnswer = 'A';
    
    return {
      id,
      part: 4,
      type: 'listening',
      question: talks[talkIndex].question,
      choices: talks[talkIndex].choices,
      correct_answer: correctAnswer,
      explanation: `This is a Part 4 listening question. Listen to the talk and answer the question.`,
      audio_url: `/audio/part4_${index}.mp3`,
      transcript: `Talk ${index + 1}: ${talks[talkIndex].context}`,
      difficulty,
      tags: ['talks', 'listening', 'part4'],
      created_at: timestamp
    };
  }

  /**
   * Create Part 5 question (Incomplete Sentences)
   */
  private createPart5Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    const sentences = [
      {
        sentence: 'The meeting will be held _____ 2 PM tomorrow.',
        choices: ['at', 'in', 'on', 'for'],
        correct: 'at'
      },
      {
        sentence: 'She _____ to the conference last week.',
        choices: ['goes', 'went', 'going', 'gone'],
        correct: 'went'
      },
      {
        sentence: 'The project _____ completed by next Friday.',
        choices: ['will be', 'will have', 'will do', 'will make'],
        correct: 'will be'
      },
      {
        sentence: 'Please _____ your report to the manager.',
        choices: ['submit', 'submits', 'submitting', 'submitted'],
        correct: 'submit'
      },
      {
        sentence: 'The company _____ its profits increased this year.',
        choices: ['announced', 'announce', 'announcing', 'announcement'],
        correct: 'announced'
      },
      {
        sentence: 'I need to _____ the documents before signing.',
        choices: ['review', 'reviews', 'reviewing', 'reviewed'],
        correct: 'review'
      },
      {
        sentence: 'The office is located _____ the city center.',
        choices: ['in', 'at', 'on', 'for'],
        correct: 'in'
      },
      {
        sentence: 'We _____ working on this project for months.',
        choices: ['have been', 'has been', 'are', 'were'],
        correct: 'have been'
      },
      {
        sentence: 'The new software is _____ than the old one.',
        choices: ['better', 'good', 'best', 'well'],
        correct: 'better'
      },
      {
        sentence: 'Please _____ me know if you have any questions.',
        choices: ['let', 'lets', 'letting', 'let\'s'],
        correct: 'let'
      },
      {
        sentence: 'The meeting was _____ than expected.',
        choices: ['longer', 'long', 'longest', 'longly'],
        correct: 'longer'
      },
      {
        sentence: 'I _____ to finish this by tomorrow.',
        choices: ['need', 'needs', 'needing', 'needed'],
        correct: 'need'
      },
      {
        sentence: 'The company has _____ many changes recently.',
        choices: ['made', 'make', 'making', 'makes'],
        correct: 'made'
      },
      {
        sentence: 'She is _____ for the position of manager.',
        choices: ['applying', 'apply', 'applies', 'applied'],
        correct: 'applying'
      },
      {
        sentence: 'The report should be _____ by Friday.',
        choices: ['completed', 'complete', 'completing', 'completes'],
        correct: 'completed'
      }
    ];

    const sentIndex = index % sentences.length;
    const correctAnswer = sentences[sentIndex].correct;
    
    return {
      id,
      part: 5,
      type: 'reading',
      question: sentences[sentIndex].sentence,
      choices: sentences[sentIndex].choices,
      correct_answer: correctAnswer,
      explanation: `This is a Part 5 reading question. Choose the word or phrase that best completes the sentence.`,
      difficulty,
      tags: ['grammar', 'reading', 'part5'],
      created_at: timestamp
    };
  }

  /**
   * Create Part 6 question (Text Completion)
   */
  private createPart6Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    const texts = [
      {
        text: 'Dear Mr. Johnson,\n\nThank you for your interest in our company. We have reviewed your application and would like to invite you for an interview. The interview will be held _____ our main office next Tuesday at 2 PM.',
        choices: ['at', 'in', 'on', 'for'],
        correct: 'at'
      },
      {
        text: 'The new software update includes several improvements. _____ these improvements, users will experience faster performance and better security features.',
        choices: ['With', 'By', 'Through', 'For'],
        correct: 'With'
      },
      {
        text: 'We are pleased to announce that our company has achieved record sales this quarter. _____ the previous quarter, we have seen a 25% increase in revenue.',
        choices: ['Compared to', 'Compared with', 'Comparing to', 'Comparing with'],
        correct: 'Compared to'
      },
      {
        text: 'The conference will be held in the Grand Ballroom _____ the main hotel. Please arrive 30 minutes early for registration.',
        choices: ['at', 'in', 'on', 'for'],
        correct: 'at'
      },
      {
        text: 'Our team has been working hard to complete the project on time. _____ everyone\'s efforts, we were able to meet the deadline.',
        choices: ['Thanks to', 'Thank you for', 'Thanks for', 'Thank to'],
        correct: 'Thanks to'
      }
    ];

    const textIndex = index % texts.length;
    const correctAnswer = texts[textIndex].correct;
    
    return {
      id,
      part: 6,
      type: 'reading',
      question: texts[textIndex].text,
      choices: texts[textIndex].choices,
      correct_answer: correctAnswer,
      explanation: `This is a Part 6 reading question. Read the text and choose the word or phrase that best completes the sentence.`,
      difficulty,
      tags: ['text-completion', 'reading', 'part6'],
      created_at: timestamp
    };
  }

  /**
   * Create Part 7 question (Reading Comprehension)
   */
  private createPart7Question(id: string, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    const passages = [
      {
        text: 'NOTICE\n\nDue to construction work, the parking lot will be closed from Monday, March 15th to Friday, March 19th. Alternative parking is available at the shopping center across the street. We apologize for any inconvenience.',
        question: 'What is the purpose of this notice?',
        choices: ['To inform about parking changes.', 'To announce new construction.', 'To advertise a shopping center.', 'To apologize for delays.'],
        correct: 'A'
      },
      {
        text: 'MEMO\n\nTo: All Staff\nFrom: Human Resources\nSubject: Health Insurance Update\n\nOur health insurance provider has updated their coverage options. Please review the attached documents and submit your selection by the end of this month.',
        question: 'What should staff do?',
        choices: ['Review insurance documents.', 'Contact Human Resources.', 'Update their information.', 'Submit medical claims.'],
        correct: 'A'
      },
      {
        text: 'EMAIL\n\nFrom: Sarah Johnson\nTo: Marketing Team\nSubject: Meeting Reschedule\n\nHi everyone,\n\nI need to reschedule our weekly meeting from Thursday to Friday due to a client presentation. The new time will be 2 PM in Conference Room B. Please let me know if you cannot attend.',
        question: 'Why was the meeting rescheduled?',
        choices: ['A client presentation.', 'Conference Room B is available.', 'Friday is better for everyone.', 'The team requested it.'],
        correct: 'A'
      },
      {
        text: 'RESTAURANT REVIEW\n\nI recently dined at The Garden Bistro and was impressed by the quality of food and service. The menu offers a variety of international dishes, and the prices are reasonable. The atmosphere is cozy and perfect for business meetings.',
        question: 'What does the reviewer think about the restaurant?',
        choices: ['It\'s expensive but good.', 'It\'s good value for money.', 'It\'s only good for business.', 'It has limited menu options.'],
        correct: 'B'
      },
      {
        text: 'JOB POSTING\n\nPosition: Marketing Coordinator\nLocation: New York\nRequirements: Bachelor\'s degree, 2 years experience, excellent communication skills\nSalary: $45,000 - $55,000\n\nPlease send your resume and cover letter to hr@company.com',
        question: 'What is required for this position?',
        choices: ['Master\'s degree.', '5 years experience.', 'Bachelor\'s degree.', 'Previous marketing experience.'],
        correct: 'C'
      }
    ];

    const passIndex = index % passages.length;
    const correctAnswer = passages[passIndex].correct;
    
    return {
      id,
      part: 7,
      type: 'reading',
      question: passages[passIndex].question,
      choices: passages[passIndex].choices,
      correct_answer: correctAnswer,
      explanation: `This is a Part 7 reading question. Read the passage and answer the question.`,
      difficulty,
      tags: ['reading-comprehension', 'reading', 'part7'],
      created_at: timestamp
    };
  }

  /**
   * Create generic question
   */
  private createGenericQuestion(id: string, part: number, index: number, difficulty: 'easy' | 'medium' | 'hard', timestamp: string): TOEICQuestion {
    return {
      id,
      part,
      type: part <= 4 ? 'listening' : 'reading',
      question: `Question ${index + 1} for Part ${part}`,
      choices: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer: 'A',
      explanation: `This is a sample question for Part ${part}.`,
      difficulty,
      tags: [`part${part}`, part <= 4 ? 'listening' : 'reading'],
      created_at: timestamp
    };
  }

  /**
   * Get failed questions for retry
   */
  private async getFailedQuestions(failedQuestionIds: string[]): Promise<TOEICQuestion[]> {
    try {
      const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .in('id', failedQuestionIds);

      if (error) throw error;

      return questions?.map(q => this.convertQuestionToTOEICQuestion(q, q.type === 'listening' ? 1 : 5)) || [];
    } catch (error) {
      console.error('Error fetching failed questions:', error);
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

export const toeicQuestionGenerator = new TOEICQuestionGenerator();