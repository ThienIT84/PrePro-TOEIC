import { useState, useEffect, useCallback } from 'react';
import { DashboardController } from './DashboardController';
import { Analytics, ExamSet } from '@/types';

/**
 * Recent Student Exam interface
 */
interface RecentStudentExam {
  id: string;
  score: number;
  completed_at: string;
  profiles?: {
    name: string;
  };
  exam_sets?: {
    title: string;
  };
}

/**
 * React hook để sử dụng Dashboard Controller
 */
export function useDashboardController(userId: string | null, isTeacher: boolean = false) {
  const [controller] = useState(() => new DashboardController());
  
  // State
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [recentStudentExams, setRecentStudentExams] = useState<RecentStudentExam[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await controller.loadDashboardData(userId, isTeacher);
      
      if (result.error) {
        setError(result.error);
      } else {
        setAnalytics(result.analytics);
        setReviewCount(result.reviewCount);
        setExamSets(result.examSets);
        setRecentStudentExams(result.recentStudentExams);
      }
    } catch (err: unknown) {
      setError((err as any)?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [controller, userId, isTeacher]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Get TOEIC parts
  const toeicParts = controller.getToeicParts();

  // Get teacher stats
  const teacherStats = controller.getTeacherStats(examSets, recentStudentExams);

  // Format analytics for display
  const formattedAnalytics = controller.formatAnalytics(analytics);

  // Get loading state
  const loadingState = controller.getLoadingState();

  // Get error state
  const errorState = controller.getErrorState(error || '');

  return {
    // State
    analytics,
    reviewCount,
    examSets,
    recentStudentExams,
    loading,
    error,
    
    // Computed values
    toeicParts,
    teacherStats,
    formattedAnalytics,
    
    // State helpers
    loadingState,
    errorState,
    
    // Actions
    loadDashboardData,
    refreshData: loadDashboardData,
  };
}
