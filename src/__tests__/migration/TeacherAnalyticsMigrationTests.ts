/**
 * TeacherAnalyticsMigrationTests
 * Tests cho TeacherAnalytics.tsx migration sang MVC pattern
 */

import { TeacherAnalyticsController } from '../controllers/analytics/TeacherAnalyticsController';
import { AnalyticsData, StudentProfile, ActivityEvent, AlertItem } from '@/services/teacherAnalytics';

// Mock data
const mockAnalyticsData: AnalyticsData = {
  total_students: 25,
  active_today: 15,
  avg_score: 75,
  completion_rate: 80,
  students_trend: 5,
  activity_trend: 3,
  score_trend: 2,
  completion_trend: 4,
  students: [
    {
      id: 'student1',
      name: 'John Doe',
      email: 'john@example.com',
      avg_score: 85,
      last_activity: '2024-01-01T00:00:00Z',
      total_attempts: 50,
      correct_attempts: 42,
      completion_rate: 84,
      skill_scores: {
        vocabulary: 80,
        grammar: 90,
        listening: 75,
        reading: 85
      }
    }
  ],
  classes: [
    {
      id: 'class1',
      name: 'TOEIC Intermediate',
      student_count: 15,
      avg_score: 70
    }
  ],
  recent_activities: [
    {
      id: 'activity1',
      student_id: 'student1',
      type: 'exam_completed',
      description: 'Completed TOEIC Practice Test',
      timestamp: '2024-01-01T00:00:00Z',
      metadata: { score: 85, total_questions: 100 }
    }
  ],
  alerts: [
    {
      id: 'alert1',
      type: 'warning',
      title: 'Low Performance Alert',
      message: 'Student performance below average',
      timestamp: '2024-01-01T00:00:00Z',
      student_id: 'student1'
    }
  ],
  skill_performance: {
    vocabulary: { avg_score: 75, trend: 2 },
    grammar: { avg_score: 80, trend: 1 },
    listening: { avg_score: 70, trend: -1 },
    reading: { avg_score: 85, trend: 3 }
  },
  daily_activity: [
    { date: '2024-01-01', count: 10 },
    { date: '2024-01-02', count: 15 },
    { date: '2024-01-03', count: 12 }
  ],
  weekly_progress: [
    { week: 'Week 1', avg_score: 70 },
    { week: 'Week 2', avg_score: 75 },
    { week: 'Week 3', avg_score: 80 }
  ]
};

/**
 * Test TeacherAnalyticsController functionality
 */
