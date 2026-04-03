/**
 * useTeacherAnalyticsController
 * React hook để integrate TeacherAnalyticsController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { TeacherAnalyticsController, TeacherAnalyticsState, ChartData, SkillPerformance, TrendData } from './TeacherAnalyticsController';
import { AnalyticsData, StudentProfile, ActivityEvent, AlertItem } from '@/services/teacherAnalytics';

export function useTeacherAnalyticsController() {
  const [controller] = useState(() => new TeacherAnalyticsController());
  const [state, setState] = useState<TeacherAnalyticsState>(controller.getState());

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controller.cleanup();
    };
  }, [controller]);

  // State management
  const setAnalyticsData = useCallback((analyticsData: AnalyticsData | null) => {
    controller.setAnalyticsData(analyticsData);
  }, [controller]);

  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setSelectedStudent = useCallback((selectedStudent: StudentProfile | null) => {
    controller.setSelectedStudent(selectedStudent);
  }, [controller]);

  const setActiveTab = useCallback((activeTab: string) => {
    controller.setActiveTab(activeTab);
  }, [controller]);

  const setStudentModalOpen = useCallback((isOpen: boolean) => {
    controller.setStudentModalOpen(isOpen);
  }, [controller]);

  // Utility functions
  const getTrendIconType = useCallback((trend: number) => {
    return controller.getTrendIconType(trend);
  }, [controller]);

  const getTrendColorClass = useCallback((trend: number) => {
    return controller.getTrendColorClass(trend);
  }, [controller]);

  const getAlertIconType = useCallback((type: string) => {
    return controller.getAlertIconType(type);
  }, [controller]);

  const getSkillIconType = useCallback((skill: string) => {
    return controller.getSkillIconType(skill);
  }, [controller]);

  // Data getters
  const getSafeAnalyticsData = useCallback(() => {
    return controller.getSafeAnalyticsData();
  }, [controller]);

  const getKeyMetrics = useCallback(() => {
    return controller.getKeyMetrics();
  }, [controller]);

  const getSkillPerformanceData = useCallback(() => {
    return controller.getSkillPerformanceData();
  }, [controller]);

  const getDailyActivityChartData = useCallback(() => {
    return controller.getDailyActivityChartData();
  }, [controller]);

  const getWeeklyProgressChartData = useCallback(() => {
    return controller.getWeeklyProgressChartData();
  }, [controller]);

  const getStudentsData = useCallback(() => {
    return controller.getStudentsData();
  }, [controller]);

  const getClassesData = useCallback(() => {
    return controller.getClassesData();
  }, [controller]);

  const getRecentActivitiesData = useCallback(() => {
    return controller.getRecentActivitiesData();
  }, [controller]);

  const getAlertsData = useCallback(() => {
    return controller.getAlertsData();
  }, [controller]);

  const getStudentById = useCallback((studentId: string) => {
    return controller.getStudentById(studentId);
  }, [controller]);

  // Actions
  const openStudentDetailModal = useCallback((studentId: string) => {
    controller.openStudentDetailModal(studentId);
  }, [controller]);

  const closeStudentDetailModal = useCallback(() => {
    controller.closeStudentDetailModal();
  }, [controller]);

  const getAnalyticsSummary = useCallback(() => {
    return controller.getAnalyticsSummary();
  }, [controller]);

  const exportAnalyticsReport = useCallback(() => {
    return controller.exportAnalyticsReport();
  }, [controller]);

  const filterAnalyticsData = useCallback((filters: {
    dateRange?: { start: Date; end: Date };
    skillType?: string;
    studentIds?: string[];
  }) => {
    return controller.filterAnalyticsData(filters);
  }, [controller]);

  const refreshAnalyticsData = useCallback(async (userId: string) => {
    return controller.refreshAnalyticsData(userId);
  }, [controller]);

  const getTabConfiguration = useCallback(() => {
    return controller.getTabConfiguration();
  }, [controller]);

  // State checks
  const isLoading = useCallback(() => {
    return controller.isLoading();
  }, [controller]);

  const hasAnalyticsData = useCallback(() => {
    return controller.hasAnalyticsData();
  }, [controller]);

  const getActiveTab = useCallback(() => {
    return controller.getActiveTab();
  }, [controller]);

  const isStudentModalOpen = useCallback(() => {
    return controller.isStudentModalOpen();
  }, [controller]);

  const getSelectedStudent = useCallback(() => {
    return controller.getSelectedStudent();
  }, [controller]);

  const resetAnalyticsState = useCallback(() => {
    controller.resetAnalyticsState();
  }, [controller]);

  return {
    // State
    state,
    
    // Analytics data
    analyticsData: state.analyticsData,
    loading: state.loading,
    selectedStudent: state.selectedStudent,
    activeTab: state.activeTab,
    isStudentModalOpen: state.isStudentModalOpen,

    // State management
    setAnalyticsData,
    setLoading,
    setSelectedStudent,
    setActiveTab,
    setStudentModalOpen,

    // Utility functions
    getTrendIconType,
    getTrendColorClass,
    getAlertIconType,
    getSkillIconType,

    // Data getters
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

    // Actions
    openStudentDetailModal,
    closeStudentDetailModal,
    getAnalyticsSummary,
    exportAnalyticsReport,
    filterAnalyticsData,
    refreshAnalyticsData,
    getTabConfiguration,

    // State checks
    isLoading,
    hasAnalyticsData,
    getActiveTab,
    getSelectedStudent,
    resetAnalyticsState,
  };
}
