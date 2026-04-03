import { QuestionModel } from '@/models/entities';
import { Question, TOEICPart, Difficulty, CorrectChoice } from '@/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Question Controller - Xử lý business logic cho Question management
 * Sử dụng QuestionModel và services hiện tại
 */
export class QuestionController {
  private questions: QuestionModel[] = [];
  private loading: boolean = false;
  private error: string | null = null;

  // Event callbacks
  private onQuestionsChange?: (questions: QuestionModel[]) => void;
  private onLoadingChange?: (loading: boolean) => void;
  private onErrorChange?: (error: string | null) => void;

  constructor() {
    // Initialize controller
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onQuestionsChange?: (questions: QuestionModel[]) => void;
    onLoadingChange?: (loading: boolean) => void;
    onErrorChange?: (error: string | null) => void;
  }) {
    this.onQuestionsChange = callbacks.onQuestionsChange;
    this.onLoadingChange = callbacks.onLoadingChange;
    this.onErrorChange = callbacks.onErrorChange;
  }

  /**
   * Get current questions
   */
  getQuestions(): QuestionModel[] {
    return this.questions;
  }

  /**
   * Get loading state
   */
  isLoading(): boolean {
    return this.loading;
  }

  /**
   * Get error state
   */
  getError(): string | null {
    return this.error;
  }

  /**
   * Set loading state
   */
  private setLoading(loading: boolean): void {
    this.loading = loading;
    this.onLoadingChange?.(loading);
  }

  /**
   * Set error state
   */
  private setError(error: string | null): void {
    this.error = error;
    this.onErrorChange?.(error);
  }

  /**
   * Set questions and notify
   */
  private setQuestions(questions: QuestionModel[]): void {
    this.questions = questions;
    this.onQuestionsChange?.(questions);
  }

  /**
   * Load questions from database
   */
  async loadQuestions(filters?: {
    part?: TOEICPart;
    difficulty?: Difficulty;
    status?: string;
    search?: string;
  }): Promise<void> {
    try {
      this.setLoading(true);
      this.setError(null);

      let query = supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.part) {
        query = query.eq('part', filters.part);
      }
      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`prompt_text.ilike.%${filters.search}%,explain_vi.ilike.%${filters.search}%,explain_en.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Convert to QuestionModel instances
      const questionModels = (data || []).map(q => new QuestionModel(q));
      this.setQuestions(questionModels);

    } catch (error) {
      console.error('Error loading questions:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to load questions');
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Create new question
   */
  async createQuestion(questionData: Partial<Question>): Promise<QuestionModel | null> {
    try {
      this.setLoading(true);
      this.setError(null);

      // Create QuestionModel instance for validation
      const questionModel = new QuestionModel(questionData as Question);
      
      // Validate question
      const validationErrors = questionModel.validate();
      if (validationErrors.length > 0) {
        this.setError(`Validation failed: ${validationErrors.join(', ')}`);
        return null;
      }

      // Insert into database
      const { data, error } = await supabase
        .from('questions')
        .insert([questionData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create new QuestionModel instance
      const newQuestion = new QuestionModel(data);
      
      // Add to local state
      this.setQuestions([newQuestion, ...this.questions]);

      return newQuestion;

    } catch (error) {
      console.error('Error creating question:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to create question');
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Update existing question
   */
  async updateQuestion(id: string, updates: Partial<Question>): Promise<QuestionModel | null> {
    try {
      this.setLoading(true);
      this.setError(null);

      // Get current question
      const currentQuestion = this.questions.find(q => q.id === id);
      if (!currentQuestion) {
        this.setError('Question not found');
        return null;
      }

      // Create updated QuestionModel for validation
      const updatedData = { ...currentQuestion.toJSON(), ...updates };
      const questionModel = new QuestionModel(updatedData);
      
      // Validate updated question
      const validationErrors = questionModel.validate();
      if (validationErrors.length > 0) {
        this.setError(`Validation failed: ${validationErrors.join(', ')}`);
        return null;
      }

      // Update in database
      const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create updated QuestionModel instance
      const updatedQuestion = new QuestionModel(data);
      
      // Update local state
      const updatedQuestions = this.questions.map(q => 
        q.id === id ? updatedQuestion : q
      );
      this.setQuestions(updatedQuestions);

      return updatedQuestion;

    } catch (error) {
      console.error('Error updating question:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to update question');
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<boolean> {
    try {
      this.setLoading(true);
      this.setError(null);

      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Remove from local state
      const updatedQuestions = this.questions.filter(q => q.id !== id);
      this.setQuestions(updatedQuestions);

      return true;

    } catch (error) {
      console.error('Error deleting question:', error);
      this.setError(error instanceof Error ? error.message : 'Failed to delete question');
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get question by ID
   */
  getQuestionById(id: string): QuestionModel | undefined {
    return this.questions.find(q => q.id === id);
  }

  /**
   * Filter questions by part
   */
  getQuestionsByPart(part: TOEICPart): QuestionModel[] {
    return this.questions.filter(q => q.part === part);
  }

  /**
   * Filter questions by difficulty
   */
  getQuestionsByDifficulty(difficulty: Difficulty): QuestionModel[] {
    return this.questions.filter(q => q.difficulty === difficulty);
  }

  /**
   * Get questions that need audio
   */
  getQuestionsNeedingAudio(): QuestionModel[] {
    return this.questions.filter(q => q.needsAudio());
  }

  /**
   * Get questions that need images
   */
  getQuestionsNeedingImages(): QuestionModel[] {
    return this.questions.filter(q => q.needsImage());
  }

  /**
   * Get questions that need passages
   */
  getQuestionsNeedingPassages(): QuestionModel[] {
    return this.questions.filter(q => q.needsPassage());
  }

  /**
   * Get valid questions for exam
   */
  getValidQuestionsForExam(): QuestionModel[] {
    return this.questions.filter(q => q.isValidForExam());
  }

  /**
   * Search questions
   */
  searchQuestions(searchTerm: string): QuestionModel[] {
    if (!searchTerm.trim()) return this.questions;

    const term = searchTerm.toLowerCase();
    return this.questions.filter(q => 
      q.prompt_text.toLowerCase().includes(term) ||
      q.explain_vi.toLowerCase().includes(term) ||
      q.explain_en.toLowerCase().includes(term) ||
      q.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }

  /**
   * Get questions statistics
   */
  getQuestionsStats(): {
    total: number;
    byPart: Record<number, number>;
    byDifficulty: Record<Difficulty, number>;
    byStatus: Record<string, number>;
    validForExam: number;
    needingAudio: number;
    needingImages: number;
    needingPassages: number;
  } {
    const stats = {
      total: this.questions.length,
      byPart: {} as Record<number, number>,
      byDifficulty: {
        easy: 0,
        medium: 0,
        hard: 0
      } as Record<Difficulty, number>,
      byStatus: {} as Record<string, number>,
      validForExam: 0,
      needingAudio: 0,
      needingImages: 0,
      needingPassages: 0
    };

    this.questions.forEach(q => {
      // Count by part
      stats.byPart[q.part] = (stats.byPart[q.part] || 0) + 1;
      
      // Count by difficulty
      stats.byDifficulty[q.difficulty]++;
      
      // Count by status
      stats.byStatus[q.status] = (stats.byStatus[q.status] || 0) + 1;
      
      // Count special requirements
      if (q.isValidForExam()) stats.validForExam++;
      if (q.needsAudio()) stats.needingAudio++;
      if (q.needsImage()) stats.needingImages++;
      if (q.needsPassage()) stats.needingPassages++;
    });

    return stats;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.questions = [];
    this.loading = false;
    this.error = null;
    this.onQuestionsChange?.([]);
    this.onLoadingChange?.(false);
    this.onErrorChange?.(null);
  }
}
