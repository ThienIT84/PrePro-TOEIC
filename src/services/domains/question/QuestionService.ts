import { BaseService } from '../BaseService';
import { QuestionModel } from '@/models/entities';
import { Question, TOEICPart, Difficulty, QuestionStatus } from '@/types';

/**
 * Question Service - Xử lý tất cả operations liên quan đến Questions
 * Sử dụng BaseService và không thay đổi Supabase
 */
export class QuestionService extends BaseService {
  private tableName = 'questions';

  /**
   * Get all questions với filters
   */
  async getQuestions(filters?: {
    part?: TOEICPart;
    difficulty?: Difficulty;
    status?: QuestionStatus;
    created_by?: string;
    search?: string;
  }): Promise<{ data: QuestionModel[] | null; error: any }> {
    this.log('getQuestions', filters);

    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.part) {
          query = query.eq('part', filters.part);
        }
        if (filters.difficulty) {
          query = query.eq('difficulty', filters.difficulty);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.created_by) {
          query = query.eq('created_by', filters.created_by);
        }
        if (filters.search) {
          query = query.or(`prompt_text.ilike.%${filters.search}%,explain_vi.ilike.%${filters.search}%,explain_en.ilike.%${filters.search}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        this.handleError(error, 'getQuestions');
      }

      // Convert to QuestionModel instances
      const questionModels = (data || []).map(q => new QuestionModel(q));
      return { data: questionModels, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get question by ID
   */
  async getQuestionById(id: string): Promise<{ data: QuestionModel | null; error: any }> {
    this.log('getQuestionById', { id });

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.handleError(error, 'getQuestionById');
      }

      const questionModel = data ? new QuestionModel(data) : null;
      return { data: questionModel, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create new question
   */
  async createQuestion(questionData: Partial<Question>): Promise<{ data: QuestionModel | null; error: any }> {
    this.log('createQuestion', { part: questionData.part });

    try {
      // Validate required fields
      const requiredFields = ['part', 'prompt_text', 'correct_choice', 'explain_vi', 'explain_en'];
      const validationErrors = this.validateRequired(questionData, requiredFields);
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Create QuestionModel instance for validation
      const questionModel = new QuestionModel(questionData as Question);
      const modelValidationErrors = questionModel.validate();
      
      if (modelValidationErrors.length > 0) {
        throw new Error(`Model validation failed: ${modelValidationErrors.join(', ')}`);
      }

      const { data, error } = await this.insertData(this.tableName, questionData);

      if (error) {
        this.handleError(error, 'createQuestion');
      }

      const newQuestionModel = data ? new QuestionModel(data) : null;
      return { data: newQuestionModel, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update existing question
   */
  async updateQuestion(id: string, updates: Partial<Question>): Promise<{ data: QuestionModel | null; error: any }> {
    this.log('updateQuestion', { id, updates });

    try {
      // Get current question for validation
      const { data: currentData } = await this.getQuestionById(id);
      if (!currentData) {
        throw new Error('Question not found');
      }

      // Create updated QuestionModel for validation
      const updatedData = { ...currentData.toJSON(), ...updates };
      const questionModel = new QuestionModel(updatedData);
      const validationErrors = questionModel.validate();
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const { data, error } = await this.updateData(this.tableName, id, updates);

      if (error) {
        this.handleError(error, 'updateQuestion');
      }

      const updatedQuestionModel = data ? new QuestionModel(data) : null;
      return { data: updatedQuestionModel, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<{ error: any }> {
    this.log('deleteQuestion', { id });

    try {
      const { error } = await this.deleteData(this.tableName, id);

      if (error) {
        this.handleError(error, 'deleteQuestion');
      }

      return { error: null };

    } catch (error) {
      return { error };
    }
  }

  /**
   * Search questions
   */
  async searchQuestions(searchTerm: string): Promise<{ data: QuestionModel[] | null; error: any }> {
    this.log('searchQuestions', { searchTerm });

    try {
      const { data, error } = await this.searchData(
        this.tableName,
        searchTerm,
        ['prompt_text', 'explain_vi', 'explain_en']
      );

      if (error) {
        this.handleError(error, 'searchQuestions');
      }

      const questionModels = (data || []).map(q => new QuestionModel(q));
      return { data: questionModels, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get questions by part
   */
  async getQuestionsByPart(part: TOEICPart): Promise<{ data: QuestionModel[] | null; error: any }> {
    this.log('getQuestionsByPart', { part });

    return this.getQuestions({ part });
  }

  /**
   * Get questions by difficulty
   */
  async getQuestionsByDifficulty(difficulty: Difficulty): Promise<{ data: QuestionModel[] | null; error: any }> {
    this.log('getQuestionsByDifficulty', { difficulty });

    return this.getQuestions({ difficulty });
  }

  /**
   * Get questions by status
   */
  async getQuestionsByStatus(status: QuestionStatus): Promise<{ data: QuestionModel[] | null; error: any }> {
    this.log('getQuestionsByStatus', { status });

    return this.getQuestions({ status });
  }

  /**
   * Get questions needing audio
   */
  async getQuestionsNeedingAudio(): Promise<{ data: QuestionModel[] | null; error: any }> {
    this.log('getQuestionsNeedingAudio');

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('part', [1, 2, 3, 4])
        .is('audio_url', null);

      if (error) {
        this.handleError(error, 'getQuestionsNeedingAudio');
      }

      const questionModels = (data || []).map(q => new QuestionModel(q));
      return { data: questionModels, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get questions needing images
   */
  async getQuestionsNeedingImages(): Promise<{ data: QuestionModel[] | null; error: any }> {
    this.log('getQuestionsNeedingImages');

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('part', 1)
        .is('image_url', null);

      if (error) {
        this.handleError(error, 'getQuestionsNeedingImages');
      }

      const questionModels = (data || []).map(q => new QuestionModel(q));
      return { data: questionModels, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get questions needing passages
   */
  async getQuestionsNeedingPassages(): Promise<{ data: QuestionModel[] | null; error: any }> {
    this.log('getQuestionsNeedingPassages');

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .in('part', [3, 4, 6, 7])
        .is('passage_id', null);

      if (error) {
        this.handleError(error, 'getQuestionsNeedingPassages');
      }

      const questionModels = (data || []).map(q => new QuestionModel(q));
      return { data: questionModels, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get valid questions for exam
   */
  async getValidQuestionsForExam(): Promise<{ data: QuestionModel[] | null; error: any }> {
    this.log('getValidQuestionsForExam');

    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('status', 'published');

      if (error) {
        this.handleError(error, 'getValidQuestionsForExam');
      }

      // Filter valid questions using model validation
      const questionModels = (data || [])
        .map(q => new QuestionModel(q))
        .filter(q => q.isValidForExam());

      return { data: questionModels, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get questions statistics
   */
  async getQuestionsStats(): Promise<{ data: any; error: any }> {
    this.log('getQuestionsStats');

    try {
      const { data: questions, error } = await this.getQuestions();
      
      if (error) {
        this.handleError(error, 'getQuestionsStats');
      }

      const questionModels = (questions || []).map(q => new QuestionModel(q));
      
      const stats = {
        total: questionModels.length,
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

      questionModels.forEach(q => {
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

      return { data: stats, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Bulk create questions
   */
  async bulkCreateQuestions(questionsData: Partial<Question>[]): Promise<{ data: QuestionModel[] | null; error: any }> {
    this.log('bulkCreateQuestions', { count: questionsData.length });

    try {
      // Validate all questions
      const validatedQuestions = questionsData.map(qData => {
        const questionModel = new QuestionModel(qData as Question);
        const validationErrors = questionModel.validate();
        if (validationErrors.length > 0) {
          throw new Error(`Validation failed for question: ${validationErrors.join(', ')}`);
        }
        return qData;
      });

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(validatedQuestions)
        .select();

      if (error) {
        this.handleError(error, 'bulkCreateQuestions');
      }

      const questionModels = (data || []).map(q => new QuestionModel(q));
      return { data: questionModels, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update question status
   */
  async updateQuestionStatus(id: string, status: QuestionStatus): Promise<{ data: QuestionModel | null; error: any }> {
    this.log('updateQuestionStatus', { id, status });

    return this.updateQuestion(id, { status });
  }

  /**
   * Get questions count
   */
  async getQuestionsCount(filters?: {
    part?: TOEICPart;
    difficulty?: Difficulty;
    status?: QuestionStatus;
  }): Promise<{ count: number | null; error: any }> {
    this.log('getQuestionsCount', filters);

    return this.countData(this.tableName, filters);
  }
}
