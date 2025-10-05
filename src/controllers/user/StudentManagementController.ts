/**
 * StudentManagementController
 * Business logic cho Student Management
 * Extracted từ StudentManagement.tsx
 */

import { supabase } from '@/integrations/supabase/client';

export interface StudentManagementState {
  students: Student[];
  loading: boolean;
  error: string | null;
  reassigning: string | null;
}

export interface Student {
  student_id: string;
  student_name: string;
  student_email: string;
  assigned_at: string;
  status: string;
  notes: string | null;
  total_attempts: number;
  accuracy_percentage: number;
}

export interface StudentStatistics {
  totalStudents: number;
  activeStudents: number;
  totalAttempts: number;
  averageAccuracy: number;
}

export interface ReassignStudentParams {
  studentId: string;
  newTeacherId: string;
}

export interface UnassignStudentParams {
  studentId: string;
  studentName: string;
}

export class StudentManagementController {
  private state: StudentManagementState;
  private listeners: Array<(state: StudentManagementState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): StudentManagementState {
    return {
      students: [],
      loading: false,
      error: null,
      reassigning: null,
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: StudentManagementState) => void): () => void {
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
  private setState(updates: Partial<StudentManagementState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): StudentManagementState {
    return { ...this.state };
  }

  /**
   * Set students
   */
  public setStudents(students: Student[]): void {
    this.setState({ students });
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Set error
   */
  public setError(error: string | null): void {
    this.setState({ error });
  }

  /**
   * Set reassigning state
   */
  public setReassigning(reassigning: string | null): void {
    this.setState({ reassigning });
  }

  /**
   * Fetch students from database
   */
  public async fetchStudents(userId: string): Promise<{ success: boolean; data?: Student[]; error?: string }> {
    this.setLoading(true);
    this.setError(null);

    try {
      // Gọi function để lấy danh sách học viên
      const { data, error } = await supabase.rpc('get_teacher_students', {
        teacher_uuid: userId
      });

      if (error) {
        const errorMsg = `Lỗi function: ${error.message} (Code: ${error.code})`;
        this.setError(errorMsg);
        return {
          success: false,
          error: errorMsg
        };
      }

      const students = data || [];
      this.setStudents(students);

      if (students.length === 0) {
        this.setError('Không có học viên nào được gán cho bạn.');
      }

      return {
        success: true,
        data: students
      };
    } catch (error: any) {
      const errorMsg = `Lỗi không mong đợi: ${error.message}`;
      this.setError(errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Reassign student to different teacher
   */
  public async reassignStudent(params: ReassignStudentParams): Promise<{ success: boolean; error?: string }> {
    this.setReassigning(params.studentId);

    try {
      const { error } = await supabase.rpc('reassign_student', {
        student_uuid: params.studentId,
        new_teacher_uuid: params.newTeacherId
      });

      if (error) {
        return {
          success: false,
          error: `Không thể chuyển học viên: ${error.message}`
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: `Có lỗi xảy ra khi chuyển học viên: ${error.message}`
      };
    } finally {
      this.setReassigning(null);
    }
  }

  /**
   * Unassign student from teacher
   */
  public async unassignStudent(params: UnassignStudentParams, teacherId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('teacher_students')
        .delete()
        .eq('teacher_id', teacherId)
        .eq('student_id', params.studentId);

      if (error) {
        return {
          success: false,
          error: `Không thể bỏ gán học viên: ${error.message}`
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: `Có lỗi xảy ra: ${error.message}`
      };
    }
  }

  /**
   * Get student statistics
   */
  public getStudentStatistics(): StudentStatistics {
    const students = this.state.students;
    const activeStudents = students.filter(s => s.status === 'active');
    const totalAttempts = students.reduce((sum, s) => sum + s.total_attempts, 0);
    const averageAccuracy = students.length > 0 
      ? students.reduce((sum, s) => sum + s.accuracy_percentage, 0) / students.length 
      : 0;

    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      totalAttempts,
      averageAccuracy
    };
  }

  /**
   * Get active students
   */
  public getActiveStudents(): Student[] {
    return this.state.students.filter(s => s.status === 'active');
  }

  /**
   * Get student by ID
   */
  public getStudentById(studentId: string): Student | null {
    return this.state.students.find(s => s.student_id === studentId) || null;
  }

  /**
   * Get students by status
   */
  public getStudentsByStatus(status: string): Student[] {
    return this.state.students.filter(s => s.status === status);
  }

  /**
   * Get top performing students
   */
  public getTopPerformingStudents(limit: number = 5): Student[] {
    return this.state.students
      .sort((a, b) => b.accuracy_percentage - a.accuracy_percentage)
      .slice(0, limit);
  }

  /**
   * Get most active students
   */
  public getMostActiveStudents(limit: number = 5): Student[] {
    return this.state.students
      .sort((a, b) => b.total_attempts - a.total_attempts)
      .slice(0, limit);
  }

  /**
   * Get student performance summary
   */
  public getStudentPerformanceSummary(): {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    totalAttempts: number;
    averageAttempts: number;
    averageAccuracy: number;
    topPerformer: Student | null;
    mostActive: Student | null;
  } {
    const students = this.state.students;
    const activeStudents = students.filter(s => s.status === 'active');
    const inactiveStudents = students.filter(s => s.status !== 'active');
    const totalAttempts = students.reduce((sum, s) => sum + s.total_attempts, 0);
    const averageAttempts = students.length > 0 ? totalAttempts / students.length : 0;
    const averageAccuracy = students.length > 0 
      ? students.reduce((sum, s) => sum + s.accuracy_percentage, 0) / students.length 
      : 0;
    const topPerformer = students.reduce((top, current) => 
      (current.accuracy_percentage > (top?.accuracy_percentage || 0)) ? current : top, 
      students[0] || null
    );
    const mostActive = students.reduce((most, current) => 
      (current.total_attempts > (most?.total_attempts || 0)) ? current : most, 
      students[0] || null
    );

    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      inactiveStudents: inactiveStudents.length,
      totalAttempts,
      averageAttempts,
      averageAccuracy,
      topPerformer,
      mostActive
    };
  }

  /**
   * Format student name for display
   */
  public formatStudentName(student: Student): string {
    return student.student_name || 'Chưa có tên';
  }

  /**
   * Format student email for display
   */
  public formatStudentEmail(student: Student): string {
    return student.student_email;
  }

  /**
   * Format assigned date for display
   */
  public formatAssignedDate(assignedAt: string): string {
    return new Date(assignedAt).toLocaleDateString('vi-VN');
  }

  /**
   * Get student initials for avatar
   */
  public getStudentInitials(student: Student): string {
    const name = student.student_name || student.student_email;
    return name.charAt(0).toUpperCase();
  }

  /**
   * Get status badge variant
   */
  public getStatusBadgeVariant(status: string): 'default' | 'secondary' {
    return status === 'active' ? 'default' : 'secondary';
  }

  /**
   * Get status badge class
   */
  public getStatusBadgeClass(status: string): string {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  }

  /**
   * Get status display text
   */
  public getStatusDisplayText(status: string): string {
    return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
  }

  /**
   * Check if loading
   */
  public isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Check if reassigning
   */
  public isReassigning(studentId?: string): boolean {
    if (studentId) {
      return this.state.reassigning === studentId;
    }
    return this.state.reassigning !== null;
  }

  /**
   * Get error
   */
  public getError(): string | null {
    return this.state.error;
  }

  /**
   * Get students
   */
  public getStudents(): Student[] {
    return this.state.students;
  }

  /**
   * Clear error
   */
  public clearError(): void {
    this.setError(null);
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
