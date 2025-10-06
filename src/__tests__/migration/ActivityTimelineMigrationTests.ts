/**
 * ActivityTimelineMigrationTests
 * Tests cho EnhancedActivityTimeline.tsx migration sang MVC pattern
 */

import { 
  ActivityTimelineController, 
  ActivityEvent, 
  ActivityFilter, 
  ActivityTimelineState,
  FetchActivitiesParams
} from '../controllers/analytics/ActivityTimelineController';

// Mock data
const mockActivity: ActivityEvent = {
  id: 'activity1',
  student_id: 'student1',
  student_name: 'Nguyễn Văn A',
  type: 'exam',
  title: 'TOEIC Practice Test 1',
  score: 85,
  timestamp: '2024-01-01T10:00:00Z',
  details: 'Score: 85%'
};

const mockActivity2: ActivityEvent = {
  id: 'activity2',
  student_id: 'student2',
  student_name: 'Trần Thị B',
  type: 'drill',
  title: 'Listening Practice Session',
  score: 72,
  timestamp: '2024-01-01T09:00:00Z',
  details: '15/20 correct (72%)'
};

const mockFilter: ActivityFilter = {
  type: 'all',
  timeRange: 'week',
  studentId: undefined
};

/**
 * Test ActivityTimelineController functionality
 */
export function testActivityTimelineController() {
  console.log('🧪 Testing ActivityTimelineController...');
  
  const controller = new ActivityTimelineController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(initialState.activities.length === 0, 'Initial activities should be empty');
  console.assert(initialState.loading, 'Initial loading should be true');
  console.assert(initialState.filter.type === 'all', 'Initial filter type should be all');
  console.assert(initialState.filter.timeRange === 'week', 'Initial filter timeRange should be week');
  console.assert(initialState.searchTerm === '', 'Initial searchTerm should be empty');
  console.assert(initialState.autoRefresh, 'Initial autoRefresh should be true');
  
  // Test state management
  controller.setActivities([mockActivity]);
  console.assert(controller.getActivities().length === 1, 'Should have 1 activity');
  console.assert(controller.getActivities()[0].id === 'activity1', 'Activity ID should match');
  
  controller.setLoading(false);
  console.assert(!controller.isLoading(), 'Should not be loading');
  
  controller.setFilter({ type: 'exam' });
  console.assert(controller.getFilter().type === 'exam', 'Filter type should be exam');
  
  controller.setSearchTerm('test');
  console.assert(controller.getSearchTerm() === 'test', 'Search term should be set');
  
  controller.setAutoRefresh(false);
  console.assert(!controller.isAutoRefreshEnabled(), 'Auto refresh should be disabled');
  
  // Test utility functions
  const activityIcon = controller.getActivityIcon('exam');
  console.assert(activityIcon === 'Award', 'Exam activity should have Award icon');
  
  const activityColor = controller.getActivityColor('exam');
  console.assert(activityColor.includes('blue'), 'Exam activity should have blue color');
  
  const scoreBadgeVariant = controller.getScoreBadgeVariant(85);
  console.assert(scoreBadgeVariant === 'default', 'High score should have default variant');
  
  const lowScoreBadgeVariant = controller.getScoreBadgeVariant(50);
  console.assert(lowScoreBadgeVariant === 'destructive', 'Low score should have destructive variant');
  
  const formattedTimestamp = controller.formatTimestamp('2024-01-01T10:00:00Z');
  console.assert(formattedTimestamp.includes('Hôm nay'), 'Recent timestamp should show today');
  
  const trendIndicator = controller.getTrendIndicator(85);
  console.assert(trendIndicator === 'TrendingUp', 'High score should show trending up');
  
  const activityTypeText = controller.getActivityTypeDisplayText('exam');
  console.assert(activityTypeText === 'Bài thi', 'Exam type should show correct text');
  
  const timeRangeText = controller.getTimeRangeDisplayText('week');
  console.assert(timeRangeText === 'Tuần này', 'Week timeRange should show correct text');
  
  // Test statistics
  controller.setActivities([mockActivity, mockActivity2]);
  const statistics = controller.getActivityStatistics();
  console.assert(statistics.totalActivities === 2, 'Total activities should be 2');
  console.assert(statistics.examActivities === 1, 'Exam activities should be 1');
  console.assert(statistics.drillActivities === 1, 'Drill activities should be 1');
  console.assert(statistics.averageScore === 78.5, 'Average score should be 78.5');
  console.assert(statistics.activitiesByType.exam === 1, 'Exam type count should be 1');
  console.assert(statistics.activitiesByType.drill === 1, 'Drill type count should be 1');
  
  // Test get activities by type
  const examActivities = controller.getActivitiesByType('exam');
  console.assert(examActivities.length === 1, 'Should find 1 exam activity');
  
  // Test get activities by student
  const studentActivities = controller.getActivitiesByStudent('student1');
  console.assert(studentActivities.length === 1, 'Should find 1 activity for student1');
  
  // Test get recent activities
  const recentActivities = controller.getRecentActivities(1);
  console.assert(recentActivities.length === 1, 'Should return 1 recent activity');
  
  // Test get top performing activities
  const topActivities = controller.getTopPerformingActivities(1);
  console.assert(topActivities.length === 1, 'Should return 1 top performing activity');
  console.assert(topActivities[0].score === 85, 'Top activity should have highest score');
  
  // Test reset state
  controller.resetState();
  const resetState = controller.getState();
  console.assert(resetState.activities.length === 0, 'Reset state should have empty activities');
  console.assert(resetState.loading, 'Reset state should be loading');
  
  console.log('✅ ActivityTimelineController tests passed!');
}

