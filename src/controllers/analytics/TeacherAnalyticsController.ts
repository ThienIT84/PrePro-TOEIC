/**
 * TeacherAnalyticsController
 * Business logic cho Teacher Analytics Dashboard
 * Extracted từ TeacherAnalytics.tsx
 */

import { AnalyticsData, StudentProfile, ActivityEvent, AlertItem } from '@/services/teacherAnalytics';

export interface TeacherAnalyticsState {
  analyticsData: AnalyticsData | null;
  loading: boolean;
  selectedStudent: StudentProfile | null;
  activeTab: string;
  isStudentModalOpen: boolean;
}

export interface ChartData {
  date?: string;
  week?: string;
  count?: number;
  avg_score?: number;
  [key: string]: unknown;
}

export interface SkillPerformance {
  vocabulary: { avg_score: number; trend: number };
  grammar: { avg_score: number; trend: number };
  listening: { avg_score: number; trend: number };
  reading: { avg_score: number; trend: number };
}

export interface TrendData {
  value: number;
  trend: number;
  trendType: 'up' | 'down' | 'stable';
}

export class TeacherAnalyticsController {
  private state: TeacherAnalyticsState;
  private listeners: Array<(state: TeacherAnalyticsState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): TeacherAnalyticsState {
    return {
      analyticsData: null,
      loading: true,
      selectedStudent: null,
      activeTab: 'overview',
      isStudentModalOpen: false,
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: TeacherAnalyticsState) => void): () => void {
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
  private setState(updates: Partial<TeacherAnalyticsState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): TeacherAnalyticsState {
    return { ...this.state };
  }

  /**
   * Set analytics data
   */
  public setAnalyticsData(analyticsData: AnalyticsData | null): void {
    this.setState({ analyticsData });
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Set selected student
   */
  public setSelectedStudent(selectedStudent: StudentProfile | null): void {
    this.setState({ selectedStudent });
  }

  /**
   * Set active tab
   */
  public setActiveTab(activeTab: string): void {
    this.setState({ activeTab });
  }

  /**
   * Set student modal open state
   */
  public setStudentModalOpen(isOpen: boolean): void {
    this.setState({ isStudentModalOpen: isOpen });
  }

  /**
   * Get trend icon type
   */
  public getTrendIconType(trend: number): 'up' | 'down' | 'stable' {
    if (trend > 0) return 'up';
    if (trend < 0) return 'down';
    return 'stable';
  }

  /**
   * Get trend color class
   */
  public getTrendColorClass(trend: number): string {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  /**
   * Get alert icon type
   */
  public getAlertIconType(type: string): 'warning' | 'success' | 'danger' | 'info' {
    switch (type) {
      case 'warning': return 'warning';
      case 'success': return 'success';
      case 'danger': return 'danger';
      default: return 'info';
    }
  }

  /**
   * Get skill icon type
   */
  public getSkillIconType(skill: string): 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'target' {
    switch (skill) {
      case 'vocabulary': return 'vocabulary';
      case 'grammar': return 'grammar';
      case 'listening': return 'listening';
      case 'reading': return 'reading';
      default: return 'target';
    }
  }

  /**
   * Get safe analytics data with fallbacks
   */
  public getSafeAnalyticsData(): AnalyticsData | null {
    if (!this.state.analyticsData) return null;

    return {
      ...this.state.analyticsData,
      students: this.state.analyticsData.students || [],
      classes: this.state.analyticsData.classes || [],
      recent_activities: this.state.analyticsData.recent_activities || [],
      alerts: this.state.analyticsData.alerts || [],
      daily_activity: this.state.analyticsData.daily_activity || [],
      weekly_progress: this.state.analyticsData.weekly_progress || [],
      skill_performance: this.state.analyticsData.skill_performance || {
        vocabulary: { avg_score: 0, trend: 0 },
        grammar: { avg_score: 0, trend: 0 },
        listening: { avg_score: 0, trend: 0 },
        reading: { avg_score: 0, trend: 0 }
      }
    };
  }

  /**
   * Get key metrics
   */
  public getKeyMetrics(): {
    totalStudents: TrendData;
    activeToday: TrendData;
    avgScore: TrendData;
    completionRate: TrendData;
  } {
    const data = this.getSafeAnalyticsData();
    if (!data) {
      return {
        totalStudents: { value: 0, trend: 0, trendType: 'stable' },
        activeToday: { value: 0, trend: 0, trendType: 'stable' },
        avgScore: { value: 0, trend: 0, trendType: 'stable' },
        completionRate: { value: 0, trend: 0, trendType: 'stable' }
      };
    }

    return {
      totalStudents: {
        value: data.total_students,
        trend: data.students_trend,
        trendType: this.getTrendIconType(data.students_trend)
      },
      activeToday: {
        value: data.active_today,
        trend: data.activity_trend,
        trendType: this.getTrendIconType(data.activity_trend)
      },
      avgScore: {
        value: data.avg_score,
        trend: data.score_trend,
        trendType: this.getTrendIconType(data.score_trend)
      },
      completionRate: {
        value: data.completion_rate,
        trend: data.completion_trend,
        trendType: this.getTrendIconType(data.completion_trend)
      }
    };
  }

  /**
   * Get skill performance data
   */
  public getSkillPerformanceData(): SkillPerformance {
    const data = this.getSafeAnalyticsData();
    return data?.skill_performance || {
      vocabulary: { avg_score: 0, trend: 0 },
      grammar: { avg_score: 0, trend: 0 },
      listening: { avg_score: 0, trend: 0 },
      reading: { avg_score: 0, trend: 0 }
    };
  }

  /**
   * Get chart data for daily activity
   */
  public getDailyActivityChartData(): ChartData[] {
    const data = this.getSafeAnalyticsData();
    return data?.daily_activity || [];
  }

  /**
   * Get chart data for weekly progress
   */
  public getWeeklyProgressChartData(): ChartData[] {
    const data = this.getSafeAnalyticsData();
    return data?.weekly_progress || [];
  }

  /**
   * Get students data
   */
  public getStudentsData(): StudentProfile[] {
    const data = this.getSafeAnalyticsData();
    return data?.students || [];
  }

  /**
   * Get classes data
   */
  public getClassesData(): unknown[] {
    const data = this.getSafeAnalyticsData();
    return data?.classes || [];
  }

  /**
   * Get recent activities data
   */
  public getRecentActivitiesData(): ActivityEvent[] {
    const data = this.getSafeAnalyticsData();
    return data?.recent_activities || [];
  }

  /**
   * Get alerts data
   */
  public getAlertsData(): AlertItem[] {
    const data = this.getSafeAnalyticsData();
    return data?.alerts || [];
  }

  /**
   * Get student by ID
   */
  public getStudentById(studentId: string): StudentProfile | null {
    const students = this.getStudentsData();
    return students.find(s => s.id === studentId) || null;
  }

  /**
   * Open student detail modal
   */
  public openStudentDetailModal(studentId: string): void {
    const student = this.getStudentById(studentId);
    this.setSelectedStudent(student);
    this.setStudentModalOpen(true);
  }

  /**
   * Close student detail modal
   */
  public closeStudentDetailModal(): void {
    this.setStudentModalOpen(false);
    this.setSelectedStudent(null);
  }

  /**
   * Get analytics summary
   */
  public getAnalyticsSummary(): {
    hasData: boolean;
    totalStudents: number;
    activeToday: number;
    avgScore: number;
    completionRate: number;
    topPerformingSkill: string;
    strugglingSkill: string;
  } {
    const data = this.getSafeAnalyticsData();
    if (!data) {
      return {
        hasData: false,
        totalStudents: 0,
        activeToday: 0,
        avgScore: 0,
        completionRate: 0,
        topPerformingSkill: '',
        strugglingSkill: ''
      };
    }

    const skillPerformance = this.getSkillPerformanceData();
    const skills = Object.entries(skillPerformance);
    const topSkill = skills.reduce((max, current) => 
      current[1].avg_score > max[1].avg_score ? current : max
    );
    const strugglingSkill = skills.reduce((min, current) => 
      current[1].avg_score < min[1].avg_score ? current : min
    );

    return {
      hasData: true,
      totalStudents: data.total_students,
      activeToday: data.active_today,
      avgScore: data.avg_score,
      completionRate: data.completion_rate,
      topPerformingSkill: topSkill[0],
      strugglingSkill: strugglingSkill[0]
    };
  }

  /**
   * Export analytics report
   */
  public exportAnalyticsReport(): { success: boolean; error?: string } {
    const data = this.getSafeAnalyticsData();
    if (!data) {
      return { success: false, error: 'No data available to export' };
    }

    // In real implementation, you'd generate and download a report
    // For now, just return success
    return { success: true };
  }

  /**
   * Filter analytics data
   */
  public filterAnalyticsData(filters: {
    dateRange?: { start: Date; end: Date };
    skillType?: string;
    studentIds?: string[];
  }): AnalyticsData | null {
    const data = this.getSafeAnalyticsData();
    if (!data) return null;

    // In real implementation, you'd apply filters to the data
    // For now, return the original data
    return data;
  }

  /**
   * Refresh analytics data
   */
  public async refreshAnalyticsData(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.setLoading(true);
      
      // In real implementation, you'd call the analytics service
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to refresh analytics data' };
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Get tab configuration
   */
  public getTabConfiguration(): Array<{
    id: string;
    label: string;
    icon?: string;
    disabled?: boolean;
  }> {
    return [
      { id: 'overview', label: 'Tổng quan' },
      { id: 'students', label: 'Học viên' },
      { id: 'activities', label: 'Hoạt động' },
      { id: 'classes', label: 'Lớp học' },
      { id: 'alerts', label: 'Cảnh báo' },
      { id: 'settings', label: 'Cài đặt' }
    ];
  }

  /**
   * Check if data is loading
   */
  public isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Check if analytics data is available
   */
  public hasAnalyticsData(): boolean {
    return this.state.analyticsData !== null;
  }

  /**
   * Get current active tab
   */
  public getActiveTab(): string {
    return this.state.activeTab;
  }

  /**
   * Check if student modal is open
   */
  public isStudentModalOpen(): boolean {
    return this.state.isStudentModalOpen;
  }

  /**
   * Get selected student
   */
  public getSelectedStudent(): StudentProfile | null {
    return this.state.selectedStudent;
  }

  /**
   * Reset analytics state
   */
  public resetAnalyticsState(): void {
    this.setState(this.getInitialState());
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.listeners = [];
  }
}
