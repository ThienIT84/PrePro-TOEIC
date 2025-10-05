import { BaseService } from '../BaseService';
import { ExamSetModel } from '@/models/entities';
import { ExamSet, DrillType, Difficulty } from '@/types';

/**
 * Exam Service - Xử lý tất cả operations liên quan đến Exams
 * Sử dụng BaseService và không thay đổi Supabase
 */
export class ExamService extends BaseService {
  private examSetsTable = 'exam_sets';
  private examQuestionsTable = 'exam_questions';
  private examSessionsTable = 'exam_sessions';
  private examAttemptsTable = 'exam_attempts';

  /**
   * Get all exam sets với filters
   */
  async getExamSets(filters?: {
    type?: DrillType;
    difficulty?: Difficulty;
    is_active?: boolean;
    created_by?: string;
    search?: string;
  }): Promise<{ data: ExamSetModel[] | null; error: any }> {
    this.log('getExamSets', filters);

    try {
      let query = this.supabase
        .from(this.examSetsTable)
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.type) {
          query = query.eq('type', filters.type);
        }
        if (filters.difficulty) {
          query = query.eq('difficulty', filters.difficulty);
        }
        if (filters.is_active !== undefined) {
          query = query.eq('is_active', filters.is_active);
        }
        if (filters.created_by) {
          query = query.eq('created_by', filters.created_by);
        }
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        this.handleError(error, 'getExamSets');
      }

