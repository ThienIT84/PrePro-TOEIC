/**
 * ExamManagementDashboardController
 * Business logic cho Exam Management Dashboard
 * Extracted từ ExamManagementDashboard.tsx
 */

import { supabase } from '@/integrations/supabase/client';

export interface ExamManagementDashboardState {
  activeTab: string;
  examSets: ExamSet[];
  statistics: ExamStatistics;
  loading: boolean;
  searchTerm: string;
  filterStatus: string;
  filterType: string;
}

export interface ExamSet {
  id: string;
  title: string;
  description: string;
  type: 'vocab' | 'grammar' | 'listening' | 'reading' | 'mix';
  question_count: number;
  time_limit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Statistics
  total_attempts?: number;
  average_score?: number;
  completion_rate?: number;
  average_time_spent?: number;
}

export interface ExamStatistics {
  totalExamSets: number;
  activeExamSets: number;
  totalAttempts: number;
  averageScore: number;
  totalQuestions: number;
}

export interface ExamSetFilters {
  searchTerm: string;
  filterStatus: string;
  filterType: string;
}

export class ExamManagementDashboardController {
  private state: ExamManagementDashboardState;
  private listeners: Array<(state: ExamManagementDashboardState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): ExamManagementDashboardState {
    return {
      activeTab: 'dashboard',
      examSets: [],
      statistics: {
        totalExamSets: 0,
        activeExamSets: 0,
        totalAttempts: 0,
        averageScore: 0,
        totalQuestions: 0
      },
      loading: false,
      searchTerm: '',
      filterStatus: 'all',
      filterType: 'all',
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: ExamManagementDashboardState) => void): () => void {
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
  private setState(updates: Partial<ExamManagementDashboardState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): ExamManagementDashboardState {
    return { ...this.state };
  }

  /**
   * Set active tab
   */
  public setActiveTab(activeTab: string): void {
    this.setState({ activeTab });
  }

  /**
   * Set exam sets
   */
  public setExamSets(examSets: ExamSet[]): void {
    this.setState({ examSets });
  }

  /**
   * Set statistics
   */
  public setStatistics(statistics: ExamStatistics): void {
    this.setState({ statistics });
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Set search term
   */
  public setSearchTerm(searchTerm: string): void {
    this.setState({ searchTerm });
  }

  /**
   * Set filter status
   */
  public setFilterStatus(filterStatus: string): void {
    this.setState({ filterStatus });
  }

  /**
   * Set filter type
   */
  public setFilterType(filterType: string): void {
    this.setState({ filterType });
  }

  /**
   * Fetch exam sets from database
   */
  public async fetchExamSets(): Promise<{ success: boolean; data?: ExamSet[]; error?: string }> {
    this.setLoading(true);
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select(`
          *,
          exam_statistics (
            total_attempts,
            average_score,
            completion_rate,
            average_time_spent
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const examSetsWithStats = data?.map(examSet => ({
        ...examSet,
        type: examSet.type as 'vocab' | 'grammar' | 'listening' | 'reading' | 'mix',
        difficulty: examSet.difficulty as 'easy' | 'medium' | 'hard',
        total_attempts: examSet.exam_statistics?.[0]?.total_attempts || 0,
        average_score: Number(examSet.exam_statistics?.[0]?.average_score) || 0,
        completion_rate: Number(examSet.exam_statistics?.[0]?.completion_rate) || 0,
        average_time_spent: examSet.exam_statistics?.[0]?.average_time_spent || 0
      })) || [];

      this.setExamSets(examSetsWithStats);
      return {
        success: true,
        data: examSetsWithStats
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Fetch statistics from database
   */
  public async fetchStatistics(): Promise<{ success: boolean; data?: ExamStatistics; error?: string }> {
    try {
      // Get exam sets statistics
      const { data: examData, error: examError } = await supabase
        .from('exam_sets')
        .select('id, is_active, question_count');

      if (examError) throw examError;

      // Get exam sessions statistics
      const { data: sessionData, error: sessionError } = await supabase
        .from('exam_sessions')
        .select('score, status, exam_set_id');

      if (sessionError) throw sessionError;

      const totalExamSets = examData?.length || 0;
      const activeExamSets = examData?.filter(e => e.is_active).length || 0;
      const totalAttempts = sessionData?.length || 0;
      const completedSessions = sessionData?.filter(s => s.status === 'completed') || [];
      
      let averageScore = 0;
      if (completedSessions.length > 0) {
        const totalScore = completedSessions.reduce((sum, s) => sum + (Number(s.score) || 0), 0);
        averageScore = totalScore / completedSessions.length;
      }
      
      const totalQuestions = examData?.reduce((sum, e) => sum + (Number(e.question_count) || 0), 0) || 0;

      const statistics: ExamStatistics = {
        totalExamSets,
        activeExamSets,
        totalAttempts,
        averageScore,
        totalQuestions
      };

      this.setStatistics(statistics);
      return {
        success: true,
        data: statistics
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Delete exam set
   */
  public async deleteExamSet(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('exam_sets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh exam sets after deletion
      await this.fetchExamSets();
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Toggle exam status
   */
  public async toggleExamStatus(id: string, currentStatus: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const newStatus = !currentStatus;
      
      const { error } = await supabase
        .from('exam_sets')
        .update({ is_active: newStatus })
        .eq('id', id);

      if (error) throw error;

      // Refresh exam sets after status change
      await this.fetchExamSets();
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get filtered exam sets
   */
  public getFilteredExamSets(): ExamSet[] {
    return this.state.examSets.filter(examSet => {
      const matchesSearch = examSet.title.toLowerCase().includes(this.state.searchTerm.toLowerCase()) ||
                           examSet.description.toLowerCase().includes(this.state.searchTerm.toLowerCase());
      const matchesStatus = this.state.filterStatus === 'all' || 
                           (this.state.filterStatus === 'active' && examSet.is_active) ||
                           (this.state.filterStatus === 'inactive' && !examSet.is_active);
      const matchesType = this.state.filterType === 'all' || examSet.type === this.state.filterType;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  /**
   * Get status color class
   */
  public getStatusColor(isActive: boolean): string {
    return isActive 
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  }

  /**
   * Get type icon component name
   */
  public getTypeIconName(type: string): string {
    switch (type) {
      case 'full':
        return 'FileText';
      case 'mini':
        return 'Clock';
      case 'custom':
        return 'Target';
      default:
        return 'FileText';
    }
  }

  /**
   * Clear all filters
   */
  public clearFilters(): void {
    this.setState({
      searchTerm: '',
      filterStatus: 'all',
      filterType: 'all'
    });
  }

  /**
   * Get recent exam sets
   */
  public getRecentExamSets(limit: number = 5): ExamSet[] {
    return this.state.examSets.slice(0, limit);
  }

  /**
   * Get exam set by ID
   */
  public getExamSetById(id: string): ExamSet | null {
    return this.state.examSets.find(examSet => examSet.id === id) || null;
  }

  /**
   * Get exam sets by status
   */
  public getExamSetsByStatus(isActive: boolean): ExamSet[] {
    return this.state.examSets.filter(examSet => examSet.is_active === isActive);
  }

  /**
   * Get exam sets by type
   */
  public getExamSetsByType(type: string): ExamSet[] {
    return this.state.examSets.filter(examSet => examSet.type === type);
  }

  /**
   * Get exam set statistics summary
   */
  public getExamSetStatisticsSummary(): {
    totalExamSets: number;
    activeExamSets: number;
    inactiveExamSets: number;
    totalQuestions: number;
    averageQuestions: number;
  } {
    const examSets = this.state.examSets;
    const totalExamSets = examSets.length;
    const activeExamSets = examSets.filter(e => e.is_active).length;
    const inactiveExamSets = examSets.filter(e => !e.is_active).length;
    const totalQuestions = examSets.reduce((sum, e) => sum + (Number(e.question_count) || 0), 0);
    const averageQuestions = totalExamSets > 0 ? totalQuestions / totalExamSets : 0;

    return {
      totalExamSets,
      activeExamSets,
      inactiveExamSets,
      totalQuestions,
      averageQuestions
    };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): {
    averageScore: number;
    totalAttempts: number;
    completionRate: number;
    topPerformingExam: ExamSet | null;
  } {
    const examSets = this.state.examSets;
    const totalAttempts = examSets.reduce((sum, e) => sum + (Number(e.total_attempts) || 0), 0);
    const averageScore = examSets.length > 0 
      ? examSets.reduce((sum, e) => sum + (Number(e.average_score) || 0), 0) / examSets.length 
      : 0;
    const completionRate = examSets.length > 0 
      ? examSets.reduce((sum, e) => sum + (Number(e.completion_rate) || 0), 0) / examSets.length 
      : 0;
    const topPerformingExam = examSets.reduce((top, current) => 
      (Number(current.average_score) || 0) > (Number(top?.average_score) || 0) ? current : top, 
      examSets[0] || null
    );

    return {
      averageScore,
      totalAttempts,
      completionRate,
      topPerformingExam
    };
  }

  /**
   * Check if loading
   */
  public isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Get active tab
   */
  public getActiveTab(): string {
    return this.state.activeTab;
  }

  /**
   * Get exam sets
   */
  public getExamSets(): ExamSet[] {
    return this.state.examSets;
  }

  /**
   * Get statistics
   */
  public getStatistics(): ExamStatistics {
    return this.state.statistics;
  }

  /**
   * Get search term
   */
  public getSearchTerm(): string {
    return this.state.searchTerm;
  }

  /**
   * Get filter status
   */
  public getFilterStatus(): string {
    return this.state.filterStatus;
  }

  /**
   * Get filter type
   */
  public getFilterType(): string {
    return this.state.filterType;
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
