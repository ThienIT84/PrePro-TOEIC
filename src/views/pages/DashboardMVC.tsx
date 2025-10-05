import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useDashboardController } from '@/controllers/dashboard/useDashboardController';
import { DashboardView } from './DashboardView';

/**
 * Dashboard MVC - Kết hợp View + Controller
 * Sử dụng useDashboardController để quản lý business logic
 */
export const DashboardMVC = () => {
  const { user, profile } = useAuth();
  const { isTeacher } = usePermissions();
  
  const {
    analytics,
    reviewCount,
    examSets,
    recentStudentExams,
    loading,
    error,
    toeicParts,
    teacherStats,
    formattedAnalytics,
    refreshData,
  } = useDashboardController(user?.id || null, isTeacher());

  // Handle view exam result
  const handleViewExamResult = (examId: string) => {
    window.location.href = `/exam-result/${examId}`;
  };

  return (
    <DashboardView
      // Data
      analytics={analytics}
      reviewCount={reviewCount}
      examSets={examSets}
      recentStudentExams={recentStudentExams}
      
      // Loading state
      loading={loading}
      error={error}
      
      // Computed values
      toeicParts={toeicParts}
      teacherStats={teacherStats}
      formattedAnalytics={formattedAnalytics}
      
      // User info
      user={user}
      profile={profile}
      isTeacher={isTeacher()}
      
      // Actions
      onRefresh={refreshData}
      onViewExamResult={handleViewExamResult}
    />
  );
};

export default DashboardMVC;
