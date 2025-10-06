/**
 * StudentListController
 * Business logic cho Student List Management
 * Extracted từ StudentListWithFilters.tsx
 */

import { StudentProfile } from '@/services/teacherAnalytics';

export interface StudentWithStatus extends StudentProfile {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  lastScore: number;
  targetScore: number;
  progress: number;
  lastActivityTime: string;
  status: 'Active' | 'Inactive' | 'At Risk';
}

export interface FilterState {
  level: string;
  status: string;
  scoreRange: string;
  progress: string;
  lastActivity: string;
  searchTerm: string;
}

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: (selectedIds: string[]) => void;
}

export interface StudentListState {
  students: StudentWithStatus[];
  loading: boolean;
  selectedStudents: string[];
  filters: FilterState;
  showFilters: boolean;
  isBulkActionOpen: boolean;
  bulkMessage: string;
}

export class StudentListController {
  private state: StudentListState;
  private listeners: Array<(state: StudentListState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): StudentListState {
    return {
      students: [],
      loading: false,
      selectedStudents: [],
      filters: {
        level: 'all',
        status: 'all',
        scoreRange: 'all',
        progress: 'all',
        lastActivity: 'all',
        searchTerm: ''
      },
      showFilters: false,
      isBulkActionOpen: false,
      bulkMessage: '',
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: StudentListState) => void): () => void {
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
  private setState(updates: Partial<StudentListState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): StudentListState {
    return { ...this.state };
  }

  /**
   * Load mock students data
   */
  public loadStudents(): void {
    this.setState({ loading: true });

    const mockStudents: StudentWithStatus[] = [
      {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@email.com',
        target_score: 800,
        test_date: '2024-06-01',
        created_at: '2024-01-01',
        last_activity: '2024-01-20T10:30:00Z',
        total_attempts: 150,
        avg_score: 720,
        completion_rate: 85,
        streak_days: 7,
        weak_areas: ['grammar'],
        strong_areas: ['vocabulary', 'reading'],
        level: 'Intermediate',
        lastScore: 720,
        targetScore: 800,
        progress: 65,
        lastActivityTime: '2h trước',
        status: 'Active'
      },
      {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@email.com',
        target_score: 600,
        test_date: '2024-07-01',
        created_at: '2024-01-15',
        last_activity: '2024-01-19T15:45:00Z',
        total_attempts: 80,
        avg_score: 450,
        completion_rate: 60,
        streak_days: 2,
        weak_areas: ['listening', 'vocabulary'],
        strong_areas: ['grammar'],
        level: 'Beginner',
        lastScore: 450,
        targetScore: 600,
        progress: 45,
        lastActivityTime: '1 ngày trước',
        status: 'At Risk'
      },
      {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@email.com',
        target_score: 900,
        test_date: '2024-05-01',
        created_at: '2023-12-01',
        last_activity: '2024-01-20T13:20:00Z',
        total_attempts: 200,
        avg_score: 850,
        completion_rate: 95,
        streak_days: 15,
        weak_areas: [],
        strong_areas: ['vocabulary', 'grammar', 'listening', 'reading'],
        level: 'Advanced',
        lastScore: 850,
        targetScore: 900,
        progress: 85,
        lastActivityTime: '3 giờ trước',
        status: 'Active'
      },
      {
        id: '4',
        name: 'Phạm Thị D',
        email: 'phamthid@email.com',
        target_score: 700,
        test_date: '2024-08-01',
        created_at: '2024-01-10',
        last_activity: '2024-01-15T09:15:00Z',
        total_attempts: 120,
        avg_score: 580,
        completion_rate: 75,
        streak_days: 0,
        weak_areas: ['reading'],
        strong_areas: ['vocabulary'],
        level: 'Intermediate',
        lastScore: 580,
        targetScore: 700,
        progress: 55,
        lastActivityTime: '5 ngày trước',
        status: 'Inactive'
      },
      {
        id: '5',
        name: 'Hoàng Văn E',
        email: 'hoangvane@email.com',
        target_score: 500,
        test_date: '2024-09-01',
        created_at: '2024-01-05',
        last_activity: '2024-01-20T16:30:00Z',
        total_attempts: 60,
        avg_score: 380,
        completion_rate: 50,
        streak_days: 3,
        weak_areas: ['vocabulary', 'grammar'],
        strong_areas: ['listening'],
        level: 'Beginner',
        lastScore: 380,
        targetScore: 500,
        progress: 35,
        lastActivityTime: '1 giờ trước',
        status: 'At Risk'
      }
    ];

    this.setState({ students: mockStudents, loading: false });
  }

  /**
   * Filter students based on current filters
   */
  public getFilteredStudents(): StudentWithStatus[] {
    return this.state.students.filter(student => {
      // Level filter
      if (this.state.filters.level !== 'all' && student.level !== this.state.filters.level) {
        return false;
      }

      // Status filter
      if (this.state.filters.status !== 'all' && student.status !== this.state.filters.status) {
        return false;
      }

      // Score range filter
      if (this.state.filters.scoreRange !== 'all') {
        const score = student.lastScore;
        switch (this.state.filters.scoreRange) {
          case '0-400':
            if (score < 0 || score > 400) return false;
            break;
          case '400-600':
            if (score < 400 || score > 600) return false;
            break;
          case '600-800':
            if (score < 600 || score > 800) return false;
            break;
          case '800-990':
            if (score < 800 || score > 990) return false;
            break;
        }
      }

      // Progress filter
      if (this.state.filters.progress !== 'all') {
        const progress = student.progress;
        switch (this.state.filters.progress) {
          case '<50%':
            if (progress >= 50) return false;
            break;
          case '50-80%':
            if (progress < 50 || progress > 80) return false;
            break;
          case '>80%':
            if (progress <= 80) return false;
            break;
        }
      }

      // Last activity filter
      if (this.state.filters.lastActivity !== 'all') {
        const lastActivity = new Date(student.last_activity);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

        switch (this.state.filters.lastActivity) {
          case 'Today':
            if (diffDays > 0) return false;
            break;
          case 'This Week':
            if (diffDays > 7) return false;
            break;
          case 'This Month':
            if (diffDays > 30) return false;
            break;
          case '>1 Month':
            if (diffDays <= 30) return false;
            break;
        }
      }

      // Search filter
      if (this.state.filters.searchTerm) {
        const searchLower = this.state.filters.searchTerm.toLowerCase();
        if (!student.name.toLowerCase().includes(searchLower) && 
            !student.email.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Update filters
   */
  public updateFilters(updates: Partial<FilterState>): void {
    this.setState({
      filters: { ...this.state.filters, ...updates }
    });
  }

  /**
   * Clear all filters
   */
  public clearFilters(): void {
    this.setState({
      filters: {
        level: 'all',
        status: 'all',
        scoreRange: 'all',
        progress: 'all',
        lastActivity: 'all',
        searchTerm: ''
      }
    });
  }

  /**
   * Toggle filters visibility
   */
  public toggleFilters(): void {
    this.setState({ showFilters: !this.state.showFilters });
  }

  /**
   * Handle select all students
   */
  public handleSelectAll(): void {
    const filteredStudents = this.getFilteredStudents();
    if (this.state.selectedStudents.length === filteredStudents.length) {
      this.setState({ selectedStudents: [] });
    } else {
      this.setState({ selectedStudents: filteredStudents.map(s => s.id) });
    }
  }

  /**
   * Handle select individual student
   */
  public handleSelectStudent(studentId: string): void {
    const isSelected = this.state.selectedStudents.includes(studentId);
    if (isSelected) {
      this.setState({
        selectedStudents: this.state.selectedStudents.filter(id => id !== studentId)
      });
    } else {
      this.setState({
        selectedStudents: [...this.state.selectedStudents, studentId]
      });
    }
  }

  /**
   * Get bulk actions
   */
  public getBulkActions(): BulkAction[] {
    return [
      {
        id: 'send-notification',
        label: 'Gửi thông báo',
        icon: 'Send',
        action: (selectedIds: string[]) => {
          this.setState({ isBulkActionOpen: true });
        }
      },
      {
        id: 'assign-homework',
        label: 'Gán bài tập',
        icon: 'BookOpen',
        action: (selectedIds: string[]) => {
          // Handle assign homework
        }
      },
      {
        id: 'export-data',
        label: 'Export data',
        icon: 'Download',
        action: (selectedIds: string[]) => {
          // Handle export data
        }
      }
    ];
  }

  /**
   * Set bulk message
   */
  public setBulkMessage(message: string): void {
    this.setState({ bulkMessage: message });
  }

  /**
   * Send bulk message
   */
  public sendBulkMessage(): void {
    this.setState({ 
      isBulkActionOpen: false,
      bulkMessage: ''
    });
  }

  /**
   * Close bulk action dialog
   */
  public closeBulkActionDialog(): void {
    this.setState({ isBulkActionOpen: false });
  }

  /**
   * Get status icon component name
   */
  public getStatusIcon(status: string): string {
    switch (status) {
      case 'Active': return 'CheckCircle';
      case 'At Risk': return 'AlertTriangle';
      case 'Inactive': return 'Clock';
      default: return 'Users';
    }
  }

  /**
   * Get status badge variant
   */
  public getStatusBadge(status: string): { variant: string; className: string; text: string } {
    switch (status) {
      case 'Active': 
        return { 
          variant: 'default', 
          className: 'bg-green-100 text-green-800', 
          text: '🟢 Active' 
        };
      case 'At Risk': 
        return { 
          variant: 'secondary', 
          className: 'bg-yellow-100 text-yellow-800', 
          text: '🟡 Warning' 
        };
      case 'Inactive': 
        return { 
          variant: 'destructive', 
          className: 'bg-red-100 text-red-800', 
          text: '🔴 Inactive' 
        };
      default: 
        return { 
          variant: 'outline', 
          className: '', 
          text: status 
        };
    }
  }

  /**
   * Get level badge variant
   */
  public getLevelBadge(level: string): { variant: string; className: string; text: string } {
    switch (level) {
      case 'Beginner': 
        return { 
          variant: 'secondary', 
          className: 'bg-blue-100 text-blue-800', 
          text: 'Beginner' 
        };
      case 'Intermediate': 
        return { 
          variant: 'default', 
          className: 'bg-purple-100 text-purple-800', 
          text: 'Intermediate' 
        };
      case 'Advanced': 
        return { 
          variant: 'destructive', 
          className: 'bg-orange-100 text-orange-800', 
          text: 'Advanced' 
        };
      default: 
        return { 
          variant: 'outline', 
          className: '', 
          text: level 
        };
    }
  }

  /**
   * Get active filters count
   */
  public getActiveFiltersCount(): number {
    return Object.values(this.state.filters).filter(value => value !== 'all' && value !== '').length;
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    const filteredStudents = this.getFilteredStudents();
    const totalStudents = this.state.students.length;
    const selectedCount = this.state.selectedStudents.length;
    const activeCount = this.state.students.filter(s => s.status === 'Active').length;
    const atRiskCount = this.state.students.filter(s => s.status === 'At Risk').length;
    const inactiveCount = this.state.students.filter(s => s.status === 'Inactive').length;

    return {
      totalStudents,
      filteredStudents: filteredStudents.length,
      selectedCount,
      activeCount,
      atRiskCount,
      inactiveCount,
      activeFiltersCount: this.getActiveFiltersCount()
    };
  }

  /**
   * Reset state
   */
  public reset(): void {
    this.setState(this.getInitialState());
  }
}
