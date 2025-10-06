/**
 * BulkUploadController
 * Business logic cho TOEIC Bulk Upload
 * Extracted từ TOEICBulkUpload.tsx
 */

import { QuestionService } from '@/services/domains/question/QuestionService';
import { usesIndividualAudio, usesPassageAudio } from '@/utils/audioUtils';
import * as XLSX from 'xlsx';

export interface TOEICQuestion {
  id?: string;
  part: number; // TOEIC Part (1-7)
  prompt_text: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  correct_choice: string;
  explain_vi: string;
  explain_en: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'draft' | 'published' | 'archived';
  passage_id?: string;
  passage_title?: string;
  passage_content?: string;
  blank_index?: number;
  audio_url?: string;
  transcript?: string;
  image_url?: string;
  validation_status: 'pending' | 'valid' | 'invalid' | 'imported';
  errors?: string[];
}

export interface TOEICPassage {
  part: number;
  passage_type: 'single' | 'double' | 'triple';
  title: string;
  content: string;
  additional?: string;
  audio_url?: string;
  topic?: string;
  word_count?: number;
}

export interface BulkUploadState {
  questions: TOEICQuestion[];
  passages: TOEICPassage[];
  loading: boolean;
  importing: boolean;
  progress: number;
  errors: string[];
}

export class BulkUploadController {
  private questionService: QuestionService;
  private state: BulkUploadState;
  private listeners: Array<(state: BulkUploadState) => void> = [];

