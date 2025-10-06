/**
 * ExamSetCreatorController
 * Business logic cho TOEIC Exam Set Creation
 * Extracted từ EnhancedExamSetCreator.tsx
 */

import { ExamService } from '@/services/domains/exam/ExamService';
import { QuestionService } from '@/services/domains/question/QuestionService';
import { Question } from '@/types';

export interface ExamSet {
  id: string;
  title: string;
  description: string;
  type: 'full' | 'mini' | 'custom';
  total_questions: number;
  time_limit: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  status: 'draft' | 'active' | 'inactive';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExamPart {
  part: number;
  name: string;
  description: string;
  questionCount: number;
  timeLimit: number;
  questions: Question[];
  required: boolean;
}

export interface ExamTemplate {
  id: string;
  name: string;
  type: 'full' | 'mini' | 'custom';
  description: string;
  parts: ExamPart[];
  totalQuestions: number;
  totalTime: number;
}

export interface ExamSetCreatorState {
  activeTab: string;
  loading: boolean;
  saving: boolean;
  formData: {
    title: string;
    description: string;
    type: 'full' | 'mini' | 'custom';
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    status: 'draft' | 'active' | 'inactive';
    allow_multiple_attempts: boolean;
    max_attempts: number | '';
  };
  examParts: ExamPart[];
  questionBank: Question[];
  selectedQuestions: string[];
  searchTerm: string;
  filterType: string;
  filterDifficulty: string;
  templates: ExamTemplate[];
  errors: string[];
}

export class ExamSetCreatorController {
  private examService: ExamService;
  private questionService: QuestionService;
  private state: ExamSetCreatorState;
  private listeners: Array<(state: ExamSetCreatorState) => void> = [];

  constructor() {
    this.examService = new ExamService();
    this.questionService = new QuestionService();
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): ExamSetCreatorState {
    return {
      activeTab: 'create',
      loading: false,
      saving: false,
      formData: {
        title: '',
        description: '',
        type: 'full',
        difficulty: 'medium',
        status: 'draft',
        allow_multiple_attempts: true,
        max_attempts: '',
      },
      examParts: this.getDefaultExamParts(),
      questionBank: [],
      selectedQuestions: [],
      searchTerm: '',
      filterType: 'all',
      filterDifficulty: 'all',
      templates: this.getDefaultTemplates(),
      errors: [],
    };
  }

  /**
   * Get default exam parts configuration
   */
  private getDefaultExamParts(): ExamPart[] {
    return [
      {
        part: 1,
        name: 'Photos',
        description: 'Mô tả hình ảnh',
        questionCount: 6,
        timeLimit: 5,
        questions: [],
        required: true
      },
      {
        part: 2,
        name: 'Question-Response',
        description: 'Hỏi đáp ngắn',
        questionCount: 25,
        timeLimit: 8,
        questions: [],
        required: true
      },
      {
        part: 3,
        name: 'Conversations',
        description: 'Hội thoại ngắn',
        questionCount: 39,
        timeLimit: 15,
        questions: [],
        required: true
      },
      {
        part: 4,
        name: 'Talks',
        description: 'Bài nói dài',
        questionCount: 30,
        timeLimit: 17,
        questions: [],
        required: true
      },
      {
        part: 5,
        name: 'Incomplete Sentences',
        description: 'Hoàn thành câu',
        questionCount: 30,
        timeLimit: 20,
        questions: [],
        required: true
      },
      {
        part: 6,
        name: 'Text Completion',
        description: 'Hoàn thành đoạn văn',
        questionCount: 16,
        timeLimit: 12,
        questions: [],
        required: true
      },
      {
        part: 7,
        name: 'Reading Comprehension',
        description: 'Đọc hiểu',
        questionCount: 54,
        timeLimit: 43,
        questions: [],
        required: true
      }
    ];
  }

