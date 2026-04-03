import { AnalyticsService, ExamService, UserService } from '@/services/domains';
import { Analytics, ExamSet, DrillType } from '@/types';

/**
 * TOEIC Part interface
 */
interface TOEICPart {
  part: number;
  title: string;
  description: string;
  icon: 'Headphones' | 'BookOpen' | 'FileText';
  bgColor: string;
  borderColor: string;
  color: string;
}

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
 * Dashboard Controller - Quản lý business logic cho Dashboard
 */
export class DashboardController {
  private analyticsService: AnalyticsService;
  private examService: ExamService;
  private userService: UserService;

  constructor() {
    this.analyticsService = new AnalyticsService();
    this.examService = new ExamService();
    this.userService = new UserService();
  }

  /**
   * Load dashboard data
   */
  async loadDashboardData(userId: string, isTeacher: boolean = false): Promise<{
    analytics: Analytics | null;
    reviewCount: number;
    examSets: ExamSet[];
    recentStudentExams: RecentStudentExam[];
    error: string | null;
  }> {
    try {
      // Load analytics data - use getPerformanceAnalytics for attempt-based analytics
      const { data: analytics, error: analyticsError } = await this.analyticsService.getPerformanceAnalytics();
      if (analyticsError) {
        throw new Error(`Failed to load analytics: ${analyticsError instanceof Error ? analyticsError.message : 'Unknown error'}`);
      }

      // Load exam sets
      const { data: examSets, error: examSetsError } = await this.examService.getExamSets({
        is_active: true
      });
      if (examSetsError) {
        throw new Error(`Failed to load exam sets: ${examSetsError instanceof Error ? examSetsError.message : 'Unknown error'}`);
      }

      // Load review count (mock for now)
      const reviewCount = 0;

      // Load recent student exams if teacher
      let recentStudentExams: RecentStudentExam[] = [];
      if (isTeacher) {
        const { data: studentExams, error: studentExamsError } = await this.examService.getExamSessions({
          status: 'completed'
        });
        if (studentExamsError) {
          console.warn('Failed to load student exams:', studentExamsError);
        } else {
          recentStudentExams = (studentExams?.slice(0, 5) || []) as RecentStudentExam[];
        }
      }

      return {
        analytics: analytics as Analytics,
        reviewCount,
        examSets: examSets || [],
        recentStudentExams,
        error: null
      };

    } catch (error: unknown) {
      console.error('Error loading dashboard data:', error);
      return {
        analytics: null,
        reviewCount: 0,
        examSets: [],
        recentStudentExams: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get TOEIC parts configuration
   */
  getToeicParts(): TOEICPart[] {
    return [
      {
        part: 1,
        title: 'Part 1 - Mô tả hình ảnh',
        description: '6 câu hỏi - Nghe và chọn mô tả đúng',
        icon: 'Headphones' as const,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        part: 2,
        title: 'Part 2 - Hỏi đáp',
        description: '25 câu hỏi - Nghe câu hỏi và chọn câu trả lời',
        icon: 'Headphones' as const,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        part: 3,
        title: 'Part 3 - Hội thoại',
        description: '39 câu hỏi - Nghe đoạn hội thoại',
        icon: 'Headphones' as const,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        part: 4,
        title: 'Part 4 - Bài nói',
        description: '30 câu hỏi - Nghe bài nói ngắn',
        icon: 'Headphones' as const,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        part: 5,
        title: 'Part 5 - Hoàn thành câu',
        description: '30 câu hỏi - Ngữ pháp và từ vựng',
        icon: 'BookOpen' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      {
        part: 6,
        title: 'Part 6 - Hoàn thành đoạn văn',
        description: '16 câu hỏi - Điền từ vào đoạn văn',
        icon: 'FileText' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      {
        part: 7,
        title: 'Part 7 - Đọc hiểu',
        description: '54 câu hỏi - Đọc hiểu đoạn văn',
        icon: 'FileText' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
    ];
  }

  /**
   * Get teacher dashboard stats
   */
  getTeacherStats(examSets: ExamSet[], recentStudentExams: unknown[]) {
    let totalScore = 0;
    let averageScore = 0;
    
    if (recentStudentExams.length > 0) {
      const sum = recentStudentExams.reduce((sum: number, exam: any) => {
        const score = Number(exam.score) || 0;
        return sum + score;
      }, 0);
      
      totalScore = Number(sum);
      averageScore = Number(sum) / Number(recentStudentExams.length);
    }

    return {
      totalExamSets: examSets.length,
      totalStudents: 0, // TODO: Implement student count
      totalExams: recentStudentExams.length,
      averageScore
    };
  }

  /**
   * Format analytics data for display
   */
  formatAnalytics(analytics: Analytics | null) {
    if (!analytics) {
      return {
        accuracy: 0,
        totalAttempts: 0,
        streakDays: 0,
        averageTime: 0
      };
    }

    // Handle both Analytics interface and PerformanceAnalytics response
    const analyticsData = analytics as any;
    
    return {
      accuracy: analyticsData.overallAccuracy || analyticsData.accuracy || 0,
      totalAttempts: analyticsData.totalAttempts || 0,
      streakDays: analyticsData.streakDays || 0,
      averageTime: analyticsData.averageTimePerQuestion || analyticsData.averageTime || 0
    };
  }

  /**
   * Get dashboard loading state
   */
  getLoadingState() {
    return {
      isLoading: true,
      showSkeleton: true
    };
  }

  /**
   * Get dashboard error state
   */
  getErrorState(error: string) {
    return {
      hasError: true,
      errorMessage: error,
      showRetry: true
    };
  }
}
