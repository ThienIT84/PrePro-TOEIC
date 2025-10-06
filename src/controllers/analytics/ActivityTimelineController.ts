/**
 * ActivityTimelineController
 * Business logic cho Activity Timeline
 * Extracted từ EnhancedActivityTimeline.tsx
 */

import { supabase } from '@/integrations/supabase/client';

export interface ActivityTimelineState {
  activities: ActivityEvent[];
  loading: boolean;
  filter: ActivityFilter;
  searchTerm: string;
  autoRefresh: boolean;
  lastRefresh: Date;
}

export interface ActivityEvent {
  id: string;
  student_id: string;
  student_name: string;
  type: 'exam' | 'drill' | 'review' | 'achievement';
  title: string;
  score?: number;
  timestamp: string;
  details?: string;
}

export interface ActivityFilter {
  type: 'all' | 'exam' | 'drill' | 'review' | 'achievement';
  timeRange: 'today' | 'week' | 'month' | 'all';
  studentId?: string;
}

export interface FetchActivitiesParams {
  studentIds: string[];
  filter: ActivityFilter;
  searchTerm?: string;
  silent?: boolean;
}

export class ActivityTimelineController {
  private state: ActivityTimelineState;
  private listeners: Array<(state: ActivityTimelineState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): ActivityTimelineState {
    return {
      activities: [],
      loading: false,
      filter: {
        type: 'all',
        timeRange: 'week'
      },
      searchTerm: '',
      autoRefresh: true,
      lastRefresh: new Date()
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: ActivityTimelineState) => void): () => void {
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
  private setState(updates: Partial<ActivityTimelineState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): ActivityTimelineState {
    return { ...this.state };
  }

  /**
   * Set activities
   */
  public setActivities(activities: ActivityEvent[]): void {
    this.setState({ activities });
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Set filter
   */
  public setFilter(filter: Partial<ActivityFilter>): void {
    this.setState({ 
      filter: { ...this.state.filter, ...filter } 
    });
  }

  /**
   * Set search term
   */
  public setSearchTerm(searchTerm: string): void {
    this.setState({ searchTerm });
  }

  /**
   * Set auto refresh
   */
  public setAutoRefresh(autoRefresh: boolean): void {
    this.setState({ autoRefresh });
  }

  /**
   * Set last refresh timestamp
   */
  public setLastRefresh(lastRefresh: Date): void {
    this.setState({ lastRefresh });
  }

  /**
   * Fetch activities from database
   */
  public async fetchActivities(params: FetchActivitiesParams): Promise<{ success: boolean; data?: ActivityEvent[]; error?: string }> {
    if (!params.silent) {
      this.setLoading(true);
    }
    
    try {
      // Fetch exam activities
      let examQuery = supabase
        .from('exam_sessions')
        .select(`
          id,
          user_id,
          score,
          completed_at,
          exam_sets(title, type),
          profiles(name)
        `)
        .in('user_id', params.studentIds)
        .eq('status', 'completed');

      // Apply time filter for exams
      if (params.filter.timeRange !== 'all') {
        const startDate = this.getStartDate(params.filter.timeRange);
        examQuery = examQuery.gte('completed_at', startDate.toISOString());
      }

      // Apply student filter for exams
      if (params.filter.studentId) {
        examQuery = examQuery.eq('user_id', params.filter.studentId);
      }

      const { data: exams } = await examQuery
        .order('completed_at', { ascending: false })
        .limit(50);

      // Fetch drill activities
      let drillQuery = supabase
        .from('attempts')
        .select(`
          user_id,
          correct,
          created_at,
          items(type),
          profiles(name)
        `)
        .in('user_id', params.studentIds);

      // Apply time filter for drills
      if (params.filter.timeRange !== 'all') {
        const startDate = this.getStartDate(params.filter.timeRange);
        drillQuery = drillQuery.gte('created_at', startDate.toISOString());
      }

      // Apply student filter for drills
      if (params.filter.studentId) {
        drillQuery = drillQuery.eq('user_id', params.filter.studentId);
      }

      const { data: attempts } = await drillQuery
        .order('created_at', { ascending: false })
        .limit(50);

      // Combine and format activities
      const allActivities: ActivityEvent[] = [];

      // Add exam activities
      exams?.forEach(exam => {
        allActivities.push({
          id: exam.id,
          student_id: exam.user_id,
          student_name: exam.profiles?.name || 'Unknown',
          type: 'exam',
          title: exam.exam_sets?.title || 'Exam',
          score: exam.score,
          timestamp: exam.completed_at,
          details: `Score: ${exam.score}%`
        });
      });

      // Add drill activities (grouped by session)
      const drillSessions = this.groupDrillSessions(attempts || []);
      drillSessions.forEach((sessionAttempts, sessionKey) => {
        const firstAttempt = sessionAttempts[0];
        const correctCount = sessionAttempts.filter(a => a.correct).length;
        const totalCount = sessionAttempts.length;
        const avgScore = Math.round((correctCount / totalCount) * 100);

        allActivities.push({
          id: sessionKey,
          student_id: firstAttempt.user_id,
          student_name: firstAttempt.profiles?.name || 'Unknown',
          type: 'drill',
          title: `${firstAttempt.items?.type || 'Unknown'} Practice Session`,
          score: avgScore,
          timestamp: firstAttempt.created_at,
          details: `${correctCount}/${totalCount} correct (${avgScore}%)`
        });
      });

      // Sort by timestamp
      allActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      // Apply type filter
      const filteredActivities = params.filter.type === 'all' 
        ? allActivities 
        : allActivities.filter(a => a.type === params.filter.type);

      // Apply search filter
      const searchFilteredActivities = params.searchTerm
        ? filteredActivities.filter(a => 
            a.student_name.toLowerCase().includes(params.searchTerm.toLowerCase()) ||
            a.title.toLowerCase().includes(params.searchTerm.toLowerCase())
          )
        : filteredActivities;

      this.setActivities(searchFilteredActivities);
      this.setLastRefresh(new Date());

      return {
        success: true,
        data: searchFilteredActivities
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      if (!params.silent) {
        this.setLoading(false);
      }
    }
  }

  /**
   * Get start date based on time range
   */
  private getStartDate(timeRange: string): Date {
    const now = new Date();
    
    switch (timeRange) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0);
    }
  }

  /**
   * Group drill sessions by user and date
   */
  private groupDrillSessions(attempts: any[]): Map<string, any[]> {
    const drillSessions = new Map<string, any[]>();
    
    attempts.forEach(attempt => {
      const sessionKey = `${attempt.user_id}_${attempt.created_at.split('T')[0]}`;
      if (!drillSessions.has(sessionKey)) {
        drillSessions.set(sessionKey, []);
      }
      drillSessions.get(sessionKey)!.push(attempt);
    });
    
    return drillSessions;
  }

  /**
   * Get activity icon based on type
   */
  public getActivityIcon(type: string): string {
    switch (type) {
      case 'exam': return 'Award';
      case 'drill': return 'BookOpen';
      case 'review': return 'RefreshCw';
      case 'achievement': return 'Target';
      default: return 'Clock';
    }
  }

  /**
   * Get activity color class based on type
   */
  public getActivityColor(type: string): string {
    switch (type) {
      case 'exam': return 'border-blue-200 bg-blue-50';
      case 'drill': return 'border-green-200 bg-green-50';
      case 'review': return 'border-purple-200 bg-purple-50';
      case 'achievement': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  }

  /**
   * Get score badge variant based on score
   */
  public getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  }

  /**
   * Format timestamp to relative time
   */
  public formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays === 0) {
      if (diffHours === 0) {
        return `Hôm nay ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
      }
      return `Hôm nay ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Hôm qua ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  }

  /**
   * Get trend indicator based on score
   */
  public getTrendIndicator(score: number): string {
    if (score >= 80) {
      return 'TrendingUp';
    } else if (score >= 60) {
      return 'Clock';
    } else {
      return 'AlertTriangle';
    }
  }

  /**
   * Get activity type display text
   */
  public getActivityTypeDisplayText(type: string): string {
    switch (type) {
      case 'exam': return 'Bài thi';
      case 'drill': return 'Luyện tập';
      case 'review': return 'Ôn tập';
      case 'achievement': return 'Thành tích';
      default: return 'Hoạt động';
    }
  }

  /**
   * Get time range display text
   */
  public getTimeRangeDisplayText(timeRange: string): string {
    switch (timeRange) {
      case 'today': return 'Hôm nay';
      case 'week': return 'Tuần này';
      case 'month': return 'Tháng này';
      case 'all': return 'Tất cả';
      default: return 'Không xác định';
    }
  }

  /**
   * Get activity statistics
   */
  public getActivityStatistics(): {
    totalActivities: number;
    examActivities: number;
    drillActivities: number;
    averageScore: number;
    activitiesByType: Record<string, number>;
    activitiesByTimeRange: Record<string, number>;
  } {
    const activities = this.state.activities;
    const totalActivities = activities.length;
    const examActivities = activities.filter(a => a.type === 'exam').length;
    const drillActivities = activities.filter(a => a.type === 'drill').length;
    const scores = activities.filter(a => a.score !== undefined).map(a => a.score!);
    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;
    
    const activitiesByType = activities.reduce((acc, activity) => {
      acc[activity.type] = (acc[activity.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activitiesByTimeRange = activities.reduce((acc, activity) => {
      const date = new Date(activity.timestamp);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      
      let timeRange: string;
      if (diffDays === 0) timeRange = 'today';
      else if (diffDays < 7) timeRange = 'week';
      else if (diffDays < 30) timeRange = 'month';
      else timeRange = 'all';
      
      acc[timeRange] = (acc[timeRange] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalActivities,
      examActivities,
      drillActivities,
      averageScore,
      activitiesByType,
      activitiesByTimeRange
    };
  }

  /**
   * Get activities by type
   */
  public getActivitiesByType(type: string): ActivityEvent[] {
    return this.state.activities.filter(activity => activity.type === type);
  }

  /**
   * Get activities by student
   */
  public getActivitiesByStudent(studentId: string): ActivityEvent[] {
    return this.state.activities.filter(activity => activity.student_id === studentId);
  }

  /**
   * Get recent activities
   */
  public getRecentActivities(limit: number = 10): ActivityEvent[] {
    return this.state.activities.slice(0, limit);
  }

  /**
   * Get top performing activities
   */
  public getTopPerformingActivities(limit: number = 5): ActivityEvent[] {
    return this.state.activities
      .filter(a => a.score !== undefined)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  }

  /**
   * Check if loading
   */
  public isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Check if auto refresh is enabled
   */
  public isAutoRefreshEnabled(): boolean {
    return this.state.autoRefresh;
  }

  /**
   * Get last refresh timestamp
   */
  public getLastRefresh(): Date {
    return this.state.lastRefresh;
  }

  /**
   * Get activities
   */
  public getActivities(): ActivityEvent[] {
    return this.state.activities;
  }

  /**
   * Get filter
   */
  public getFilter(): ActivityFilter {
    return this.state.filter;
  }

  /**
   * Get search term
   */
  public getSearchTerm(): string {
    return this.state.searchTerm;
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