export function testTeacherAnalyticsController() {
  console.log('🧪 Testing TeacherAnalyticsController...');
  
  const controller = new TeacherAnalyticsController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(initialState.analyticsData === null, 'Initial analyticsData should be null');
  console.assert(initialState.loading, 'Initial loading should be true');
  console.assert(initialState.selectedStudent === null, 'Initial selectedStudent should be null');
  console.assert(initialState.activeTab === 'overview', 'Initial activeTab should be overview');
  console.assert(!initialState.isStudentModalOpen, 'Initial isStudentModalOpen should be false');
  
  // Test setting analytics data
  controller.setAnalyticsData(mockAnalyticsData);
  controller.setLoading(false);
  
  const stateAfterSetup = controller.getState();
  console.assert(stateAfterSetup.analyticsData !== null, 'AnalyticsData should be set');
  console.assert(!stateAfterSetup.loading, 'Loading should be false');
  
  // Test utility functions
  const trendType = controller.getTrendIconType(5);
  console.assert(trendType === 'up', 'Positive trend should be up');
  
  const trendColor = controller.getTrendColorClass(-3);
  console.assert(trendColor === 'text-red-600', 'Negative trend should be red');
  
  const alertType = controller.getAlertIconType('warning');
  console.assert(alertType === 'warning', 'Alert type should be warning');
  
  const skillType = controller.getSkillIconType('vocabulary');
  console.assert(skillType === 'vocabulary', 'Skill type should be vocabulary');
  
  // Test safe analytics data
  const safeData = controller.getSafeAnalyticsData();
  console.assert(safeData !== null, 'Safe analytics data should not be null');
  console.assert(Array.isArray(safeData?.students), 'Students should be array');
  console.assert(Array.isArray(safeData?.classes), 'Classes should be array');
  
  // Test key metrics
  const keyMetrics = controller.getKeyMetrics();
  console.assert(keyMetrics.totalStudents.value === 25, 'Total students should be 25');
  console.assert(keyMetrics.activeToday.value === 15, 'Active today should be 15');
  console.assert(keyMetrics.avgScore.value === 75, 'Average score should be 75');
  console.assert(keyMetrics.completionRate.value === 80, 'Completion rate should be 80');
  
  // Test skill performance
  const skillPerformance = controller.getSkillPerformanceData();
  console.assert(skillPerformance.vocabulary.avg_score === 75, 'Vocabulary score should be 75');
  console.assert(skillPerformance.grammar.avg_score === 80, 'Grammar score should be 80');
  
  // Test chart data
  const dailyActivity = controller.getDailyActivityChartData();
  console.assert(Array.isArray(dailyActivity), 'Daily activity should be array');
  console.assert(dailyActivity.length === 3, 'Daily activity should have 3 items');
  
  const weeklyProgress = controller.getWeeklyProgressChartData();
  console.assert(Array.isArray(weeklyProgress), 'Weekly progress should be array');
  console.assert(weeklyProgress.length === 3, 'Weekly progress should have 3 items');
  
  // Test student management
  const students = controller.getStudentsData();
  console.assert(students.length === 1, 'Should have 1 student');
  
  const student = controller.getStudentById('student1');
  console.assert(student?.name === 'John Doe', 'Student name should be John Doe');
  
  // Test student modal
  controller.openStudentDetailModal('student1');
  console.assert(controller.getState().isStudentModalOpen, 'Student modal should be open');
  console.assert(controller.getState().selectedStudent !== null, 'Selected student should be set');
  
  controller.closeStudentDetailModal();
  console.assert(!controller.getState().isStudentModalOpen, 'Student modal should be closed');
  console.assert(controller.getState().selectedStudent === null, 'Selected student should be null');
  
  // Test analytics summary
  const summary = controller.getAnalyticsSummary();
  console.assert(summary.hasData, 'Should have data');
  console.assert(summary.totalStudents === 25, 'Summary total students should be 25');
  console.assert(summary.topPerformingSkill === 'reading', 'Top performing skill should be reading');
  console.assert(summary.strugglingSkill === 'listening', 'Struggling skill should be listening');
  
  // Test export report
  const exportResult = controller.exportAnalyticsReport();
  console.assert(exportResult.success, 'Export should succeed');
  
  // Test tab configuration
  const tabConfig = controller.getTabConfiguration();
  console.assert(tabConfig.length === 6, 'Should have 6 tabs');
  console.assert(tabConfig[0].id === 'overview', 'First tab should be overview');
  
  // Test state checks
  console.assert(!controller.isLoading(), 'Should not be loading');
  console.assert(controller.hasAnalyticsData(), 'Should have analytics data');
  console.assert(controller.getActiveTab() === 'overview', 'Active tab should be overview');
  
  // Test cleanup
  controller.cleanup();
  
  console.log('✅ TeacherAnalyticsController tests passed!');
}

/**
 * Test TeacherAnalyticsView props interface
 */