  constructor() {
    this.questionService = new QuestionService();
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): BulkUploadState {
    return {
      questions: [],
      passages: [],
      loading: false,
      importing: false,
      progress: 0,
      errors: [],
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: BulkUploadState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Update state
   */
  private setState(updates: Partial<BulkUploadState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): BulkUploadState {
    return { ...this.state };
  }

  /**
   * Get TOEIC part information
   */
  public getToeicPartInfo() {
    return {
      1: { name: 'Photos', description: 'Mô tả hình ảnh', type: 'listening', count: 6 },
      2: { name: 'Question-Response', description: 'Hỏi đáp ngắn', type: 'listening', count: 25 },
      3: { name: 'Conversations', description: 'Hội thoại ngắn', type: 'listening', count: 39 },
      4: { name: 'Talks', description: 'Bài nói dài', type: 'listening', count: 30 },
      5: { name: 'Incomplete Sentences', description: 'Hoàn thành câu', type: 'reading', count: 30 },
      6: { name: 'Text Completion', description: 'Hoàn thành đoạn văn', type: 'reading', count: 16 },
      7: { name: 'Reading Comprehension', description: 'Đọc hiểu', type: 'reading', count: 54 }
    };
  }

  /**
   * Generate template data for Excel download
   */
  public generateTemplateData(): any[] {
    return [
      // ===== PART 1: PHOTOS (LISTENING) =====
      {
        part: 1,
        prompt_text: '', // Part 1 không cần prompt_text
        choiceA: 'A man is reading a book', // Tùy chọn - có thể để trống
        choiceB: 'A woman is cooking dinner', // Tùy chọn - có thể để trống
        choiceC: 'A child is playing with toys', // Tùy chọn - có thể để trống
        choiceD: 'A dog is sleeping on the couch', // Tùy chọn - có thể để trống
        correct_choice: 'A',
        explain_vi: 'Trong hình, một người đàn ông đang đọc sách.',
        explain_en: 'In the picture, a man is reading a book.',
        tags: 'photos,listening,part1',
        difficulty: 'easy',
        status: 'published',
        image_url: 'https://example.com/image1.jpg', // Tùy chọn
        audio_url: 'https://example.com/audio1.mp3' // Tùy chọn
      },

      // ===== PART 2: QUESTION-RESPONSE (LISTENING) =====
      {
        part: 2,
        prompt_text: '', // Tùy chọn - có thể để trống
        choiceA: 'It\'s on the second floor', // Tùy chọn - có thể để trống
        choiceB: 'Yes, I can help you', // Tùy chọn - có thể để trống
        choiceC: 'The meeting starts at 3 PM', // Tùy chọn - có thể để trống
        choiceD: '', // Part 2 không cần choice D
        correct_choice: 'A',
        explain_vi: 'Câu trả lời phù hợp nhất cho câu hỏi về vị trí.',
        explain_en: 'The most appropriate response to a location question.',
        tags: 'question-response,listening,part2',
        difficulty: 'easy',
        status: 'published',
        audio_url: 'https://example.com/audio2.mp3', // Khuyến khích
        image_url: '' // Part 2 không cần image
      },

      // ===== PART 3: CONVERSATIONS (LISTENING) =====
      {
        part: 3,
        prompt_text: 'What are the speakers discussing?',
        choiceA: 'A business proposal',
        choiceB: 'A vacation plan',
        choiceC: 'A new product launch',
        choiceD: 'A job interview',
        correct_choice: 'A',
        explain_vi: 'Người nói đang thảo luận về đề xuất kinh doanh.',
        explain_en: 'The speakers are discussing a business proposal.',
        tags: 'conversations,listening,part3',
        difficulty: 'medium',
        status: 'published',
        passage_id: '67272638-1f31-477c-a351-a354fda9581b', // UUID của passage đã có
        audio_url: 'https://example.com/conversation1.mp3' // Tùy chọn
      },

      // ===== PART 4: TALKS (LISTENING) =====
      {
        part: 4,
        prompt_text: 'What is the main topic of the announcement?',
        choiceA: 'New company policies',
        choiceB: 'Upcoming training sessions',
        choiceC: 'Office renovation plans',
        choiceD: 'Employee benefits update',
        correct_choice: 'B',
        explain_vi: 'Thông báo chính về các buổi đào tạo sắp tới.',
        explain_en: 'The main topic is about upcoming training sessions.',
        tags: 'talks,listening,part4',
        difficulty: 'easy',
        status: 'published',
        passage_id: 'a55bf808-26bc-405e-b3c4-3b4672e1dce5', // UUID của passage đã có
        audio_url: 'https://example.com/talk1.mp3' // Tùy chọn
      },

      // ===== PART 5: INCOMPLETE SENTENCES (READING) =====
      {
        part: 5,
        prompt_text: 'The meeting _____ postponed until next week.',
        choiceA: 'has been',
        choiceB: 'will be',
        choiceC: 'is being',
        choiceD: 'was',
        correct_choice: 'A',
        explain_vi: 'Câu này cần thì hiện tại hoàn thành bị động.',
        explain_en: 'This sentence needs present perfect passive tense.',
        tags: 'grammar,reading,part5',
        difficulty: 'medium',
        status: 'published'
      },

      // ===== PART 6: TEXT COMPLETION (READING) =====
      {
        part: 6,
        prompt_text: 'What is the best word to fill in the first blank?',
        choiceA: 'Our',
        choiceB: 'Their',
        choiceC: 'Its',
        choiceD: 'Your',
        correct_choice: 'A',
        explain_vi: 'Chỗ trống đầu tiên cần đại từ sở hữu "Our" để chỉ công ty đang nói.',
        explain_en: 'The first blank needs possessive pronoun "Our" to refer to the company speaking.',
        tags: 'text-completion,reading,part6',
        difficulty: 'medium',
        status: 'published',
        blank_index: 1,
        passage_title: 'Company Newsletter',
        passage_content: 'Dear Employees, We are pleased to announce that _____ company has achieved record sales this quarter. _____ we continue to grow, we are looking for talented individuals to join our team.'
      },

      // ===== PART 7: READING COMPREHENSION (READING) =====
      {
        part: 7,
        prompt_text: 'According to the passage, what is the main purpose of the company?',
        choiceA: 'To increase profits',
        choiceB: 'To provide quality service',
        choiceC: 'To expand globally',
        choiceD: 'To reduce costs',
        correct_choice: 'B',
        explain_vi: 'Theo đoạn văn, mục đích chính của công ty là cung cấp dịch vụ chất lượng.',
        explain_en: 'According to the passage, the main purpose of the company is to provide quality service.',
        tags: 'reading,comprehension,part7',
        difficulty: 'easy',
        status: 'published',
        passage_title: 'Company Mission',
        passage_content: 'TechCorp is committed to providing exceptional customer service and innovative solutions. Our mission is to help businesses grow through technology while maintaining the highest standards of quality and reliability.'
      }
    ];
  }

  /**
   * Download template Excel file
   */
  public downloadTemplate(): void {
    const templateData = this.generateTemplateData();
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TOEIC Questions');
    XLSX.writeFile(wb, 'toeic_questions_template.xlsx');
  }

  /**
   * Process uploaded Excel file
   */
  public async processFile(file: File): Promise<{ success: boolean; error?: string }> {
    try {
      this.setState({ loading: true, questions: [], errors: [] });

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const parsedQuestions: TOEICQuestion[] = jsonData.map((row: any, index: number) => {
        const question: TOEICQuestion = {
          part: parseInt(row.part) || 1,
          prompt_text: row.prompt_text || row.question_text || '',
          choiceA: row.choiceA || '',
          choiceB: row.choiceB || '',
          choiceC: row.choiceC || '',
          choiceD: row.choiceD || '',
          correct_choice: row.correct_choice || row.answer || 'A',
          explain_vi: row.explain_vi || '',
          explain_en: row.explain_en || '',
          tags: row.tags ? row.tags.split(',').map((t: string) => t.trim()) : [],
          difficulty: row.difficulty || 'medium',
          status: row.status || 'draft',
          passage_id: row.passage_id || undefined,
          passage_title: row.passage_title || undefined,
          passage_content: row.passage_content || undefined,
          blank_index: row.blank_index ? parseInt(row.blank_index) : undefined,
          audio_url: row.audio_url || '',
          transcript: row.transcript || '',
          image_url: row.image_url || '',
          validation_status: 'pending',
          errors: []
        };

        // Validate question
        const errors = this.validateQuestion(question);
        question.errors = errors;
        question.validation_status = errors.length === 0 ? 'valid' : 'invalid';

        return question;
      });

      this.setState({ questions: parsedQuestions });

      const validCount = parsedQuestions.filter(q => q.validation_status === 'valid').length;
      const invalidCount = parsedQuestions.filter(q => q.validation_status === 'invalid').length;

      return {
        success: true,
        error: `${validCount} valid questions, ${invalidCount} invalid questions`
      };

    } catch (error) {
      console.error('Error processing file:', error);
      return {
        success: false,
        error: 'Failed to process Excel file'
      };
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Validate a single question
   */
  public validateQuestion(question: TOEICQuestion): string[] {
    const errors: string[] = [];

    // Part 1 and Part 2 don't require prompt_text
    if (question.part !== 1 && question.part !== 2 && !question.prompt_text.trim()) {
      errors.push('Prompt text is required for parts 3-7');
    }

    // Part 1 and Part 2 choices are optional, other parts require at least A and B
    if (question.part !== 1 && question.part !== 2) {
      if (!question.choiceA.trim() || !question.choiceB.trim()) {
        errors.push('At least choices A and B are required for parts 3-7');
      }
    }

    // Validate correct choice based on part
    if (question.part === 2) {
      if (!['A', 'B', 'C'].includes(question.correct_choice.toUpperCase())) {
        errors.push('Part 2 correct choice must be A, B, or C');
      }
    } else {
      if (!['A', 'B', 'C', 'D'].includes(question.correct_choice.toUpperCase())) {
        errors.push('Correct choice must be A, B, C, or D');
      }
    }

    if (question.part < 1 || question.part > 7) {
      errors.push('Part must be between 1 and 7');
    }

    if (!['easy', 'medium', 'hard'].includes(question.difficulty)) {
      errors.push('Difficulty must be easy, medium, or hard');
    }

    if (!['draft', 'published', 'archived'].includes(question.status)) {
      errors.push('Status must be draft, published, or archived');
    }

    // Validate part-specific requirements
    if ([3, 4, 6, 7].includes(question.part) && !question.passage_id) {
      errors.push(`Part ${question.part} requires a valid passage_id`);
    }

    if (question.part === 6 && !question.blank_index) {
      errors.push('Part 6 requires blank_index (1-4)');
    }

    return errors;
  }

  /**
   * Import questions to database
   */
  public async importQuestions(userId: string): Promise<{ success: boolean; error?: string; count?: number }> {
    const validQuestions = this.state.questions.filter(q => q.validation_status === 'valid');
    
    if (validQuestions.length === 0) {
      return {
        success: false,
        error: 'No valid questions to import'
      };
    }

    try {
      this.setState({ importing: true, progress: 0 });

      let importedCount = 0;
      const batchSize = 5;

      // Handle passages for Parts 3, 4, 6, 7 - Only use existing passages
      const passageMap = new Map<string, string>();
      
      // Collect all unique passage_ids first
      const passageIds = [...new Set(
        validQuestions
          .filter(q => [3, 4, 6, 7].includes(q.part) && q.passage_id)
          .map(q => q.passage_id)
      )];

      // Verify all passages exist in one query
      if (passageIds.length > 0) {
        // This will be implemented when PassageService is available
        // For now, we'll use a mock implementation
        console.log('Verifying passages:', passageIds);
      }

      // Filter out invalid questions after passage validation
      const finalValidQuestions = validQuestions.filter(q => q.validation_status === 'valid');
      
      if (finalValidQuestions.length === 0) {
        return {
          success: false,
          error: 'All questions failed passage validation. Please check passage_id values.'
        };
      }

      // Import questions in batches
      for (let i = 0; i < finalValidQuestions.length; i += batchSize) {
        const batch = finalValidQuestions.slice(i, i + batchSize);
        
        const questionsToInsert = batch.map(q => {
          // Determine audio URL based on part
          let audioUrl = null;
          if (usesIndividualAudio(q.part)) {
            audioUrl = q.audio_url || null;
          } else if (usesPassageAudio(q.part)) {
            audioUrl = null; // Will be handled by passage
          }

          return {
            part: q.part,
            passage_id: q.passage_id || null,
            blank_index: q.blank_index || null,
            prompt_text: q.part === 1 || q.part === 2 ? '' : q.prompt_text.trim(),
            choices: {
              A: q.choiceA.trim(),
              B: q.choiceB.trim(),
              C: q.choiceC.trim(),
              D: q.part === 2 ? '' : q.choiceD.trim()
            },
            correct_choice: q.correct_choice.toUpperCase(),
            explain_vi: q.explain_vi.trim(),
            explain_en: q.explain_en.trim(),
            tags: q.tags,
            difficulty: q.difficulty,
            status: q.status,
            image_url: q.image_url || null,
            audio_url: audioUrl,
            created_by: userId
          };
        });

        // Use QuestionService to create questions
        await this.questionService.bulkCreateQuestions(questionsToInsert);

        importedCount += batch.length;
        this.setState({ progress: (importedCount / finalValidQuestions.length) * 100 });

        // Update status
        this.setState({
          questions: this.state.questions.map(q => 
            batch.includes(q) ? { ...q, validation_status: 'imported' as const } : q
          )
        });

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      return {
        success: true,
        count: importedCount
      };

    } catch (error: any) {
      console.error('Import failed:', error);
      return {
        success: false,
        error: error.message || 'Import failed'
      };
    } finally {
      this.setState({ importing: false });
    }
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    const questions = this.state.questions;
    return {
      total: questions.length,
      valid: questions.filter(q => q.validation_status === 'valid').length,
      invalid: questions.filter(q => q.validation_status === 'invalid').length,
      imported: questions.filter(q => q.validation_status === 'imported').length,
      pending: questions.filter(q => q.validation_status === 'pending').length,
    };
  }

  /**
   * Get part icon
   */
  public getPartIcon(part: number): string {
    if (part <= 4) return '🎧'; // Listening
    return '📖'; // Reading
  }

  /**
   * Get part color class
   */
  public getPartColor(part: number): string {
    if (part <= 4) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-green-100 text-green-800 border-green-200';
  }

  /**
   * Check if part uses individual audio
   */
  public usesIndividualAudio(part: number): boolean {
    return usesIndividualAudio(part);
  }

  /**
   * Check if part uses passage audio
   */
  public usesPassageAudio(part: number): boolean {
    return usesPassageAudio(part);
  }

  /**
   * Reset state
   */
  public reset(): void {
    this.setState(this.getInitialState());
  }

  /**
   * Clear questions
   */
  public clearQuestions(): void {
    this.setState({ questions: [] });
  }

  /**
   * Update question validation status
   */
  public updateQuestionStatus(index: number, status: 'pending' | 'valid' | 'invalid' | 'imported'): void {
    const questions = [...this.state.questions];
    if (questions[index]) {
      questions[index].validation_status = status;
      this.setState({ questions });
    }
  }

  /**
   * Get question by index
   */
  public getQuestion(index: number): TOEICQuestion | null {
    return this.state.questions[index] || null;
  }

  /**
   * Get questions by part
   */
  public getQuestionsByPart(part: number): TOEICQuestion[] {
    return this.state.questions.filter(q => q.part === part);
  }

  /**
   * Get questions by validation status
   */
  public getQuestionsByStatus(status: 'pending' | 'valid' | 'invalid' | 'imported'): TOEICQuestion[] {
    return this.state.questions.filter(q => q.validation_status === status);
  }
}
