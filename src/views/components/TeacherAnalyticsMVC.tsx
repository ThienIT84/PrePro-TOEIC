/**
 * TeacherAnalyticsMVC
 * MVC wrapper component cho TeacherAnalytics
 * Integrates TeacherAnalyticsController với TeacherAnalyticsView
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { teacherAnalyticsService, AnalyticsData } from '@/services/teacherAnalytics';
import { useTeacherAnalyticsController } from '../controllers/analytics/useTeacherAnalyticsController';
import TeacherAnalyticsView from './TeacherAnalyticsView';
import StudentDetailModal from './StudentDetailModal';
import EnhancedActivityTimeline from './EnhancedActivityTimeline';
import ClassManagement from './ClassManagement';
import AdvancedAlertsSystem from './AdvancedAlertsSystem';
import StudentListWithFilters from './StudentListWithFilters';

const TeacherAnalyticsMVC: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use teacher analytics controller
  const {
    state,
    analyticsData,
    loading,
    selectedStudent,
    activeTab,
    isStudentModalOpen,
    setAnalyticsData,
    setLoading,
    setSelectedStudent,
    setActiveTab,
    setStudentModalOpen,
    getTrendIconType,
    getTrendColorClass,
    getAlertIconType,
    getSkillIconType,
    getSafeAnalyticsData,
    getKeyMetrics,
    getSkillPerformanceData,
    getDailyActivityChartData,
    getWeeklyProgressChartData,
    getStudentsData,
    getClassesData,
    getRecentActivitiesData,
    getAlertsData,
    getStudentById,
    openStudentDetailModal,
    closeStudentDetailModal,
    getAnalyticsSummary,
    exportAnalyticsReport,
    filterAnalyticsData,
    refreshAnalyticsData,
    getTabConfiguration,
    isLoading,
    hasAnalyticsData,
    getActiveTab,
    isStudentModalOpen: isStudentModalOpenCheck,
    getSelectedStudent,
  } = useTeacherAnalyticsController();

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await teacherAnalyticsService.getAnalyticsData(user.id);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Set empty data to prevent white screen
      const emptyData: AnalyticsData = {
        total_students: 0,
        active_today: 0,
        avg_score: 0,
        completion_rate: 0,
        students_trend: 0,
        activity_trend: 0,
        score_trend: 0,
        completion_trend: 0,
        students: [],
        classes: [],
        recent_activities: [],
        alerts: [],
        skill_performance: {
          vocabulary: { avg_score: 0, trend: 0 },
          grammar: { avg_score: 0, trend: 0 },
          listening: { avg_score: 0, trend: 0 },
          reading: { avg_score: 0, trend: 0 }
        },
        daily_activity: [],
        weekly_progress: []
      };
      setAnalyticsData(emptyData);
    } finally {
      setLoading(false);
    }
  };

  // Handle export analytics report
  const handleExportAnalyticsReport = () => {
    const result = exportAnalyticsReport();
    if (result.success) {
      toast({
        title: 'Thành công',
        description: 'Đã xuất báo cáo phân tích.'
      });
    } else {
      toast({
        title: 'Lỗi',
        description: result.error || 'Không thể xuất báo cáo.',
        variant: 'destructive'
      });
    }
  };

  // Handle filter analytics data
  const handleFilterAnalyticsData = (filters: {
    dateRange?: { start: Date; end: Date };
    skillType?: string;
    studentIds?: string[];
  }) => {
    const result = filterAnalyticsData(filters);
    if (result) {
      toast({
        title: 'Thành công',
        description: 'Đã áp dụng bộ lọc dữ liệu.'
      });
    } else {
      toast({
        title: 'Lỗi',
        description: 'Không thể áp dụng bộ lọc.',
        variant: 'destructive'
      });
    }
  };

  // Handle refresh analytics data
  const handleRefreshAnalyticsData = async (userId: string) => {
    const result = await refreshAnalyticsData(userId);
    if (result.success) {
      toast({
        title: 'Thành công',
        description: 'Đã làm mới dữ liệu phân tích.'
      });
    } else {
      toast({
        title: 'Lỗi',
        description: result.error || 'Không thể làm mới dữ liệu.',
        variant: 'destructive'
      });
    }
  };

  // Initialize analytics data
  useEffect(() => {
    if (user) {
      fetchAnalyticsData();
    }
  }, [user]);

  return (
    <TeacherAnalyticsView
      // State
      analyticsData={analyticsData}
      loading={loading}
      selectedStudent={selectedStudent}
      activeTab={activeTab}
      isStudentModalOpen={isStudentModalOpen}

      // Actions
      onSetActiveTab={setActiveTab}
      onOpenStudentDetailModal={openStudentDetailModal}
      onCloseStudentDetailModal={closeStudentDetailModal}
      onExportAnalyticsReport={handleExportAnalyticsReport}
      onFilterAnalyticsData={handleFilterAnalyticsData}
      onRefreshAnalyticsData={handleRefreshAnalyticsData}

      // Utility functions
      getTrendIconType={getTrendIconType}
      getTrendColorClass={getTrendColorClass}
      getAlertIconType={getAlertIconType}
      getSkillIconType={getSkillIconType}
      getSafeAnalyticsData={getSafeAnalyticsData}
      getKeyMetrics={getKeyMetrics}
      getSkillPerformanceData={getSkillPerformanceData}
      getDailyActivityChartData={getDailyActivityChartData}
      getWeeklyProgressChartData={getWeeklyProgressChartData}
      getStudentsData={getStudentsData}
      getClassesData={getClassesData}
      getRecentActivitiesData={getRecentActivitiesData}
      getAlertsData={getAlertsData}
      getStudentById={getStudentById}
      getAnalyticsSummary={getAnalyticsSummary}
      getTabConfiguration={getTabConfiguration}
      isLoading={isLoading}
      hasAnalyticsData={hasAnalyticsData}
      getActiveTab={getActiveTab}
      isStudentModalOpen={isStudentModalOpenCheck}
      getSelectedStudent={getSelectedStudent}

      // Child components
      StudentListWithFilters={StudentListWithFilters}
      EnhancedActivityTimeline={EnhancedActivityTimeline}
      ClassManagement={ClassManagement}
      AdvancedAlertsSystem={AdvancedAlertsSystem}
      StudentDetailModal={StudentDetailModal}
    />
  );
};

export default TeacherAnalyticsMVC;
