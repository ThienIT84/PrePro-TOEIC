/**
 * StudentExamResultsController
 * Business logic cho Student Exam Results
 * Extracted từ StudentExamResults.tsx
 */

import { supabase } from '@/integrations/supabase/client';

export interface StudentExamResultsState {
  examResults: StudentExamResult[];
  studentStats: StudentStats[];
  loading: boolean;
  error: string | null;
  selectedStudent: string | null;
  viewingExamId: string | null;
}

export interface StudentExamResult {
  id: string;
  exam_set_id: string;
  user_id: string;
  total_questions: number;
  correct_answers: number;
  score: number;
  time_spent: number;
  completed_at: string;
  exam_sets: {
    title: string;
    description: string | null;
  } | null;
  profiles: {
    name: string | null;
    user_id: string;
  } | null;
}

export interface StudentStats {
  student_id: string;
  student_name: string;
  total_exams: number;
  average_score: number;
  best_score: number;
  latest_exam_date: string;
}

export interface FetchStudentExamResultsParams {
  teacherId: string;
}

export class StudentExamResultsController {
  private state: StudentExamResultsState;
  private listeners: Array<(state: StudentExamResultsState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): StudentExamResultsState {
    return {
      examResults: [],
      studentStats: [],
      loading: true,
      error: null,
      selectedStudent: null,
      viewingExamId: null
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: StudentExamResultsState) => void): () => void {
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
  private setState(updates: Partial<StudentExamResultsState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): StudentExamResultsState {
    return { ...this.state };
  }

  /**
   * Set exam results
   */
  public setExamResults(examResults: StudentExamResult[]): void {
    this.setState({ examResults });
  }

  /**
   * Set student stats
   */
  public setStudentStats(studentStats: StudentStats[]): void {
    this.setState({ studentStats });
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
   * Set selected student
   */
  public setSelectedStudent(selectedStudent: string | null): void {
    this.setState({ selectedStudent });
  }

  /**
   * Set viewing exam ID
   */
  public setViewingExamId(viewingExamId: string | null): void {
    this.setState({ viewingExamId });
  }

  /**
   * Fetch student exam results from database
   */
  public async fetchStudentExamResults(params: FetchStudentExamResultsParams): Promise<{ success: boolean; error?: string }> {
    try {
      this.setLoading(true);
      this.setError(null);

      // Get teacher's students
      const { data: students, error: studentsError } = await supabase.rpc('get_teacher_students', {
        teacher_uuid: params.teacherId
      });

      if (studentsError) {
        console.error('Error fetching students:', studentsError);
        this.setError('Không thể tải danh sách học sinh');
        return { success: false, error: 'Không thể tải danh sách học sinh' };
      }

      if (!students || students.length === 0) {
        this.setError('Bạn chưa có học sinh nào');
        return { success: false, error: 'Bạn chưa có học sinh nào' };
      }

      // Get exam results for all students
      const studentIds = students.map(s => s.student_id);
      const { data: results, error: resultsError } = await supabase
        .from('exam_sessions')
        .select(`
          id,
          exam_set_id,
          user_id,
          total_questions,
          correct_answers,
          score,
          time_spent,
          completed_at,
          exam_sets (title, description)
        `)
        .in('user_id', studentIds)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (resultsError) {
        console.error('Error fetching exam results:', resultsError);
        this.setError('Không thể tải kết quả thi');
        return { success: false, error: 'Không thể tải kết quả thi' };
      }

      // Get student profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', studentIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        this.setError('Không thể tải thông tin học sinh');
        return { success: false, error: 'Không thể tải thông tin học sinh' };
      }

      // Merge profile information into results
      const resultsWithProfiles = (results || []).map(result => ({
        ...result,
        profiles: profiles?.find(p => p.user_id === result.user_id) || null
      }));

      this.setExamResults(resultsWithProfiles);

      // Calculate statistics for each student
      const stats = students.map(student => {
        try {
          const studentResults = results?.filter(r => r.user_id === student.student_id) || [];
          const totalExams = studentResults.length;
          const averageScore = totalExams > 0 
            ? Math.round(studentResults.reduce((sum, r) => sum + r.score, 0) / totalExams)
            : 0;
          const bestScore = totalExams > 0 
            ? Math.max(...studentResults.map(r => r.score))
            : 0;
          const latestExamDate = totalExams > 0 
            ? studentResults[0].completed_at
            : '';

          return {
            student_id: student.student_id,
            student_name: student.student_name,
            total_exams: totalExams,
            average_score: averageScore,
            best_score: bestScore,
            latest_exam_date: latestExamDate
          };
        } catch (error) {
          console.error(`Error processing student ${student.student_name}:`, error);
          return {
            student_id: student.student_id,
            student_name: student.student_name,
            total_exams: 0,
            average_score: 0,
            best_score: 0,
            latest_exam_date: ''
          };
        }
      });

      this.setStudentStats(stats);

      return { success: true };
    } catch (error: unknown) {
      console.error('Error:', error);
      this.setError('Có lỗi xảy ra khi tải dữ liệu');
      return { success: false, error: 'Có lỗi xảy ra khi tải dữ liệu' };
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get filtered exam results
   */
  public getFilteredResults(): StudentExamResult[] {
    return this.state.selectedStudent 
      ? this.state.examResults.filter(r => r.user_id === this.state.selectedStudent)
      : this.state.examResults;
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
      month: 'short',
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
   * Get score badge variant
   */
  public getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  }

  /**
   * Get overview statistics
   */
  public getOverviewStatistics(): {
    totalStudents: number;
    totalExams: number;
    averageScore: number;
    highestScore: number;
  } {
    const totalStudents = this.state.studentStats.length;
    const totalExams = this.state.examResults.length;
    const averageScore = totalExams > 0 
      ? Math.round(this.state.examResults.reduce((sum, r) => sum + r.score, 0) / totalExams)
      : 0;
    const highestScore = totalExams > 0 
      ? Math.max(...this.state.examResults.map(r => r.score))
      : 0;

    return {
      totalStudents,
      totalExams,
      averageScore,
      highestScore
    };
  }

  /**
   * Get student statistics by ID
   */
  public getStudentStatistics(studentId: string): StudentStats | null {
    return this.state.studentStats.find(s => s.student_id === studentId) || null;
  }

  /**
   * Get exam results by student ID
   */
  public getExamResultsByStudent(studentId: string): StudentExamResult[] {
    return this.state.examResults.filter(r => r.user_id === studentId);
  }

  /**
   * Get exam results by exam set ID
   */
  public getExamResultsByExamSet(examSetId: string): StudentExamResult[] {
    return this.state.examResults.filter(r => r.exam_set_id === examSetId);
  }

  /**
   * Get recent exam results
   */
  public getRecentExamResults(limit: number = 10): StudentExamResult[] {
    return this.state.examResults.slice(0, limit);
  }

  /**
   * Get top performing students
   */
  public getTopPerformingStudents(limit: number = 5): StudentStats[] {
    return this.state.studentStats
      .filter(s => s.total_exams > 0)
      .sort((a, b) => b.average_score - a.average_score)
      .slice(0, limit);
  }

  /**
   * Get exam results by score range
   */
  public getExamResultsByScoreRange(minScore: number, maxScore: number): StudentExamResult[] {
    return this.state.examResults.filter(r => r.score >= minScore && r.score <= maxScore);
  }

  /**
   * Get exam results by date range
   */
  public getExamResultsByDateRange(startDate: string, endDate: string): StudentExamResult[] {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.state.examResults.filter(r => {
      const examDate = new Date(r.completed_at);
      return examDate >= start && examDate <= end;
    });
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
   * Get selected student
   */
  public getSelectedStudent(): string | null {
    return this.state.selectedStudent;
  }

  /**
   * Get viewing exam ID
   */
  public getViewingExamId(): string | null {
    return this.state.viewingExamId;
  }

  /**
   * Get exam results
   */
  public getExamResults(): StudentExamResult[] {
    return this.state.examResults;
  }

  /**
   * Get student stats
   */
  public getStudentStats(): StudentStats[] {
    return this.state.studentStats;
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
