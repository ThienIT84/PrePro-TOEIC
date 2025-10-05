/**
 * ClassManagementController
 * Business logic cho Class Management
 * Extracted từ ClassManagement.tsx
 */

export interface ClassInfo {
  id: string;
  name: string;
  description: string;
  student_count: number;
  created_at: string;
  avg_score: number;
  completion_rate: number;
  students: Array<{
    id: string;
    name: string;
    email: string;
    avg_score: number;
    last_activity: string;
  }>;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avg_score: number;
  last_activity: string;
  is_in_class: boolean;
}

export interface ClassFormData {
  name: string;
  description: string;
}

export interface ClassManagementState {
  classes: ClassInfo[];
  students: Student[];
  loading: boolean;
  selectedClass: ClassInfo | null;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  newClass: ClassFormData;
}

export class ClassManagementController {
  private state: ClassManagementState;
  private listeners: Array<(state: ClassManagementState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): ClassManagementState {
    return {
      classes: [],
      students: [],
      loading: false,
      selectedClass: null,
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      newClass: {
        name: '',
        description: ''
      }
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: ClassManagementState) => void): () => void {
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
  private setState(updates: Partial<ClassManagementState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): ClassManagementState {
    return { ...this.state };
  }

  /**
   * Set classes
   */
  public setClasses(classes: ClassInfo[]): void {
    this.setState({ classes });
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
   * Set selected class
   */
  public setSelectedClass(selectedClass: ClassInfo | null): void {
    this.setState({ selectedClass });
  }

  /**
   * Set create dialog open state
   */
  public setCreateDialogOpen(isOpen: boolean): void {
    this.setState({ isCreateDialogOpen: isOpen });
  }

  /**
   * Set edit dialog open state
   */
  public setEditDialogOpen(isOpen: boolean): void {
    this.setState({ isEditDialogOpen: isOpen });
  }

  /**
   * Set new class form data
   */
  public setNewClass(newClass: ClassFormData): void {
    this.setState({ newClass });
  }

  /**
   * Update new class form field
   */
  public updateNewClassField(field: keyof ClassFormData, value: string): void {
    this.setState({
      newClass: {
        ...this.state.newClass,
        [field]: value
      }
    });
  }

  /**
   * Create a new class
   */
  public createClass(): { success: boolean; error?: string } {
    if (!this.state.newClass.name.trim()) {
      return { success: false, error: 'Vui lòng nhập tên lớp học.' };
    }

    try {
      const newClassData: ClassInfo = {
        id: `class_${Date.now()}`,
        name: this.state.newClass.name,
        description: this.state.newClass.description,
        student_count: 0,
        created_at: new Date().toISOString(),
        avg_score: 0,
        completion_rate: 0,
        students: []
      };

      this.setState({
        classes: [...this.state.classes, newClassData],
        newClass: { name: '', description: '' },
        isCreateDialogOpen: false
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Không thể tạo lớp học.' };
    }
  }

  /**
   * Delete a class
   */
  public deleteClass(classId: string): { success: boolean; error?: string } {
    try {
      this.setState({
        classes: this.state.classes.filter(c => c.id !== classId)
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Không thể xóa lớp học.' };
    }
  }

  /**
   * Add student to class
   */
  public addStudentToClass(classId: string, studentId: string): { success: boolean; error?: string } {
    try {
      const student = this.state.students.find(s => s.id === studentId);
      if (!student) {
        return { success: false, error: 'Không tìm thấy học viên.' };
      }

      this.setState({
        classes: this.state.classes.map(c => {
          if (c.id === classId) {
            if (!c.students.find(s => s.id === studentId)) {
              return {
                ...c,
                students: [...c.students, student],
                student_count: c.student_count + 1
              };
            }
          }
          return c;
        })
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Không thể thêm học viên vào lớp.' };
    }
  }

  /**
   * Remove student from class
   */
  public removeStudentFromClass(classId: string, studentId: string): { success: boolean; error?: string } {
    try {
      this.setState({
        classes: this.state.classes.map(c => {
          if (c.id === classId) {
            return {
              ...c,
              students: c.students.filter(s => s.id !== studentId),
              student_count: c.student_count - 1
            };
          }
          return c;
        })
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Không thể xóa học viên khỏi lớp.' };
    }
  }

  /**
   * Get available students for a class (not already in the class)
   */
  public getAvailableStudentsForClass(classId: string): Student[] {
    const classInfo = this.state.classes.find(c => c.id === classId);
    if (!classInfo) return [];

    return this.state.students.filter(s => 
      !classInfo.students.find(cs => cs.id === s.id)
    );
  }

  /**
   * Get class by ID
   */
  public getClassById(classId: string): ClassInfo | null {
    return this.state.classes.find(c => c.id === classId) || null;
  }

  /**
   * Get student by ID
   */
  public getStudentById(studentId: string): Student | null {
    return this.state.students.find(s => s.id === studentId) || null;
  }

  /**
   * Calculate class statistics
   */
  public calculateClassStatistics(classId: string): {
    totalStudents: number;
    avgScore: number;
    completionRate: number;
  } {
    const classInfo = this.getClassById(classId);
    if (!classInfo) {
      return { totalStudents: 0, avgScore: 0, completionRate: 0 };
    }

    const totalStudents = classInfo.students.length;
    const avgScore = totalStudents > 0 
      ? Math.round(classInfo.students.reduce((sum, s) => sum + s.avg_score, 0) / totalStudents)
      : 0;
    
    // Mock completion rate calculation
    const completionRate = totalStudents > 0 
      ? Math.round((classInfo.students.filter(s => s.avg_score > 0).length / totalStudents) * 100)
      : 0;

    return {
      totalStudents,
      avgScore,
      completionRate
    };
  }

  /**
   * Get class analytics data
   */
  public getClassAnalytics(classId: string): {
    scoreDistribution: { range: string; count: number }[];
    activityTrend: { date: string; activity: number }[];
    topPerformers: Student[];
    strugglingStudents: Student[];
  } {
    const classInfo = this.getClassById(classId);
    if (!classInfo) {
      return {
        scoreDistribution: [],
        activityTrend: [],
        topPerformers: [],
        strugglingStudents: []
      };
    }

    // Score distribution
    const scoreDistribution = [
      { range: '0-20%', count: classInfo.students.filter(s => s.avg_score >= 0 && s.avg_score <= 20).length },
      { range: '21-40%', count: classInfo.students.filter(s => s.avg_score >= 21 && s.avg_score <= 40).length },
      { range: '41-60%', count: classInfo.students.filter(s => s.avg_score >= 41 && s.avg_score <= 60).length },
      { range: '61-80%', count: classInfo.students.filter(s => s.avg_score >= 61 && s.avg_score <= 80).length },
      { range: '81-100%', count: classInfo.students.filter(s => s.avg_score >= 81 && s.avg_score <= 100).length }
    ];

    // Mock activity trend (last 7 days)
    const activityTrend = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activity: Math.floor(Math.random() * 20) + 5
    })).reverse();

    // Top performers (top 3)
    const topPerformers = [...classInfo.students]
      .sort((a, b) => b.avg_score - a.avg_score)
      .slice(0, 3);

    // Struggling students (bottom 3)
    const strugglingStudents = [...classInfo.students]
      .sort((a, b) => a.avg_score - b.avg_score)
      .slice(0, 3);

    return {
      scoreDistribution,
      activityTrend,
      topPerformers,
      strugglingStudents
    };
  }

  /**
   * Export class report
   */
  public exportClassReport(classId: string): { success: boolean; error?: string } {
    const classInfo = this.getClassById(classId);
    if (!classInfo) {
      return { success: false, error: 'Không tìm thấy lớp học.' };
    }

    // In real implementation, you'd generate and download a report
    // For now, just return success
    return { success: true };
  }

  /**
   * Validate class form
   */
  public validateClassForm(formData: ClassFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Tên lớp học không được để trống');
    }

    if (formData.name.length > 100) {
      errors.push('Tên lớp học không được quá 100 ký tự');
    }

    if (formData.description.length > 500) {
      errors.push('Mô tả không được quá 500 ký tự');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Search classes
   */
  public searchClasses(query: string): ClassInfo[] {
    if (!query.trim()) return this.state.classes;

    const lowercaseQuery = query.toLowerCase();
    return this.state.classes.filter(c => 
      c.name.toLowerCase().includes(lowercaseQuery) ||
      c.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Search students
   */
  public searchStudents(query: string): Student[] {
    if (!query.trim()) return this.state.students;

    const lowercaseQuery = query.toLowerCase();
    return this.state.students.filter(s => 
      s.name.toLowerCase().includes(lowercaseQuery) ||
      s.email.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get class summary statistics
   */
  public getClassSummaryStatistics(): {
    totalClasses: number;
    totalStudents: number;
    avgClassSize: number;
    avgScore: number;
  } {
    const totalClasses = this.state.classes.length;
    const totalStudents = this.state.classes.reduce((sum, c) => sum + c.student_count, 0);
    const avgClassSize = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;
    
    const allStudents = this.state.classes.flatMap(c => c.students);
    const avgScore = allStudents.length > 0 
      ? Math.round(allStudents.reduce((sum, s) => sum + s.avg_score, 0) / allStudents.length)
      : 0;

    return {
      totalClasses,
      totalStudents,
      avgClassSize,
      avgScore
    };
  }

  /**
   * Reset form
   */
  public resetForm(): void {
    this.setState({
      newClass: { name: '', description: '' }
    });
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.listeners = [];
  }
}
