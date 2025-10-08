import { AnalyticsService, ExamService, UserService } from '@/services/domains';
import { Analytics, ExamSet, DrillType } from '@/types';

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
    recentStudentExams: unknown[];
    error: string | null;
  }> {
    try {
      // Load analytics data
      const { data: analytics, error: analyticsError } = await this.analyticsService.getUserAnalytics();
      if (analyticsError) {
        throw new Error(`Failed to load analytics: ${analyticsError.message}`);
      }

      // Load exam sets
      const { data: examSets, error: examSetsError } = await this.examService.getExamSets({
        is_active: true
      });
      if (examSetsError) {
        throw new Error(`Failed to load exam sets: ${examSetsError.message}`);
      }

      // Load review count (mock for now)
      const reviewCount = 0;

      // Load recent student exams if teacher
      let recentStudentExams: unknown[] = [];
      if (isTeacher) {
        const { data: studentExams, error: studentExamsError } = await this.examService.getExamSessions({
          status: 'completed'
        });
        if (studentExamsError) {
          console.warn('Failed to load student exams:', studentExamsError);
        } else {
          recentStudentExams = studentExams?.slice(0, 5) || [];
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
        error: error.message
      };
    }
  }

  /**
   * Get TOEIC parts configuration
   */
  getToeicParts() {
    return [
      {
        part: 1,
        title: 'Part 1 - Mô tả hình ảnh',
        description: '6 câu hỏi - Nghe và chọn mô tả đúng',
        icon: 'Headphones',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        part: 2,
        title: 'Part 2 - Hỏi đáp',
        description: '25 câu hỏi - Nghe câu hỏi và chọn câu trả lời',
        icon: 'Headphones',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        part: 3,
        title: 'Part 3 - Hội thoại',
        description: '39 câu hỏi - Nghe đoạn hội thoại',
        icon: 'Headphones',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        part: 4,
        title: 'Part 4 - Bài nói',
        description: '30 câu hỏi - Nghe bài nói ngắn',
        icon: 'Headphones',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        part: 5,
        title: 'Part 5 - Hoàn thành câu',
        description: '30 câu hỏi - Ngữ pháp và từ vựng',
        icon: 'BookOpen',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      {
        part: 6,
        title: 'Part 6 - Hoàn thành đoạn văn',
        description: '16 câu hỏi - Điền từ vào đoạn văn',
        icon: 'FileText',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      {
        part: 7,
        title: 'Part 7 - Đọc hiểu',
        description: '54 câu hỏi - Đọc hiểu đoạn văn',
        icon: 'FileText',
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
    return {
      totalExamSets: examSets.length,
      totalStudents: 0, // TODO: Implement student count
      totalExams: recentStudentExams.length,
      averageScore: recentStudentExams.length > 0 
        ? recentStudentExams.reduce((sum, exam) => sum + (exam.score || 0), 0) / recentStudentExams.length
        : 0
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

    return {
      accuracy: analytics.accuracy || 0,
      totalAttempts: analytics.totalAttempts || 0,
      streakDays: analytics.streakDays || 0,
      averageTime: analytics.averageTime || 0
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