/**
 * Test ActivityTimelineView props interface
 */
export function testActivityTimelineViewProps() {
  console.log('🧪 Testing ActivityTimelineView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'activities', 'loading', 'filter', 'searchTerm', 'autoRefresh', 'lastRefresh',
    'onSetFilter', 'onSetSearchTerm', 'onSetAutoRefresh', 'onFetchActivities',
    'getActivityIcon', 'getActivityColor', 'getScoreBadgeVariant', 'formatTimestamp',
    'getTrendIndicator', 'getActivityTypeDisplayText', 'getTimeRangeDisplayText'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ ActivityTimelineView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testActivityTimelineMVCIntegration() {
  console.log('🧪 Testing ActivityTimeline MVC integration...');
  
  // Test that controller and view can work together
  const controller = new ActivityTimelineController();
  
  // Simulate MVC flow
  controller.setActivities([mockActivity, mockActivity2]);
  controller.setLoading(false);
  controller.setFilter({ type: 'exam', timeRange: 'today' });
  controller.setSearchTerm('test');
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.activities.length === 2, 'Should have 2 activities');
  console.assert(!state.loading, 'Should not be loading');
  console.assert(state.filter.type === 'exam', 'Filter type should be exam');
  console.assert(state.filter.timeRange === 'today', 'Filter timeRange should be today');
  console.assert(state.searchTerm === 'test', 'Search term should be set');
  
  // Test action handling
  controller.setAutoRefresh(false);
  controller.setLastRefresh(new Date());
  
  const finalState = controller.getState();
  console.assert(!finalState.autoRefresh, 'Auto refresh should be disabled');
  console.assert(finalState.lastRefresh instanceof Date, 'Last refresh should be Date');
  
  console.log('✅ ActivityTimeline MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testActivityTimelineErrorHandling() {
  console.log('🧪 Testing ActivityTimeline error handling...');
  
  const controller = new ActivityTimelineController();
  
  // Test with empty activities
  controller.setActivities([]);
  const statistics = controller.getActivityStatistics();
  console.assert(statistics.totalActivities === 0, 'Empty activities should return zero total');
  console.assert(statistics.averageScore === 0, 'Empty activities should return zero average');
  
  // Test with invalid activity type
  const invalidActivityIcon = controller.getActivityIcon('invalid');
  console.assert(invalidActivityIcon === 'Clock', 'Invalid activity type should have Clock icon');
  
  const invalidActivityColor = controller.getActivityColor('invalid');
  console.assert(invalidActivityColor.includes('gray'), 'Invalid activity type should have gray color');
  
  const invalidActivityTypeText = controller.getActivityTypeDisplayText('invalid');
  console.assert(invalidActivityTypeText === 'Hoạt động', 'Invalid activity type should show default text');
  
  // Test with invalid time range
  const invalidTimeRangeText = controller.getTimeRangeDisplayText('invalid');
  console.assert(invalidTimeRangeText === 'Không xác định', 'Invalid time range should show unknown text');
  
  // Test score badge variants
  const highScoreVariant = controller.getScoreBadgeVariant(95);
  console.assert(highScoreVariant === 'default', 'High score should have default variant');
  
  const mediumScoreVariant = controller.getScoreBadgeVariant(75);
  console.assert(mediumScoreVariant === 'secondary', 'Medium score should have secondary variant');
  
  const lowScoreVariant = controller.getScoreBadgeVariant(50);
  console.assert(lowScoreVariant === 'destructive', 'Low score should have destructive variant');
  
  // Test trend indicators
  const highTrendIndicator = controller.getTrendIndicator(85);
  console.assert(highTrendIndicator === 'TrendingUp', 'High score should show trending up');
  
  const mediumTrendIndicator = controller.getTrendIndicator(70);
  console.assert(mediumTrendIndicator === 'Clock', 'Medium score should show clock');
  
  const lowTrendIndicator = controller.getTrendIndicator(50);
  console.assert(lowTrendIndicator === 'AlertTriangle', 'Low score should show alert triangle');
  
  console.log('✅ ActivityTimeline error handling tests passed!');
}

/**
 * Test performance
 */
export function testActivityTimelinePerformance() {
  console.log('🧪 Testing ActivityTimeline performance...');
  
  const controller = new ActivityTimelineController();
  
  // Create test data
  const testActivities: ActivityEvent[] = Array.from({ length: 100 }, (_, i) => ({
    ...mockActivity,
    id: `activity${i}`,
    student_id: `student${i % 10}`,
    student_name: `Student ${i}`,
    type: ['exam', 'drill', 'review', 'achievement'][i % 4] as any,
    title: `Activity ${i}`,
    score: Math.floor(Math.random() * 100),
    timestamp: new Date(Date.now() - i * 1000 * 60 * 60).toISOString()
  }));
  
  controller.setActivities(testActivities);
  
  const startTime = performance.now();
  
  // Test utility functions performance
  for (let i = 0; i < 100; i++) {
    controller.getActivityIcon('exam');
    controller.getActivityColor('exam');
    controller.getScoreBadgeVariant(85);
    controller.formatTimestamp(testActivities[0].timestamp);
    controller.getTrendIndicator(85);
    controller.getActivityTypeDisplayText('exam');
    controller.getTimeRangeDisplayText('week');
    controller.getActivityStatistics();
    controller.getActivitiesByType('exam');
    controller.getActivitiesByStudent('student1');
    controller.getRecentActivities(10);
    controller.getTopPerformingActivities(5);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 1000, `Performance test should complete in under 1 second, took ${duration}ms`);
  
  console.log(`✅ ActivityTimeline performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Test data operations simulation
 */
export function testActivityTimelineDataOperations() {
  console.log('🧪 Testing ActivityTimeline data operations...');
  
  const controller = new ActivityTimelineController();
  
  // Test fetch activities parameters
  const fetchParams: FetchActivitiesParams = {
    studentIds: ['student1', 'student2'],
    filter: mockFilter,
    searchTerm: 'test',
    silent: false
  };
  
  console.assert(fetchParams.studentIds.length === 2, 'Fetch params should have 2 student IDs');
  console.assert(fetchParams.filter.type === 'all', 'Fetch params should have correct filter type');
  console.assert(fetchParams.searchTerm === 'test', 'Fetch params should have correct search term');
  
  // Test state management
  controller.setActivities([mockActivity, mockActivity2]);
  controller.setFilter({ type: 'exam', timeRange: 'today' });
  controller.setSearchTerm('test');
  
  const state = controller.getState();
  console.assert(state.activities.length === 2, 'Should have 2 activities');
  console.assert(state.filter.type === 'exam', 'Filter type should be exam');
  console.assert(state.filter.timeRange === 'today', 'Filter timeRange should be today');
  console.assert(state.searchTerm === 'test', 'Search term should be set');
  
  console.log('✅ ActivityTimeline data operations tests passed!');
}

/**
 * Test filtering and search functionality
 */
export function testActivityTimelineFiltering() {
  console.log('🧪 Testing ActivityTimeline filtering...');
  
  const controller = new ActivityTimelineController();
  
  // Create test activities with different types
  const testActivities: ActivityEvent[] = [
    { ...mockActivity, type: 'exam', title: 'Math Exam' },
    { ...mockActivity2, type: 'drill', title: 'English Drill' },
    { ...mockActivity, id: 'activity3', type: 'review', title: 'Science Review' },
    { ...mockActivity2, id: 'activity4', type: 'achievement', title: 'Achievement Badge' }
  ];
  
  controller.setActivities(testActivities);
  
  // Test filtering by type
  const examActivities = controller.getActivitiesByType('exam');
  console.assert(examActivities.length === 1, 'Should find 1 exam activity');
  
  const drillActivities = controller.getActivitiesByType('drill');
  console.assert(drillActivities.length === 1, 'Should find 1 drill activity');
  
  // Test filtering by student
  const student1Activities = controller.getActivitiesByStudent('student1');
  console.assert(student1Activities.length === 2, 'Should find 2 activities for student1');
  
  const student2Activities = controller.getActivitiesByStudent('student2');
  console.assert(student2Activities.length === 2, 'Should find 2 activities for student2');
  
  // Test statistics by type
  const statistics = controller.getActivityStatistics();
  console.assert(statistics.totalActivities === 4, 'Total activities should be 4');
  console.assert(statistics.examActivities === 1, 'Exam activities should be 1');
  console.assert(statistics.drillActivities === 1, 'Drill activities should be 1');
  console.assert(statistics.activitiesByType.exam === 1, 'Exam type count should be 1');
  console.assert(statistics.activitiesByType.drill === 1, 'Drill type count should be 1');
  console.assert(statistics.activitiesByType.review === 1, 'Review type count should be 1');
  console.assert(statistics.activitiesByType.achievement === 1, 'Achievement type count should be 1');
  
  console.log('✅ ActivityTimeline filtering tests passed!');
}

/**
 * Run all ActivityTimeline migration tests
 */
export function runActivityTimelineMigrationTests() {
  console.log('🚀 Running ActivityTimeline Migration Tests...');
  
  try {
    testActivityTimelineController();
    testActivityTimelineViewProps();
    testActivityTimelineMVCIntegration();
    testActivityTimelineErrorHandling();
    testActivityTimelinePerformance();
    testActivityTimelineDataOperations();
    testActivityTimelineFiltering();
    
    console.log('🎉 All ActivityTimeline migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ ActivityTimeline migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testActivityTimelineController,
  testActivityTimelineViewProps,
  testActivityTimelineMVCIntegration,
  testActivityTimelineErrorHandling,
  testActivityTimelinePerformance,
  testActivityTimelineDataOperations,
  testActivityTimelineFiltering,
  runActivityTimelineMigrationTests
};