      // Convert to ExamSetModel instances
      const examSetModels = (data || []).map(es => new ExamSetModel(es));
      return { data: examSetModels, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get exam set by ID
   */
  async getExamSetById(id: string): Promise<{ data: ExamSetModel | null; error: any }> {
    this.log('getExamSetById', { id });

    try {
      const { data, error } = await this.supabase
        .from(this.examSetsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.handleError(error, 'getExamSetById');
      }

      const examSetModel = data ? new ExamSetModel(data) : null;
      return { data: examSetModel, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create new exam set
   */
  async createExamSet(examSetData: Partial<ExamSet>): Promise<{ data: ExamSetModel | null; error: any }> {
    this.log('createExamSet', { title: examSetData.title });

    try {
      // Validate required fields
      const requiredFields = ['title', 'type', 'difficulty', 'question_count', 'time_limit'];
      const validationErrors = this.validateRequired(examSetData, requiredFields);
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      // Create ExamSetModel instance for validation
      const examSetModel = new ExamSetModel(examSetData as ExamSet);
      const modelValidationErrors = examSetModel.validate();
      
      if (modelValidationErrors.length > 0) {
        throw new Error(`Model validation failed: ${modelValidationErrors.join(', ')}`);
      }

      const { data, error } = await this.insertData(this.examSetsTable, examSetData);

      if (error) {
        this.handleError(error, 'createExamSet');
      }

      const newExamSetModel = data ? new ExamSetModel(data) : null;
      return { data: newExamSetModel, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update existing exam set
   */
  async updateExamSet(id: string, updates: Partial<ExamSet>): Promise<{ data: ExamSetModel | null; error: any }> {
    this.log('updateExamSet', { id, updates });

    try {
      // Get current exam set for validation
      const { data: currentData } = await this.getExamSetById(id);
      if (!currentData) {
        throw new Error('Exam set not found');
      }

      // Create updated ExamSetModel for validation
      const updatedData = { ...currentData.toJSON(), ...updates };
      const examSetModel = new ExamSetModel(updatedData);
      const validationErrors = examSetModel.validate();
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }

      const { data, error } = await this.updateData(this.examSetsTable, id, updates);

      if (error) {
        this.handleError(error, 'updateExamSet');
      }

      const updatedExamSetModel = data ? new ExamSetModel(data) : null;
      return { data: updatedExamSetModel, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Delete exam set
   */
  async deleteExamSet(id: string): Promise<{ error: any }> {
    this.log('deleteExamSet', { id });

    try {
      const { error } = await this.deleteData(this.examSetsTable, id);

      if (error) {
        this.handleError(error, 'deleteExamSet');
      }

      return { error: null };

    } catch (error) {
      return { error };
    }
  }

  /**
   * Get exam set questions
   */
  async getExamSetQuestions(examSetId: string): Promise<{ data: any[] | null; error: any }> {
    this.log('getExamSetQuestions', { examSetId });

    try {
      const { data, error } = await this.supabase
        .from(this.examQuestionsTable)
        .select(`
          *,
          questions (*)
        `)
        .eq('exam_set_id', examSetId)
        .order('order_index', { ascending: true });

      if (error) {
        this.handleError(error, 'getExamSetQuestions');
      }

      return { data: data || [], error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Add question to exam set
   */
  async addQuestionToExamSet(examSetId: string, questionId: string, orderIndex: number): Promise<{ data: any | null; error: any }> {
    this.log('addQuestionToExamSet', { examSetId, questionId, orderIndex });

    try {
      const { data, error } = await this.supabase
        .from(this.examQuestionsTable)
        .insert([{
          exam_set_id: examSetId,
          question_id: questionId,
          order_index: orderIndex
        }])
        .select()
        .single();

      if (error) {
        this.handleError(error, 'addQuestionToExamSet');
      }

      return { data, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Remove question from exam set
   */
  async removeQuestionFromExamSet(examSetId: string, questionId: string): Promise<{ error: any }> {
    this.log('removeQuestionFromExamSet', { examSetId, questionId });

    try {
      const { error } = await this.supabase
        .from(this.examQuestionsTable)
        .delete()
        .eq('exam_set_id', examSetId)
        .eq('question_id', questionId);

      if (error) {
        this.handleError(error, 'removeQuestionFromExamSet');
      }

      return { error: null };

    } catch (error) {
      return { error };
    }
  }

  /**
   * Update question order in exam set
   */
  async updateQuestionOrder(examSetId: string, questionId: string, newOrderIndex: number): Promise<{ error: any }> {
    this.log('updateQuestionOrder', { examSetId, questionId, newOrderIndex });

    try {
      const { error } = await this.supabase
        .from(this.examQuestionsTable)
        .update({ order_index: newOrderIndex })
        .eq('exam_set_id', examSetId)
        .eq('question_id', questionId);

      if (error) {
        this.handleError(error, 'updateQuestionOrder');
      }

      return { error: null };

    } catch (error) {
      return { error };
    }
  }

  /**
   * Get exam sessions
   */
  async getExamSessions(filters?: {
    exam_set_id?: string;
    user_id?: string;
    status?: string;
  }): Promise<{ data: any[] | null; error: any }> {
    this.log('getExamSessions', filters);

    try {
      let query = this.supabase
        .from(this.examSessionsTable)
        .select(`
          *,
          exam_sets (*),
          profiles (*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters) {
        if (filters.exam_set_id) {
          query = query.eq('exam_set_id', filters.exam_set_id);
        }
        if (filters.user_id) {
          query = query.eq('user_id', filters.user_id);
        }
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
      }

      const { data, error } = await query;

      if (error) {
        this.handleError(error, 'getExamSessions');
      }

      return { data: data || [], error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create exam session
   */
  async createExamSession(sessionData: {
    exam_set_id: string;
    user_id: string;
    status?: string;
  }): Promise<{ data: any | null; error: any }> {
    this.log('createExamSession', sessionData);

    try {
      const { data, error } = await this.supabase
        .from(this.examSessionsTable)
        .insert([{
          ...sessionData,
          status: sessionData.status || 'in_progress',
          started_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        this.handleError(error, 'createExamSession');
      }

      return { data, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update exam session
   */
  async updateExamSession(sessionId: string, updates: any): Promise<{ data: any | null; error: any }> {
    this.log('updateExamSession', { sessionId, updates });

    try {
      const { data, error } = await this.supabase
        .from(this.examSessionsTable)
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        this.handleError(error, 'updateExamSession');
      }

      return { data, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get exam attempts
   */
  async getExamAttempts(sessionId: string): Promise<{ data: any[] | null; error: any }> {
    this.log('getExamAttempts', { sessionId });

    try {
      const { data, error } = await this.supabase
        .from(this.examAttemptsTable)
        .select(`
          *,
          questions (*)
        `)
        .eq('session_id', sessionId);

      if (error) {
        this.handleError(error, 'getExamAttempts');
      }

      return { data: data || [], error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Submit exam attempt
   */
  async submitExamAttempt(attemptData: {
    session_id: string;
    question_id: string;
    user_answer: string;
    time_spent?: number;
  }): Promise<{ data: any | null; error: any }> {
    this.log('submitExamAttempt', attemptData);

    try {
      const { data, error } = await this.supabase
        .from(this.examAttemptsTable)
        .insert([attemptData])
        .select()
        .single();

      if (error) {
        this.handleError(error, 'submitExamAttempt');
      }

      return { data, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get exam statistics
   */
  async getExamStats(examSetId?: string): Promise<{ data: any; error: any }> {
    this.log('getExamStats', { examSetId });

    try {
      let examSetsQuery = this.supabase
        .from(this.examSetsTable)
        .select('*');

      if (examSetId) {
        examSetsQuery = examSetsQuery.eq('id', examSetId);
      }

      const { data: examSets, error: examSetsError } = await examSetsQuery;

      if (examSetsError) {
        this.handleError(examSetsError, 'getExamStats');
      }

      const examSetModels = (examSets || []).map(es => new ExamSetModel(es));

      const stats = {
        totalExamSets: examSetModels.length,
        activeExamSets: examSetModels.filter(es => es.is_active).length,
        byType: {} as Record<string, number>,
        byDifficulty: {
          easy: 0,
          medium: 0,
          hard: 0
        } as Record<Difficulty, number>,
        totalQuestions: examSetModels.reduce((sum, es) => sum + es.question_count, 0),
        averageTime: examSetModels.reduce((sum, es) => sum + es.time_limit, 0) / examSetModels.length || 0
      };

      examSetModels.forEach(es => {
        // Count by type
        stats.byType[es.type] = (stats.byType[es.type] || 0) + 1;
        
        // Count by difficulty
        stats.byDifficulty[es.difficulty]++;
      });

      return { data: stats, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Search exam sets
   */
  async searchExamSets(searchTerm: string): Promise<{ data: ExamSetModel[] | null; error: any }> {
    this.log('searchExamSets', { searchTerm });

    try {
      const { data, error } = await this.searchData(
        this.examSetsTable,
        searchTerm,
        ['title', 'description']
      );

      if (error) {
        this.handleError(error, 'searchExamSets');
      }

      const examSetModels = (data || []).map(es => new ExamSetModel(es));
      return { data: examSetModels, error: null };

    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get exam sets count
   */
  async getExamSetsCount(filters?: {
    type?: DrillType;
    difficulty?: Difficulty;
    is_active?: boolean;
  }): Promise<{ count: number | null; error: any }> {
    this.log('getExamSetsCount', filters);

    return this.countData(this.examSetsTable, filters);
  }
}
