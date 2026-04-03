/**
 * ExamQuestionManagementController
 * Business logic cho Exam Question Management
 * Extracted từ ExamQuestionManagement.tsx
 */

import { supabase } from '@/integrations/supabase/client';

export interface ExamQuestionManagementState {
  examSet: ExamSet | null;
  examQuestions: ExamQuestion[];
  allQuestions: Question[];
  loading: boolean;
  isAddDialogOpen: boolean;
  isExcelDialogOpen: boolean;
  searchTerm: string;
  selectedType: string;
  editingQuestion: Question | null;
  viewingQuestion: Question | null;
}

export interface ExamSet {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  time_limit: number;
  question_count: number;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion {
  id: string;
  exam_set_id: string;
  question_id: string;
  order_index: number;
  question?: Question;
}

export interface Question {
  id: string;
  question: string;
  type: string;
  difficulty: string;
  choices?: string[];
  correct_answer?: string;
  explanation?: string;
  audio_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AddQuestionToExamParams {
  examSetId: string;
  questionId: string;
  orderIndex?: number;
}

export interface RemoveQuestionFromExamParams {
  examQuestionId: string;
}

export interface UpdateQuestionOrderParams {
  examQuestionId: string;
  newOrder: number;
}

export interface UpdateExamSetQuestionCountParams {
  examSetId: string;
  newCount: number;
}

export class ExamQuestionManagementController {
  private state: ExamQuestionManagementState;
  private listeners: Array<(state: ExamQuestionManagementState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): ExamQuestionManagementState {
    return {
      examSet: null,
      examQuestions: [],
      allQuestions: [],
      loading: true,
      isAddDialogOpen: false,
      isExcelDialogOpen: false,
      searchTerm: '',
      selectedType: 'all',
      editingQuestion: null,
      viewingQuestion: null
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: ExamQuestionManagementState) => void): () => void {
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
  private setState(updates: Partial<ExamQuestionManagementState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): ExamQuestionManagementState {
    return { ...this.state };
  }

  /**
   * Set exam set
   */
  public setExamSet(examSet: ExamSet | null): void {
    this.setState({ examSet });
  }

  /**
   * Set exam questions
   */
  public setExamQuestions(examQuestions: ExamQuestion[]): void {
    this.setState({ examQuestions });
  }

  /**
   * Set all questions
   */
  public setAllQuestions(allQuestions: Question[]): void {
    this.setState({ allQuestions });
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Set add dialog open state
   */
  public setAddDialogOpen(isOpen: boolean): void {
    this.setState({ isAddDialogOpen: isOpen });
  }

  /**
   * Set Excel dialog open state
   */
  public setExcelDialogOpen(isOpen: boolean): void {
    this.setState({ isExcelDialogOpen: isOpen });
  }

  /**
   * Set search term
   */
  public setSearchTerm(searchTerm: string): void {
    this.setState({ searchTerm });
  }

  /**
   * Set selected type
   */
  public setSelectedType(selectedType: string): void {
    this.setState({ selectedType });
  }

  /**
   * Set editing question
   */
  public setEditingQuestion(question: Question | null): void {
    this.setState({ editingQuestion: question });
  }

  /**
   * Set viewing question
   */
  public setViewingQuestion(question: Question | null): void {
    this.setState({ viewingQuestion: question });
  }

  /**
   * Fetch exam set from database
   */
  public async fetchExamSet(examSetId: string): Promise<{ success: boolean; data?: ExamSet; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .eq('id', examSetId)
        .single();

      if (error) throw error;

      this.setExamSet(data);
      return {
        success: true,
        data
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as any)?.message || 'An error occurred'
      };
    }
  }

  /**
   * Fetch exam questions from database
   */
  public async fetchExamQuestions(examSetId: string): Promise<{ success: boolean; data?: ExamQuestion[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('exam_questions')
        .select(`
          *,
          question:questions(*)
        `)
        .eq('exam_set_id', examSetId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      const examQuestions = (data || []).map((item: any) => ({
        ...item,
        question: item.question || null
      }));

      this.setExamQuestions(examQuestions);
      return {
        success: true,
        data: examQuestions
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as any)?.message || 'An error occurred'
      };
    }
  }

  /**
   * Fetch all questions from database
   */
  public async fetchAllQuestions(): Promise<{ success: boolean; data?: Question[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const questions = (data || []).map((item: any) => ({
        id: item.id,
        question: item.prompt_text || item.question || '',
        type: item.part ? `part${item.part}` : item.type || 'unknown',
        difficulty: item.difficulty || 'medium',
        choices: item.choices ? Object.values(item.choices) as string[] : [],
        correct_answer: item.correct_choice || item.correct_answer,
        explanation: item.explain_vi || item.explanation,
        audio_url: item.audio_url,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));

      this.setAllQuestions(questions);
      return {
        success: true,
        data: questions
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as any)?.message || 'An error occurred'
      };
    }
  }

  /**
   * Add question to exam set
   */
  public async addQuestionToExam(params: AddQuestionToExamParams): Promise<{ success: boolean; error?: string }> {
    try {
      const maxOrder = Math.max(...this.state.examQuestions.map(q => q.order_index), -1);
      
      const { error } = await supabase
        .from('exam_questions')
        .insert([{
          exam_set_id: params.examSetId,
          question_id: params.questionId,
          order_index: params.orderIndex || maxOrder + 1
        }]);

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as any)?.message || 'An error occurred'
      };
    }
  }