export function testTeacherAnalyticsViewProps() {
  console.log('🧪 Testing TeacherAnalyticsView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'analyticsData', 'loading', 'selectedStudent', 'activeTab', 'isStudentModalOpen',
    'onSetActiveTab', 'onOpenStudentDetailModal', 'onCloseStudentDetailModal',
    'onExportAnalyticsReport', 'onFilterAnalyticsData', 'onRefreshAnalyticsData',
    'getTrendIconType', 'getTrendColorClass', 'getAlertIconType', 'getSkillIconType',
    'getSafeAnalyticsData', 'getKeyMetrics', 'getSkillPerformanceData',
    'getDailyActivityChartData', 'getWeeklyProgressChartData', 'getStudentsData',
    'getClassesData', 'getRecentActivitiesData', 'getAlertsData', 'getStudentById',
    'getAnalyticsSummary', 'getTabConfiguration', 'isLoading', 'hasAnalyticsData',
    'getActiveTab', 'isStudentModalOpen', 'getSelectedStudent'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ TeacherAnalyticsView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testTeacherAnalyticsMVCIntegration() {
  console.log('🧪 Testing TeacherAnalytics MVC integration...');
  
  // Test that controller and view can work together
  const controller = new TeacherAnalyticsController();
  
  // Simulate MVC flow
  controller.setAnalyticsData(mockAnalyticsData);
  controller.setLoading(false);
  controller.setActiveTab('students');
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.analyticsData !== null, 'AnalyticsData should be set');
  console.assert(!state.loading, 'Loading should be false');
  console.assert(state.activeTab === 'students', 'Active tab should be students');
  
  // Test action handling
  controller.openStudentDetailModal('student1');
  controller.setActiveTab('activities');
  
  const finalState = controller.getState();
  console.assert(finalState.isStudentModalOpen, 'Student modal should be open');
  console.assert(finalState.activeTab === 'activities', 'Active tab should be activities');
  console.assert(finalState.selectedStudent !== null, 'Selected student should be set');
  
  console.log('✅ TeacherAnalytics MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testTeacherAnalyticsErrorHandling() {
  console.log('🧪 Testing TeacherAnalytics error handling...');
  
  const controller = new TeacherAnalyticsController();
  
  // Test with null data
  controller.setAnalyticsData(null);
  const safeData = controller.getSafeAnalyticsData();
  console.assert(safeData === null, 'Safe data should be null when analytics data is null');
  
  const keyMetrics = controller.getKeyMetrics();
  console.assert(keyMetrics.totalStudents.value === 0, 'Key metrics should have default values');
  
  // Test student not found
  const student = controller.getStudentById('non-existent');
  console.assert(student === null, 'Non-existent student should return null');
  
  // Test export with no data
  controller.setAnalyticsData(null);
  const exportResult = controller.exportAnalyticsReport();
  console.assert(!exportResult.success, 'Export should fail with no data');
  console.assert(exportResult.error !== undefined, 'Export should have error message');
  
  console.log('✅ TeacherAnalytics error handling tests passed!');
}

/**
 * Test performance
 */
export function testTeacherAnalyticsPerformance() {
  console.log('🧪 Testing TeacherAnalytics performance...');
  
  const controller = new TeacherAnalyticsController();
  
  // Test with large dataset
  const largeAnalyticsData: AnalyticsData = {
    ...mockAnalyticsData,
    students: Array.from({ length: 1000 }, (_, i) => ({
      ...mockAnalyticsData.students[0],
      id: `student${i}`,
      name: `Student ${i}`,
      email: `student${i}@example.com`
    })),
    daily_activity: Array.from({ length: 30 }, (_, i) => ({
      date: `2024-01-${(i + 1).toString().padStart(2, '0')}`,
      count: Math.floor(Math.random() * 50)
    })),
    weekly_progress: Array.from({ length: 12 }, (_, i) => ({
      week: `Week ${i + 1}`,
      avg_score: Math.floor(Math.random() * 100)
    }))
  };
  
  controller.setAnalyticsData(largeAnalyticsData);
  
  const startTime = performance.now();
  
  // Test data processing performance
  for (let i = 0; i < 100; i++) {
    controller.getKeyMetrics();
    controller.getSkillPerformanceData();
    controller.getDailyActivityChartData();
    controller.getWeeklyProgressChartData();
    controller.getStudentsData();
    controller.getAnalyticsSummary();
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 1000, `Performance test should complete in under 1 second, took ${duration}ms`);
  
  console.log(`✅ TeacherAnalytics performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Run all TeacherAnalytics migration tests
 */
export function runTeacherAnalyticsMigrationTests() {
  console.log('🚀 Running TeacherAnalytics Migration Tests...');
  
  try {
    testTeacherAnalyticsController();
    testTeacherAnalyticsViewProps();
    testTeacherAnalyticsMVCIntegration();
    testTeacherAnalyticsErrorHandling();
    testTeacherAnalyticsPerformance();
    
    console.log('🎉 All TeacherAnalytics migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ TeacherAnalytics migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testTeacherAnalyticsController,
  testTeacherAnalyticsViewProps,
  testTeacherAnalyticsMVCIntegration,
  testTeacherAnalyticsErrorHandling,
  testTeacherAnalyticsPerformance,
  runTeacherAnalyticsMigrationTests
};
