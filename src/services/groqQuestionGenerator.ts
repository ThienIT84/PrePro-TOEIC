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
    console.log('🔍 DEBUG: Groq generatePart7Questions started');
    
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Groq API key not configured. Get free API key at https://console.groq.com/'
      };
    }

    try {
      const prompt = this.buildPart7Prompt(request);
      
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
              content: 'TOEIC Part 7 creator. Return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 3000, // Increased for Part 7
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 429) {
          const errorData = JSON.parse(errorText);
          const retryAfter = errorData.error?.retry_after || 15;
          throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
        }
        
        throw new Error(`Groq API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content;

      if (!generatedText) {
        throw new Error('No response from Groq');
      }

      const result = this.parsePart7Response(generatedText);
      
      return {
        success: true,
        passages: result.passages,
        questions: result.questions
      };

    } catch (error) {
      console.error('Error generating Part 7 questions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
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
    console.log('🔍 DEBUG: Groq generatePart6Questions started');
    
    if (!this.apiKey) {
      return {
        success: false,
        error: 'Groq API key not configured. Get free API key at https://console.groq.com/'
      };
    }

    try {
      const prompt = this.buildPart6Prompt(request);
      
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
              content: 'TOEIC Part 6 creator. Return valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000, // Reduced from 4000 to save tokens
          top_p: 0.9
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Check for rate limit error
        if (response.status === 429) {
          const errorData = JSON.parse(errorText);
          const retryAfter = errorData.error?.retry_after || 15;
          throw new Error(`Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`);
        }
        
        throw new Error(`Groq API error: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content;

      if (!generatedText) {
        throw new Error('No response from Groq');
      }

      const result = this.parsePart6Response(generatedText);
      
      return {
        success: true,
        passage: result.passage,
        questions: result.questions
      };

    } catch (error) {
      console.error('Error generating Part 6 questions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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
      vocab: 'TOEIC-style vocabulary questions focusing on business and workplace contexts',
      grammar: 'TOEIC-style grammar questions with business and workplace contexts',
      listening: 'TOEIC-style listening comprehension questions based on audio transcript (create realistic workplace scenarios)',
      reading: 'TOEIC-style reading comprehension questions suitable for Part 5 (Incomplete Sentences) only',
      mix: 'mixed TOEIC-style questions (vocabulary, grammar, reading) with business contexts'
    };

    const difficultyInstructions = {
      easy: 'basic level suitable for beginners (400-500 TOEIC score)',
      medium: 'intermediate level suitable for intermediate learners (500-700 TOEIC score)',
      hard: 'advanced level suitable for advanced learners (700+ TOEIC score)'
    };

    return `You are an expert TOEIC test creator. Create EXACTLY ${questionCount} authentic TOEIC-style questions.

Content to base questions on:
"${content}"

Create ${questionCount} TOEIC ${typeInstructions[type]} at ${difficultyInstructions[difficulty]} level.

TOEIC FORMAT REQUIREMENTS:
1. You MUST create EXACTLY ${questionCount} questions
2. Each question must have exactly 4 multiple choice options (A, B, C, D)
3. Only one correct answer per question
4. Questions must be in AUTHENTIC TOEIC format
5. Focus on BUSINESS and WORKPLACE contexts
6. Test practical English skills used in professional environments
7. Use realistic business vocabulary and situations
8. Questions should be similar to actual TOEIC test questions
9. Each question must be unique and different from others
10. Cover different aspects of the content for variety

${type === 'vocab' ? `
VOCABULARY QUESTIONS (Part 5 style):
- Focus on business vocabulary, phrasal verbs, word forms
- Test understanding of workplace terminology
- Include context clues in the sentence
- Use realistic business scenarios` : ''}

${type === 'grammar' ? `
GRAMMAR QUESTIONS (Part 5 style):
- Focus on tenses, prepositions, conjunctions, articles
- Test understanding of sentence structure
- Use business and workplace contexts
- Include realistic professional situations` : ''}

${type === 'listening' ? `
LISTENING QUESTIONS (Part 2, 3, 4 style):
- Create realistic workplace conversations
- Include business meetings, phone calls, announcements
- Test comprehension of main ideas, details, and implications
- Use natural, conversational language
- Focus on professional communication` : ''}

${type === 'reading' ? `
READING QUESTIONS (Part 5 style - Incomplete Sentences):
- Create sentences with business and workplace contexts
- Focus on grammar, vocabulary, and sentence completion
- Use realistic professional scenarios
- Test understanding of business English` : ''}

EXAMPLE OUTPUT FORMAT (JSON):
${type === 'vocab' ? `{
  "questions": [
    {
      "question": "The compunknown's quarterly report shows a significant _____ in sales compared to last year.",
      "choices": ["increase", "increasing", "increased", "increases"],
      "answer": "A",
      "explain_vi": "Câu cần danh từ để hoàn thành cấu trúc 'a significant + noun'. 'Increase' là danh từ phù hợp.",
      "explain_en": "The sentence needs a noun to complete 'a significant + noun' structure. 'Increase' is the correct noun form.",
      "tags": ["vocabulary", "word-forms", "business"]
    }
  ]
}` : type === 'grammar' ? `{
  "questions": [
    {
      "question": "The meeting has been postponed _____ next Monday due to the CEO's schedule.",
      "choices": ["until", "for", "since", "during"],
      "answer": "A",
      "explain_vi": "'Until' được dùng để chỉ thời điểm kết thúc của một hành động. 'Postponed until' có nghĩa là hoãn đến khi nào.",
      "explain_en": "'Until' is used to indicate the end point of an action. 'Postponed until' means delayed to a specific time.",
      "tags": ["grammar", "prepositions", "business"]
    }
  ]
}` : type === 'listening' ? `{
  "questions": [
    {
      "question": "What does the woman suggest the man should do?",
      "choices": ["Call the manager", "Check the schedule", "Wait for confirmation", "Cancel the appointment"],
      "answer": "B",
      "explain_vi": "Người phụ nữ gợi ý người đàn ông nên kiểm tra lịch trình trước khi xác nhận cuộc hẹn.",
      "explain_en": "The woman suggests the man should check the schedule before confirming the appointment.",
      "tags": ["conversation", "suggestion", "appointment"]
    }
  ]
}` : `{
  "questions": [
    {
      "question": "The new software update includes several improvements _____ user experience.",
      "choices": ["to", "for", "with", "in"],
      "answer": "A",
      "explain_vi": "'Improvements to' là cấu trúc đúng khi nói về cải thiện điều gì đó.",
      "explain_en": "'Improvements to' is the correct structure when talking about improving something.",
      "tags": ["grammar", "prepositions", "business"]
    }
  ]
}`}

CRITICAL: Return ONLY the JSON object with EXACTLY ${questionCount} questions. No additional text before or after the JSON.

Language preference: ${language === 'vi' ? 'Vietnamese explanations should be detailed, English explanations should be concise' : 'English explanations should be detailed, Vietnamese explanations should be concise'}`;
  }

  /**
   * Build prompt for Part 7
   */
  private buildPart7Prompt(request: QuestionGenerationRequest & { passageCount?: number }): string {
    const { content, difficulty, questionCount, language, passageCount = 1 } = request;
    
    console.log('🔍 DEBUG: buildPart7Prompt passageCount:', passageCount);
    
    const difficultyInstructions = {
      easy: 'basic level suitable for beginners (400-500 TOEIC score)',
      medium: 'intermediate level suitable for intermediate learners (500-700 TOEIC score)',
      hard: 'advanced level suitable for advanced learners (700+ TOEIC score)'
    };

    const passageTypes = ['email', 'article', 'advertisement', 'notice', 'memo', 'letter'];
    const selectedTypes = passageTypes.slice(0, passageCount);

    return `Create TOEIC Part 7 reading comprehension with ${passageCount} passage(s) and ${questionCount} questions.

IMPORTANT: This is Part 7 (Reading Comprehension), NOT Part 6 (Text Completion).
Part 7 has complete passages with NO blanks or missing words.
Part 7 tests reading comprehension skills, not grammar/vocabulary filling.

Content: "${content}"
Level: ${difficultyInstructions[difficulty]}
Passage Types: ${selectedTypes.join(', ')}

REQUIREMENTS FOR PART 7:
- ${passageCount} passage(s) with business context
- Passages should be related to each other (same topic/theme)
- Each passage should have different type (email, article, memo, etc.)
- ${questionCount} multiple choice questions
- Questions test: Main idea, Detail, Inference, Vocabulary, Purpose
- Professional business language
- Realistic workplace scenarios
- Passages can be read independently or linked together
- Each passage 150-300 words
- NO BLANKS OR MISSING WORDS (this is Part 7, not Part 6)

EXAMPLE FOR PART 7 (NO BLANKS):
{
  "passages": [
    {
      "content": "Subject: Quarterly Meeting Reminder\n\nDear Team,\n\nThis is a reminder that our quarterly meeting will be held on Friday, March 15th at 2:00 PM in the main conference room. Please prepare your department reports and bring any questions or concerns you may have. We will be discussing our Q1 performance and Q2 objectives.\n\nBest regards,\nSarah Johnson\nHR Manager",
      "type": "email",
      "title": "Quarterly Meeting Reminder"
    },
    {
      "content": "NOTICE\n\nConference Room Reservation\n\nDue to the quarterly meeting scheduled for March 15th, the main conference room will be unavailable from 1:30 PM to 4:00 PM. Please make alternative arrangements for any meetings during this time. The room will be available again starting March 16th.\n\nThank you for your understanding.\n\nFacilities Management",
      "type": "notice",
      "title": "Conference Room Notice"
    }
  ],
  "questions": [
    {
      "question": "What is the main purpose of the email?",
      "choices": ["To cancel a meeting", "To remind about a meeting", "To reschedule a meeting", "To introduce new staff"],
      "answer": "B",
      "explain_vi": "Email chính là để nhắc nhở về cuộc họp quý",
      "explain_en": "The email's main purpose is to remind about the quarterly meeting",
      "tags": ["main idea", "email", "business"]
    },
    {
      "question": "According to the notice, when will the conference room be unavailable?",
      "choices": ["March 14th", "March 15th from 1:30-4:00 PM", "March 16th", "All day March 15th"],
      "answer": "B",
      "explain_vi": "Thông báo nói rằng phòng họp sẽ không có sẵn từ 1:30-4:00 PM ngày 15/3",
      "explain_en": "The notice states the room will be unavailable March 15th from 1:30-4:00 PM",
      "tags": ["detail", "notice", "business"]
    },
    {
      "question": "What can be inferred about the compunknown's meeting culture?",
      "choices": ["Meetings are informal", "Meetings require preparation", "Meetings are optional", "Meetings are rare"],
      "answer": "B",
      "explain_vi": "Có thể suy ra rằng công ty có văn hóa họp hành yêu cầu chuẩn bị (department reports)",
      "explain_en": "It can be inferred that the compunknown has a meeting culture requiring preparation (department reports)",
      "tags": ["inference", "business", "culture"]
    }
  ]
}

CRITICAL FOR PART 7: 
- Return ONLY valid JSON object
- Passages must be realistic business documents
- Questions must be clear and testable
- NO BLANKS OR MISSING WORDS (this is Part 7, not Part 6)
- Ensure JSON is properly closed with matching braces
- Complete all arrays and objects properly
- No extra characters before or after JSON
- Passages should be complete and readable`;

  }

  /**
   * Build prompt for Part 6
   */
  private buildPart6Prompt(request: QuestionGenerationRequest): string {
    const { content, difficulty, questionCount, language } = request;
    
    const difficultyInstructions = {
      easy: 'basic level suitable for beginners (400-500 TOEIC score)',
      medium: 'intermediate level suitable for intermediate learners (500-700 TOEIC score)',
      hard: 'advanced level suitable for advanced learners (700+ TOEIC score)'
    };

    return `Create TOEIC Part 6 passage with 4 blanks and choices.

Content: "${content}"
Level: ${difficultyInstructions[difficulty]}

REQUIREMENTS:
- 4 blanks marked as _____
- 4 choices (A,B,C,D) per blank
- Business context
- Grammar/vocabulary focus

TEMPLATE FORMAT:
1. Loại văn bản: Report/Email/Memo/Letter
2. Chủ đề: Business context
3. Cấu trúc: 4 đoạn văn, 4 chỗ trống
4. Chỗ trống 1: Preposition/Time expression
5. Chỗ trống 2: Conjunction/Reason expression  
6. Chỗ trống 3: Verb/Phrase expression
7. Chỗ trống 4: Adjective/Adverb expression

Yêu cầu:
- Ngữ cảnh kinh doanh thực tế
- Ngôn ngữ trang trọng, chuyên nghiệp
- 4 chỗ trống được đánh số 1, 2, 3, 4
- Mỗi chỗ trống test một kỹ năng khác nhau
- Passage dài 200-250 từ
- Phải đánh dấu 4 blank_text trong đoạn văn

EXAMPLE:
{
  "passage": {
    "content": "Dear Team,\n\nWe will hold the meeting _____ our office tomorrow. _____ the recent changes, we need to discuss new policies. Please arrive on time and bring your notes.\n\nBest regards,\nManager",
    "blanks": [1, 2, 3, 4]
  },
  "answers": [
    {
      "blank_index": 1,
      "choices": ["at", "in", "on", "for"],
      "answer": "A",
      "explain_vi": "At + địa điểm cụ thể",
      "explain_en": "At + specific location",
      "tags": ["preposition", "location"]
    },
    {
      "blank_index": 2,
      "choices": ["Due to", "Because", "Thanks to", "In spite of"],
      "answer": "A",
      "explain_vi": "Due to + nguyên nhân",
      "explain_en": "Due to + reason",
      "tags": ["conjunction", "reason"]
    }
  ]
}

CRITICAL: 
- Return ONLY valid JSON object
- The passage must have exactly 4 blanks marked as _____
- Escape all special characters in strings (newlines as \\n, quotes as \\")
- No trailing commas
- No control characters in strings
- Example: "content": "Line 1\\nLine 2\\nLine 3"`;

  }

  /**
   * Parse Part 7 response
   */
  private parsePart7Response(text: string): {
    passages: Array<{
      content: string;
      type: string;
      title?: string;
    }>;
    questions: GeneratedQuestion[];
  } {
    try {
      let cleanText = text.trim();
      
      // Remove markdown code blocks
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Find JSON object - handle cases with extra braces
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      let jsonText = jsonMatch[0];
      
      // Fix common issues with extra braces at the beginning
      if (jsonText.startsWith('{{')) {
        jsonText = jsonText.substring(1); // Remove extra opening brace
      }
      
      // Ensure JSON is properly closed
      if (!jsonText.endsWith('}')) {
        // Try to find the last complete object
        const lastBraceIndex = jsonText.lastIndexOf('}');
        if (lastBraceIndex > 0) {
          jsonText = jsonText.substring(0, lastBraceIndex + 1);
        }
      }
      
      // Pre-process content strings to handle newlines properly
      jsonText = jsonText.replace(/"content":\s*"([^"]*(?:\n[^"]*)*)"/g, (match, content) => {
        // Escape newlines, quotes, and other special characters
        const escapedContent = content
          .replace(/\\/g, '\\\\')  // Escape backslashes first
          .replace(/"/g, '\\"')    // Escape quotes
          .replace(/\n/g, '\\n')   // Escape newlines
          .replace(/\r/g, '\\r')   // Escape carriage returns
          .replace(/\t/g, '\\t');  // Escape tabs
        return `"content": "${escapedContent}"`;
      });
      
      // Debug: Log the JSON text before parsing
      console.log('🔍 DEBUG: Part 7 JSON text before parsing:', jsonText.substring(0, 200) + '...');
      
      // Try to parse JSON directly first
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
        console.log('✅ DEBUG: Part 7 JSON parsed successfully');
      } catch (jsonError) {
        console.warn('Part 7 JSON parse failed, attempting to fix...', jsonError);
        
        // Try to fix common JSON issues
        try {
          let fixedJson = jsonText
            .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
            .replace(/([{\[,])\s*([}\]])/g, '$1$2')  // Remove empty objects/arrays
            .replace(/"([^"]*)\n([^"]*)"/g, '"$1\\n$2"')  // Escape newlines in strings
            .replace(/"([^"]*)\r([^"]*)"/g, '"$1\\r$2"')  // Escape carriage returns in strings
            .replace(/"([^"]*)\t([^"]*)"/g, '"$1\\t$2"');  // Escape tabs in strings
          
          // Try to complete incomplete JSON
          if (!fixedJson.endsWith('}')) {
            // Count opening and closing braces
            const openBraces = (fixedJson.match(/\{/g) || []).length;
            const closeBraces = (fixedJson.match(/\}/g) || []).length;
            const missingBraces = openBraces - closeBraces;
            
            if (missingBraces > 0) {
              fixedJson += '}'.repeat(missingBraces);
            }
          }
          
          // Try to complete incomplete arrays
          if (fixedJson.includes('"passages": [') && !fixedJson.includes(']')) {
            const lastCommaIndex = fixedJson.lastIndexOf(',');
            if (lastCommaIndex > 0) {
              fixedJson = fixedJson.substring(0, lastCommaIndex) + ']';
            }
          }
          
          // Additional fix for newlines in content strings
          fixedJson = fixedJson
            .replace(/"content":\s*"([^"]*(?:\\n[^"]*)*)"/g, (match, content) => {
              // Properly escape newlines in content
              const escapedContent = content
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
              return `"content": "${escapedContent}"`;
            });
          
          console.log('🔍 DEBUG: Part 7 Fixed JSON:', fixedJson.substring(0, 200) + '...');
          parsed = JSON.parse(fixedJson);
          console.log('✅ DEBUG: Part 7 JSON parsed after fixing');
        } catch (fixError) {
          console.error('Part 7 JSON parse failed after fixing:', fixError);
          
          // Last resort: try to extract data manually
          try {
            console.log('🔍 DEBUG: Attempting manual extraction...');
            
            // Extract passages manually
            const passagesMatch = jsonText.match(/"passages":\s*\[([\s\S]*?)\]/);
            const questionsMatch = jsonText.match(/"questions":\s*\[([\s\S]*?)\]/);
            
            if (passagesMatch && questionsMatch) {
              // Create a minimal valid JSON structure
              const minimalJson = `{
                "passages": [
                  {
                    "content": "Error: Could not parse AI response properly. Please try again.",
                    "type": "error",
                    "title": "Parse Error"
                  }
                ],
                "questions": [
                  {
                    "question": "What is the main issue?",
                    "choices": ["Parse error", "Network error", "Server error", "Unknown error"],
                    "answer": "A",
                    "explain_vi": "Có lỗi khi parse JSON response từ AI",
                    "explain_en": "There was an error parsing JSON response from AI",
                    "tags": ["error", "parsing"]
                  }
                ]
              }`;
              
              parsed = JSON.parse(minimalJson);
              console.log('✅ DEBUG: Part 7 JSON parsed with fallback');
            } else {
              throw new Error('Could not extract passages or questions from response');
            }
          } catch (manualError) {
            console.error('Manual extraction failed:', manualError);
            throw new Error('Invalid JSON format from AI response');
          }
        }
      }
      
      if (!parsed.passages || !parsed.questions) {
        throw new Error('Invalid response format');
      }

      return {
        passages: parsed.passages.map((p: unknown) => ({
          content: p.content || '',
          type: p.type || 'email',
          title: p.title || ''
        })),
        questions: parsed.questions.map((q: unknown, index: number) => ({
          question: q.question || `Question ${index + 1}`,
          choices: Array.isArray(q.choices) ? q.choices : ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: q.answer || 'A',
          explain_vi: q.explain_vi || 'Giải thích không có sẵn',
          explain_en: q.explain_en || 'Explanation not available',
          tags: Array.isArray(q.tags) ? q.tags : ['generated', 'part7']
        }))
      };

    } catch (error) {
      console.error('Error parsing Part 7 response:', error);
      console.error('Raw text:', text);
      
      // Return fallback data
      return {
        passages: [{ content: 'Error: Could not parse AI response. Please try again.', type: 'email', title: 'Error' }],
        questions: []
      };
    }
  }

  /**
   * Parse Part 6 response
   */
  private parsePart6Response(text: string): {
    passage: { content: string; blanks: number[] };
    questions: GeneratedQuestion[];
  } {
    try {
      let cleanText = text.trim();
      
      // Remove markdown code blocks
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\s*/, '').replace(/```\s*$/, '');
      }
      
      // Find JSON object with better regex
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      let jsonText = jsonMatch[0];
      
      // Debug: Log the JSON text before parsing
      console.log('🔍 DEBUG: JSON text before parsing:', jsonText.substring(0, 200) + '...');
      
      // Try to parse JSON directly first
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
        console.log('✅ DEBUG: JSON parsed successfully');
      } catch (jsonError) {
        console.warn('JSON parse failed, attempting to fix...', jsonError);
        console.log('🔍 DEBUG: JSON error at position:', jsonError.message);
        
        // Try to fix common JSON issues
        try {
          // Fix common issues that might cause parsing errors
          let fixedJson = jsonText
            .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
            .replace(/([{\[,])\s*([}\]])/g, '$1$2')  // Remove empty objects/arrays
            .replace(/"([^"]*)\n([^"]*)"/g, '"$1\\n$2"')  // Escape newlines in strings
            .replace(/"([^"]*)\r([^"]*)"/g, '"$1\\r$2"')  // Escape carriage returns in strings
            .replace(/"([^"]*)\t([^"]*)"/g, '"$1\\t$2"');  // Escape tabs in strings
          
          console.log('🔍 DEBUG: Fixed JSON:', fixedJson.substring(0, 200) + '...');
          parsed = JSON.parse(fixedJson);
          console.log('✅ DEBUG: JSON parsed after fixing');
        } catch (fixError) {
          console.error('JSON parse failed after fixing:', fixError);
          throw new Error('Invalid JSON format from AI response');
        }
      }
      
      if (!parsed.passage || !parsed.answers) {
        throw new Error('Invalid response format');
      }

      return {
        passage: {
          content: parsed.passage.content || '',
          blanks: parsed.passage.blanks || [1, 2, 3, 4]
        },
        questions: parsed.answers.map((a: unknown, index: number) => ({
          question: `Blank ${a.blank_index || index + 1}`,
          choices: Array.isArray(a.choices) ? a.choices : ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: a.answer || 'A',
          explain_vi: a.explain_vi || 'Giải thích không có sẵn',
          explain_en: a.explain_en || 'Explanation not available',
          tags: Array.isArray(a.tags) ? a.tags : ['generated', 'part6']
        }))
      };

    } catch (error) {
      console.error('Error parsing Part 6 response:', error);
      console.error('Raw text:', text);
      
      // Return fallback data
      return {
        passage: { 
          content: 'Error: Could not parse AI response. Please try again.', 
          blanks: [1, 2, 3, 4] 
        },
        questions: []
      };
    }
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

      return parsed.questions.map((q: unknown, index: number) => ({
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
