/**
 * ExamSessionManager
 * Quản lý session thi và auto-save
 */

import { supabase } from '@/integrations/supabase/client';
import { ExamSet, Question } from '@/types';

export interface ExamSessionData {
  sessionId: string | null;
  examSetId: string;
  questions: Question[];
  answers: Map<string, { questionId: string; answer: string; timeSpent: number }>;
  currentIndex: number;
  timeLeft: number;
  isStarted: boolean;
  isPaused: boolean;
  selectedParts?: number[];
  timeMode: 'standard' | 'unlimited';
  startedAt: string | null;
}

export class ExamSessionManager {
  private static instance: ExamSessionManager;
  private currentSession: ExamSessionData | null = null;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private readonly AUTO_SAVE_INTERVAL = 30000; // 30 giây

  public static getInstance(): ExamSessionManager {
    if (!ExamSessionManager.instance) {
      ExamSessionManager.instance = new ExamSessionManager();
    }
    return ExamSessionManager.instance;
  }

  /**
   * Khởi tạo session mới
   */
  public async createSession(
    examSetId: string,
    questions: Question[],
    selectedParts?: number[],
    timeMode: 'standard' | 'unlimited' = 'standard'
  ): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Tạo session trong database
      const { data: sessionData, error } = await supabase
        .from('exam_sessions')
        .insert({
          user_id: user.id,
          exam_set_id: examSetId,
          total_questions: questions.length,
          correct_answers: 0,
          score: 0,
          time_spent: 0,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          results: {
            served_question_ids: questions.map(q => q.id),
            selected_parts: selectedParts || null,
            time_mode: timeMode
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Khởi tạo session data
      this.currentSession = {
        sessionId: sessionData.id,
        examSetId,
        questions,
        answers: new Map(),
        currentIndex: 0,
        timeLeft: this.calculateTimeLeft(questions, selectedParts, timeMode),
        isStarted: false,
        isPaused: false,
        selectedParts,
        timeMode,
        startedAt: sessionData.started_at
      };

      // Bắt đầu auto-save
      this.startAutoSave();

      // Lưu vào localStorage để phục hồi khi refresh
      this.saveToLocalStorage();

      return sessionData.id;
    } catch (error) {
      console.error('Error creating exam session:', error);
      throw error;
    }
  }

  /**
   * Resume session từ database
   */
  public async resumeSession(sessionId: string): Promise<ExamSessionData | null> {
    try {
      const { data: sessionData, error } = await supabase
        .from('exam_sessions')
        .select(`
          *,
          exam_sets (*)
        `)
        .eq('id', sessionId)
        .eq('status', 'in_progress')
        .single();

      if (error || !sessionData) return null;

      // Lấy câu hỏi
      const servedQuestionIds = (sessionData.results as any)?.served_question_ids || [];
      const { data: questions } = await supabase
        .from('questions')
        .select('*')
        .in('id', servedQuestionIds);

      if (!questions) return null;

      // Lấy câu trả lời đã lưu
      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('question_id, user_answer, time_spent')
        .eq('session_id', sessionId);

      const answers = new Map();
      attempts?.forEach(attempt => {
        answers.set(attempt.question_id, {
          questionId: attempt.question_id,
          answer: attempt.user_answer || '',
          timeSpent: attempt.time_spent || 0
        });
      });

      // Khôi phục session data
      this.currentSession = {
        sessionId: sessionData.id,
        examSetId: sessionData.exam_set_id!,
        questions: questions as Question[],
        answers,
        currentIndex: 0, // Sẽ được tính toán dựa trên progress
        timeLeft: this.calculateRemainingTime(sessionData),
        isStarted: true,
        isPaused: false,
        selectedParts: (sessionData.results as any)?.selected_parts,
        timeMode: (sessionData.results as any)?.time_mode || 'standard',
        startedAt: sessionData.started_at
      };

      // Bắt đầu auto-save
      this.startAutoSave();

      return this.currentSession;
    } catch (error) {
      console.error('Error resuming session:', error);
      return null;
    }
  }

  /**
   * Auto-save session data
   */
  public async autoSave(): Promise<void> {
    if (!this.currentSession?.sessionId) return;

    try {
      // Lưu progress vào database
      await supabase
        .from('exam_sessions')
        .update({
          time_spent: this.calculateTimeSpent(),
          updated_at: new Date().toISOString(),
          results: {
            ...(this.currentSession as any).results,
            current_index: this.currentSession.currentIndex,
            time_left: this.currentSession.timeLeft,
            answers: Array.from(this.currentSession.answers.entries())
          }
        })
        .eq('id', this.currentSession.sessionId);

      // Lưu câu trả lời vào exam_attempts
      const attempts = Array.from(this.currentSession.answers.values()).map(answer => ({
        session_id: this.currentSession!.sessionId!,
        question_id: answer.questionId,
        user_answer: answer.answer,
        time_spent: answer.timeSpent
      }));

      if (attempts.length > 0) {
        // Upsert attempts (update nếu tồn tại, insert nếu chưa có)
        await supabase
          .from('exam_attempts')
          .upsert(attempts, { 
            onConflict: 'session_id,question_id',
            ignoreDuplicates: false 
          });
      }

      // Lưu vào localStorage
      this.saveToLocalStorage();

      console.log('Auto-save completed');
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }

  /**
   * Hoàn thành session
   */
  public async completeSession(): Promise<void> {
    if (!this.currentSession?.sessionId) return;

    try {
      // Tính toán kết quả cuối cùng
      const correctAnswers = Array.from(this.currentSession.answers.values())
        .filter(answer => {
          const question = this.currentSession!.questions.find(q => q.id === answer.questionId);
          return question && answer.answer === question.correct_choice;
        }).length;

      const score = Math.round((correctAnswers / this.currentSession.questions.length) * 100);
      const timeSpent = this.calculateTimeSpent();

      // Cập nhật session status
      await supabase
        .from('exam_sessions')
        .update({
          status: 'completed',
          correct_answers: correctAnswers,
          score: score,
          time_spent: timeSpent,
          completed_at: new Date().toISOString()
        })
        .eq('id', this.currentSession.sessionId);

      // Lưu attempts cuối cùng
      await this.autoSave();

      // Dọn dẹp
      this.stopAutoSave();
      this.clearLocalStorage();
      this.currentSession = null;

    } catch (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  }

  /**
   * Hủy session
   */
  public async cancelSession(): Promise<void> {
    if (!this.currentSession?.sessionId) return;

    try {
      await supabase
        .from('exam_sessions')
        .update({
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('id', this.currentSession.sessionId);

      this.stopAutoSave();
      this.clearLocalStorage();
      this.currentSession = null;
    } catch (error) {
      console.error('Error cancelling session:', error);
    }
  }

  /**
   * Lưu câu trả lời
   */
  public saveAnswer(questionId: string, answer: string, timeSpent: number = 0): void {
    if (!this.currentSession) return;

    this.currentSession.answers.set(questionId, {
      questionId,
      answer,
      timeSpent
    });
  }

  /**
   * Cập nhật progress
   */
  public updateProgress(currentIndex: number, timeLeft: number): void {
    if (!this.currentSession) return;

    this.currentSession.currentIndex = currentIndex;
    this.currentSession.timeLeft = timeLeft;
  }

  /**
   * Lấy session hiện tại
   */
  public getCurrentSession(): ExamSessionData | null {
    return this.currentSession;
  }

  /**
   * Kiểm tra có session đang active không
   */
  public hasActiveSession(): boolean {
    return this.currentSession !== null && this.currentSession.sessionId !== null;
  }

  /**
   * Bắt đầu auto-save
   */
  private startAutoSave(): void {
    this.stopAutoSave();
    this.autoSaveInterval = setInterval(() => {
      this.autoSave();
    }, this.AUTO_SAVE_INTERVAL);
  }

  /**
   * Dừng auto-save
   */
  private stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  /**
   * Lưu vào localStorage
   */
  private saveToLocalStorage(): void {
    if (!this.currentSession) return;

    try {
      const sessionData = {
        ...this.currentSession,
        answers: Array.from(this.currentSession.answers.entries())
      };
      localStorage.setItem('exam_session', JSON.stringify(sessionData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Khôi phục từ localStorage
   */
  public restoreFromLocalStorage(): ExamSessionData | null {
    try {
      const saved = localStorage.getItem('exam_session');
      if (!saved) return null;

      const sessionData = JSON.parse(saved);
      sessionData.answers = new Map(sessionData.answers);
      
      return sessionData;
    } catch (error) {
      console.error('Error restoring from localStorage:', error);
      return null;
    }
  }

  /**
   * Xóa localStorage
   */
  private clearLocalStorage(): void {
    localStorage.removeItem('exam_session');
  }

  /**
   * Tính toán thời gian còn lại
   */
  private calculateTimeLeft(
    questions: Question[], 
    selectedParts?: number[], 
    timeMode: 'standard' | 'unlimited' = 'standard'
  ): number {
    if (timeMode === 'unlimited') return -1;

    // Logic tính toán thời gian dựa trên selected parts
    // Implementation tương tự như trong ExamSession
    return 0; // Placeholder
  }

  /**
   * Tính toán thời gian đã sử dụng
   */
  private calculateTimeSpent(): number {
    if (!this.currentSession) return 0;

    const totalTime = this.calculateTotalTime();
    return Math.max(0, totalTime - this.currentSession.timeLeft);
  }

  /**
   * Tính toán thời gian còn lại từ database
   */
  private calculateRemainingTime(sessionData: any): number {
    // Logic tính toán dựa trên started_at và time_limit
    return 0; // Placeholder
  }

  /**
   * Tính tổng thời gian
   */
  private calculateTotalTime(): number {
    if (!this.currentSession) return 0;

    // Logic tính toán tổng thời gian
    return 0; // Placeholder
  }
}

export const examSessionManager = ExamSessionManager.getInstance();