  /**
   * Get default templates
   */
  private getDefaultTemplates(): ExamTemplate[] {
    return [
      {
        id: 'full-toeic',
        name: 'Full TOEIC Test',
        type: 'full',
        description: 'Complete TOEIC test with all 7 parts (200 questions)',
        parts: [
          { part: 1, name: 'Photos', description: 'Mô tả hình ảnh', questionCount: 6, timeLimit: 5, questions: [], required: true },
          { part: 2, name: 'Question-Response', description: 'Hỏi đáp ngắn', questionCount: 25, timeLimit: 8, questions: [], required: true },
          { part: 3, name: 'Conversations', description: 'Hội thoại ngắn', questionCount: 39, timeLimit: 15, questions: [], required: true },
          { part: 4, name: 'Talks', description: 'Bài nói dài', questionCount: 30, timeLimit: 17, questions: [], required: true },
          { part: 5, name: 'Incomplete Sentences', description: 'Hoàn thành câu', questionCount: 30, timeLimit: 20, questions: [], required: true },
          { part: 6, name: 'Text Completion', description: 'Hoàn thành đoạn văn', questionCount: 16, timeLimit: 12, questions: [], required: true },
          { part: 7, name: 'Reading Comprehension', description: 'Đọc hiểu', questionCount: 54, timeLimit: 43, questions: [], required: true }
        ],
        totalQuestions: 200,
        totalTime: 120
      },
      {
        id: 'mini-toeic',
        name: 'Mini TOEIC Test',
        type: 'mini',
        description: 'Shortened TOEIC test (50 questions)',
        parts: [
          { part: 1, name: 'Photos', description: 'Mô tả hình ảnh', questionCount: 3, timeLimit: 3, questions: [], required: true },
          { part: 2, name: 'Question-Response', description: 'Hỏi đáp ngắn', questionCount: 5, timeLimit: 5, questions: [], required: true },
          { part: 3, name: 'Conversations', description: 'Hội thoại ngắn', questionCount: 7, timeLimit: 7, questions: [], required: true },
          { part: 4, name: 'Talks', description: 'Bài nói dài', questionCount: 5, timeLimit: 5, questions: [], required: true },
          { part: 5, name: 'Incomplete Sentences', description: 'Hoàn thành câu', questionCount: 10, timeLimit: 8, questions: [], required: true },
          { part: 6, name: 'Text Completion', description: 'Hoàn thành đoạn văn', questionCount: 5, timeLimit: 5, questions: [], required: true },
          { part: 7, name: 'Reading Comprehension', description: 'Đọc hiểu', questionCount: 15, timeLimit: 12, questions: [], required: true }
        ],
        totalQuestions: 50,
        totalTime: 45
      }
    ];
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: ExamSetCreatorState) => void): () => void {
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
  private setState(updates: Partial<ExamSetCreatorState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): ExamSetCreatorState {
    return { ...this.state };
  }

  /**
   * Load question bank from database
   */
  public async loadQuestionBank(): Promise<{ success: boolean; error?: string }> {
    try {
      this.setState({ loading: true, errors: [] });

      const questions = await this.questionService.getAllQuestions();
      this.setState({ questionBank: questions });

      return { success: true };
    } catch (error: any) {
      console.error('Error loading question bank:', error);
      this.setState({ errors: ['Failed to load question bank'] });
      return {
        success: false,
        error: 'Failed to load question bank'
      };
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Load template configuration
   */
  public loadTemplate(template: ExamTemplate): void {
    this.setState({
      formData: {
        ...this.state.formData,
        type: template.type,
        title: template.name,
        description: template.description
      },
      examParts: template.parts
    });
  }

  /**
   * Update form data
   */
  public updateFormData(updates: Partial<ExamSetCreatorState['formData']>): void {
    this.setState({
      formData: { ...this.state.formData, ...updates }
    });
  }

  /**
   * Update active tab
   */
  public setActiveTab(tab: string): void {
    this.setState({ activeTab: tab });
  }

  /**
   * Update exam part configuration
   */
  public updatePartConfig(partNumber: number, field: keyof ExamPart, value: any): void {
    this.setState({
      examParts: this.state.examParts.map(part => 
        part.part === partNumber 
          ? { ...part, [field]: value }
          : part
      )
    });
  }

  /**
   * Add questions to a specific part
   */
  public addQuestionsToPart(partNumber: number, questionIds: string[]): void {
    const questions = this.state.questionBank.filter(q => questionIds.includes(q.id));
    this.updatePartConfig(partNumber, 'questions', questions);
  }

  /**
   * Remove question from a specific part
   */
  public removeQuestionFromPart(partNumber: number, questionId: string): void {
    this.setState({
      examParts: this.state.examParts.map(part => 
        part.part === partNumber 
          ? { ...part, questions: part.questions.filter(q => q.id !== questionId) }
          : part
      )
    });
  }

  /**
   * Auto-assign questions based on TOEIC rules
   */
  public async autoAssignQuestions(): Promise<{ success: boolean; error?: string; count?: number }> {
    try {
      this.setState({ loading: true });

      const newExamParts = [...this.state.examParts];
      const usedQuestionIds = new Set<string>();

      for (let i = 0; i < newExamParts.length; i++) {
        const cfg = newExamParts[i];
        const need = cfg.questionCount;
        let assigned: Question[] = [];

        if (cfg.part === 1 || cfg.part === 2 || cfg.part === 5) {
          // Standalone questions
          const questions = await this.questionService.getQuestionsByPart(cfg.part);
          const filteredQuestions = questions.filter(q => 
            !usedQuestionIds.has(q.id) && 
            (this.state.formData.difficulty === 'mixed' || q.difficulty === this.state.formData.difficulty)
          );
          assigned = filteredQuestions.slice(0, need);
        } else if (cfg.part === 3 || cfg.part === 4) {
          // Group by passage_id, take 3 per passage
          const questions = await this.questionService.getQuestionsByPart(cfg.part);
          const filteredQuestions = questions.filter(q => 
            !usedQuestionIds.has(q.id) && 
            (this.state.formData.difficulty === 'mixed' || q.difficulty === this.state.formData.difficulty)
          );
          
          const byPassage: Record<string, Question[]> = {};
          filteredQuestions.forEach(q => {
            if (!q.passage_id) return;
            if (!byPassage[q.passage_id]) byPassage[q.passage_id] = [];
            byPassage[q.passage_id].push(q);
          });
          
          const groups = Object.values(byPassage).map(arr => 
            arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          );
          
          for (const g of groups) {
            const take = g.slice(0, 3);
            if (assigned.length + take.length <= need) {
              assigned.push(...take);
            }
            if (assigned.length >= need) break;
          }
        } else if (cfg.part === 6) {
          // 4 blanks per passage (blank_index 1-4)
          const questions = await this.questionService.getQuestionsByPart(6);
          const filteredQuestions = questions.filter(q => 
            !usedQuestionIds.has(q.id) && 
            (this.state.formData.difficulty === 'mixed' || q.difficulty === this.state.formData.difficulty)
          );
          
          const byPassage: Record<string, Question[]> = {};
          filteredQuestions.forEach(q => {
            if (!q.passage_id) return;
            if (!byPassage[q.passage_id]) byPassage[q.passage_id] = [];
            byPassage[q.passage_id].push(q);
          });
          
          const groups = Object.values(byPassage).map(arr => 
            arr.sort((a, b) => (a.blank_index || 0) - (b.blank_index || 0))
          );
          
          for (const g of groups) {
            const take = g.slice(0, 4);
            if (assigned.length + take.length <= need) {
              assigned.push(...take);
            }
            if (assigned.length >= need) break;
          }
        } else if (cfg.part === 7) {
          // Accumulate by passage groups up to target (prefer full groups)
          const questions = await this.questionService.getQuestionsByPart(7);
          const filteredQuestions = questions.filter(q => 
            !usedQuestionIds.has(q.id) && 
            (this.state.formData.difficulty === 'mixed' || q.difficulty === this.state.formData.difficulty)
          );
          
          const byPassage: Record<string, Question[]> = {};
          filteredQuestions.forEach(q => {
            if (!q.passage_id) return;
            if (!byPassage[q.passage_id]) byPassage[q.passage_id] = [];
            byPassage[q.passage_id].push(q);
          });
          
          const groups = Object.values(byPassage).map(arr => 
            arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          );
          
          for (const g of groups) {
            if (assigned.length === need) break;
            if (assigned.length + g.length <= need) {
              assigned.push(...g);
            } else {
              const remaining = need - assigned.length;
              if (remaining > 0) assigned.push(...g.slice(0, remaining));
            }
          }
        }

        newExamParts[i].questions = assigned;
        assigned.forEach(q => usedQuestionIds.add(q.id));
      }

      this.setState({ examParts: newExamParts });

      const totalAssigned = newExamParts.reduce((sum, part) => sum + part.questions.length, 0);
      return { 
        success: true, 
        count: totalAssigned 
      };
    } catch (error: any) {
      console.error('Error in auto-assignment:', error);
      return {
        success: false,
        error: error.message || 'Auto-assignment failed'
      };
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Validate exam configuration
   */
  public validateExam(): string[] {
    const errors: string[] = [];
    
    if (!this.state.formData.title.trim()) {
      errors.push('Exam title is required');
    }
    
    this.state.examParts.forEach(part => {
      if (part.required && part.questions.length < part.questionCount) {
        errors.push(`Part ${part.part} needs ${part.questionCount} questions, currently has ${part.questions.length}`);
      }
    });
    
    return errors;
  }

  /**
   * Create exam set
   */
  public async createExamSet(userId: string): Promise<{ success: boolean; error?: string; examSet?: ExamSet }> {
    const errors = this.validateExam();
    if (errors.length > 0) {
      return {
        success: false,
        error: errors.join(', ')
      };
    }

    try {
      this.setState({ saving: true });

      const examSetData = {
        title: this.state.formData.title.trim(),
        description: this.state.formData.description.trim(),
        type: 'mix' as const,
        question_count: this.state.examParts.reduce((sum, part) => sum + part.questions.length, 0),
        time_limit: this.state.examParts.reduce((sum, part) => sum + part.timeLimit, 0),
        difficulty: this.state.formData.difficulty,
        is_active: this.state.formData.status === 'active',
        allow_multiple_attempts: this.state.formData.allow_multiple_attempts,
        max_attempts: this.state.formData.max_attempts === '' ? null : this.state.formData.max_attempts,
        created_by: userId
      };

      const examSet = await this.examService.createExamSet(examSetData);

      // Add questions to exam set
      const allQuestions = this.state.examParts.flatMap(part => part.questions);
      const uniqueQuestions = allQuestions.filter((question, index, self) => 
        index === self.findIndex(q => q.id === question.id)
      );
      
      if (uniqueQuestions.length > 0) {
        await this.examService.addQuestionsToExamSet(examSet.id, uniqueQuestions);
      }

      // Reset form
      this.setState({
        formData: {
          title: '',
          description: '',
          type: 'full',
          difficulty: 'medium',
          status: 'draft',
          allow_multiple_attempts: true,
          max_attempts: '',
        },
        examParts: this.getDefaultExamParts()
      });

      return { 
        success: true, 
        examSet 
      };
    } catch (error: any) {
      console.error('Error creating exam set:', error);
      return {
        success: false,
        error: error.message || 'Failed to create exam set'
      };
    } finally {
      this.setState({ saving: false });
    }
  }

  /**
   * Update search term
   */
  public setSearchTerm(searchTerm: string): void {
    this.setState({ searchTerm });
  }

  /**
   * Update filter type
   */
  public setFilterType(filterType: string): void {
    this.setState({ filterType });
  }

  /**
   * Update filter difficulty
   */
  public setFilterDifficulty(filterDifficulty: string): void {
    this.setState({ filterDifficulty });
  }

  /**
   * Update selected questions
   */
  public setSelectedQuestions(selectedQuestions: string[]): void {
    this.setState({ selectedQuestions });
  }

  /**
   * Get filtered questions
   */
  public getFilteredQuestions(): Question[] {
    return this.state.questionBank.filter((q: Question) => {
      const text = (q.prompt_text || '').toLowerCase();
      const matchesSearch = text.includes(this.state.searchTerm.toLowerCase());
      const matchesType = this.state.filterType === 'all' || 
        (this.state.filterType === 'listening' ? q.part <= 4 : 
         this.state.filterType === 'reading' ? q.part > 4 : true);
      const matchesDifficulty = this.state.filterDifficulty === 'all' || q.difficulty === this.state.filterDifficulty;
      return matchesSearch && matchesType && matchesDifficulty;
    });
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    const totalQuestions = this.state.examParts.reduce((sum, part) => sum + part.questions.length, 0);
    const totalTime = this.state.examParts.reduce((sum, part) => sum + part.timeLimit, 0);
    const listeningQuestions = this.state.examParts.filter(p => p.part <= 4).reduce((sum, part) => sum + part.questions.length, 0);
    const readingQuestions = this.state.examParts.filter(p => p.part > 4).reduce((sum, part) => sum + part.questions.length, 0);

    return {
      totalQuestions,
      totalTime,
      listeningQuestions,
      readingQuestions,
      questionBankSize: this.state.questionBank.length,
      selectedQuestions: this.state.selectedQuestions.length
    };
  }

  /**
   * Reset state
   */
  public reset(): void {
    this.setState(this.getInitialState());
  }
}
