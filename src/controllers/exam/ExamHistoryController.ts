/**
 * ExamHistoryController
 * Business logic cho Exam History
 * Extracted từ ExamHistory.tsx
 */

import { supabase } from '@/integrations/supabase/client';

export interface ExamHistoryState {
  exams: ExamHistoryItem[];
  loading: boolean;
  error: string | null;
}

export interface ExamHistoryItem {
  id: string;
  exam_set_id: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  time_spent: number;
  completed_at: string;
  exam_sets: {
    title: string;
    description: string | null;
  } | null;
}

export interface FetchExamHistoryParams {
  userId: string;
}

export class ExamHistoryController {
  private state: ExamHistoryState;
  private listeners: Array<(state: ExamHistoryState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): ExamHistoryState {
    return {
      exams: [],
      loading: true,
      error: null
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: ExamHistoryState) => void): () => void {
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
  private setState(updates: Partial<ExamHistoryState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): ExamHistoryState {
    return { ...this.state };
  }

  /**
   * Set exams
   */
  public setExams(exams: ExamHistoryItem[]): void {
    this.setState({ exams });
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Set error state
   */
  public setError(error: string | null): void {
    this.setState({ error });
  }

  /**
   * Fetch exam history from database
   */
  public async fetchExamHistory(params: FetchExamHistoryParams): Promise<{ success: boolean; error?: string }> {
    try {
      this.setLoading(true);
      this.setError(null);

      const { data, error } = await supabase
        .from('exam_sessions')
        .select(`
          id,
          exam_set_id,
          total_questions,
          correct_answers,
          score,
          time_spent,
          completed_at,
          exam_sets (title, description)
        `)
        .eq('user_id', params.userId)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching exam history:', error);
        this.setError('Không thể tải lịch sử bài thi');
        return { success: false, error: 'Không thể tải lịch sử bài thi' };
      }

      this.setExams(data || []);
      return { success: true };
    } catch (err: any) {
      console.error('Error:', err);
      this.setError('Có lỗi xảy ra khi tải dữ liệu');
      return { success: false, error: 'Có lỗi xảy ra khi tải dữ liệu' };
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Format time from seconds to MM:SS
   */
  public formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format date to Vietnamese locale
   */
  public formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get score color class
   */
  public getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get exam statistics
   */
  public getExamStatistics(): {
    totalExams: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    totalTimeSpent: number;
    averageTimeSpent: number;
  } {
    const exams = this.state.exams;
    const totalExams = exams.length;
    
    if (totalExams === 0) {
      return {
        totalExams: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalTimeSpent: 0,
        averageTimeSpent: 0
      };
    }

    const scores = exams.map(e => e.score);
    const times = exams.map(e => e.time_spent);
    
    const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalExams);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const totalTimeSpent = times.reduce((sum, time) => sum + time, 0);
    const averageTimeSpent = Math.round(totalTimeSpent / totalExams);

    return {
      totalExams,
      averageScore,
      highestScore,
      lowestScore,
      totalTimeSpent,
      averageTimeSpent
    };
  }

  /**
   * Get exams by score range
   */
  public getExamsByScoreRange(minScore: number, maxScore: number): ExamHistoryItem[] {
    return this.state.exams.filter(exam => exam.score >= minScore && exam.score <= maxScore);
  }

  /**
   * Get exams by date range
   */
  public getExamsByDateRange(startDate: string, endDate: string): ExamHistoryItem[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.state.exams.filter(exam => {
      const examDate = new Date(exam.completed_at);
      return examDate >= start && examDate <= end;
    });
  }

  /**
   * Get recent exams
   */
  public getRecentExams(limit: number = 5): ExamHistoryItem[] {
    return this.state.exams.slice(0, limit);
  }

  /**
   * Get best performing exams
   */
  public getBestPerformingExams(limit: number = 5): ExamHistoryItem[] {
    return this.state.exams
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get exam by ID
   */
  public getExamById(examId: string): ExamHistoryItem | null {
    return this.state.exams.find(exam => exam.id === examId) || null;
  }

  /**
   * Get exams by exam set ID
   */
  public getExamsByExamSet(examSetId: string): ExamHistoryItem[] {
    return this.state.exams.filter(exam => exam.exam_set_id === examSetId);
  }

  /**
   * Check if loading
   */
  public isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Check if has error
   */
  public hasError(): boolean {
    return this.state.error !== null;
  }

  /**
   * Get error message
   */
  public getError(): string | null {
    return this.state.error;
  }

  /**
   * Get exams
   */
  public getExams(): ExamHistoryItem[] {
    return this.state.exams;
  }

  /**
   * Check if has exams
   */
  public hasExams(): boolean {
    return this.state.exams.length > 0;
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