  /**
   * Remove question from exam set
   */
  public async removeQuestionFromExam(params: RemoveQuestionFromExamParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('exam_questions')
        .delete()
        .eq('id', params.examQuestionId);

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as any)?.message || 'An error occurred'
      };
    }
  }

  /**
   * Update question order in exam set
   */
  public async updateQuestionOrder(params: UpdateQuestionOrderParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('exam_questions')
        .update({ order_index: params.newOrder })
        .eq('id', params.examQuestionId);

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as any)?.message || 'An error occurred'
      };
    }
  }

  /**
   * Update exam set question count
   */
  public async updateExamSetQuestionCount(params: UpdateExamSetQuestionCountParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('exam_sets')
        .update({ question_count: params.newCount })
        .eq('id', params.examSetId);

      if (error) throw error;

      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: (error as any)?.message || 'An error occurred'
      };
    }
  }

  /**
   * Get filtered questions
   */
  public getFilteredQuestions(): Question[] {
    return this.state.allQuestions.filter(question => {
      const matchesSearch = question.question.toLowerCase().includes(this.state.searchTerm.toLowerCase());
      const matchesType = this.state.selectedType === 'all' || question.type === this.state.selectedType;
      const notInExam = !this.state.examQuestions.some(eq => eq.question_id === question.id);
      
      return matchesSearch && matchesType && notInExam;
    });
  }

  /**
   * Get type label
   */
  public getTypeLabel(type: string): string {
    const labels = {
      vocab: 'Từ vựng',
      grammar: 'Ngữ pháp',
      listening: 'Nghe hiểu',
      reading: 'Đọc hiểu',
      mix: 'Tổng hợp'
    };
    return labels[type as keyof typeof labels] || type;
  }

  /**
   * Get difficulty label
   */
  public getDifficultyLabel(difficulty: string): string {
    const labels = {
      easy: 'Dễ',
      medium: 'Trung bình',
      hard: 'Khó'
    };
    return labels[difficulty as keyof typeof labels] || difficulty;
  }

  /**
   * Get question preview text
   */
  public getQuestionPreview(question: Question): string {
    if (question.choices && question.choices.length > 0) {
      return `A. ${question.choices[0]}${question.choices.length > 1 ? ` ... (+${question.choices.length - 1} lựa chọn khác)` : ''}`;
    }
    return question.question;
  }

  /**
   * Check if question count is synced
   */
  public isQuestionCountSynced(): boolean {
    if (!this.state.examSet) return true;
    return this.state.examSet.question_count === this.state.examQuestions.length;
  }

  /**
   * Get question count difference
   */
  public getQuestionCountDifference(): number {
    if (!this.state.examSet) return 0;
    return this.state.examQuestions.length - this.state.examSet.question_count;
  }

  /**
   * Get exam set statistics
   */
  public getExamSetStatistics(): {
    totalQuestions: number;
    questionsByType: Record<string, number>;
    questionsByDifficulty: Record<string, number>;
    averageDifficulty: number;
    hasAudioQuestions: boolean;
  } {
    const questions = this.state.examQuestions.map(eq => eq.question).filter(Boolean) as Question[];
    
    const questionsByType = questions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const questionsByDifficulty = questions.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const difficultyScores = { easy: 1, medium: 2, hard: 3 };
    const averageDifficulty = questions.length > 0 
      ? questions.reduce((sum, q) => sum + (difficultyScores[q.difficulty as keyof typeof difficultyScores] || 2), 0) / questions.length
      : 0;

    const hasAudioQuestions = questions.some(q => q.audio_url);

    return {
      totalQuestions: questions.length,
      questionsByType,
      questionsByDifficulty,
      averageDifficulty,
      hasAudioQuestions
    };
  }

  /**
   * Get questions by type
   */
  public getQuestionsByType(type: string): Question[] {
    return this.state.allQuestions.filter(q => q.type === type);
  }

  /**
   * Get questions by difficulty
   */
  public getQuestionsByDifficulty(difficulty: string): Question[] {
    return this.state.allQuestions.filter(q => q.difficulty === difficulty);
  }

  /**
   * Get available question types
   */
  public getAvailableQuestionTypes(): string[] {
    const types = new Set(this.state.allQuestions.map(q => q.type));
    return Array.from(types);
  }

  /**
   * Get available difficulties
   */
  public getAvailableDifficulties(): string[] {
    const difficulties = new Set(this.state.allQuestions.map(q => q.difficulty));
    return Array.from(difficulties);
  }

  /**
   * Check if loading
   */
  public isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Check if add dialog is open
   */
  public isAddDialogOpen(): boolean {
    return this.state.isAddDialogOpen;
  }

  /**
   * Check if Excel dialog is open
   */
  public isExcelDialogOpen(): boolean {
    return this.state.isExcelDialogOpen;
  }

  /**
   * Get exam set
   */
  public getExamSet(): ExamSet | null {
    return this.state.examSet;
  }

  /**
   * Get exam questions
   */
  public getExamQuestions(): ExamQuestion[] {
    return this.state.examQuestions;
  }

  /**
   * Get all questions
   */
  public getAllQuestions(): Question[] {
    return this.state.allQuestions;
  }

  /**
   * Get search term
   */
  public getSearchTerm(): string {
    return this.state.searchTerm;
  }

  /**
   * Get selected type
   */
  public getSelectedType(): string {
    return this.state.selectedType;
  }

  /**
   * Get editing question
   */
  public getEditingQuestion(): Question | null {
    return this.state.editingQuestion;
  }

  /**
   * Get viewing question
   */
  public getViewingQuestion(): Question | null {
    return this.state.viewingQuestion;
  }

  /**
   * Reset state
   */
  public resetState(): void {
    this.setState(this.getInitialState());
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.listeners = [];
  }
}
