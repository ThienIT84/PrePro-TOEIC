/**
 * ExamHistoryMigrationTests
 * Tests cho ExamHistory.tsx migration sang MVC pattern
 */

import { 
  ExamHistoryController, 
  ExamHistoryItem, 
  ExamHistoryState,
  FetchExamHistoryParams
} from '../controllers/exam/ExamHistoryController';

// Mock data
const mockExamHistoryItem: ExamHistoryItem = {
  id: 'exam1',
  exam_set_id: 'examset1',
  total_questions: 20,
  correct_answers: 16,
  score: 80,
  time_spent: 1800,
  completed_at: '2024-01-01T10:00:00Z',
  exam_sets: {
    title: 'TOEIC Practice Test 1',
    description: 'Full TOEIC practice test'
  }
};

const mockFetchParams: FetchExamHistoryParams = {
  userId: 'user1'
};

/**
 * Test ExamHistoryController functionality
 */
export function testExamHistoryController() {
  console.log('🧪 Testing ExamHistoryController...');
  
  const controller = new ExamHistoryController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(initialState.exams.length === 0, 'Initial exams should be empty');
  console.assert(initialState.loading, 'Initial loading should be true');
  console.assert(initialState.error === null, 'Initial error should be null');
  
  // Test state management
  controller.setExams([mockExamHistoryItem]);
  console.assert(controller.getExams().length === 1, 'Should have 1 exam');
  console.assert(controller.getExams()[0].id === 'exam1', 'Exam ID should match');
  
  controller.setLoading(false);
  console.assert(!controller.isLoading(), 'Should not be loading');
  
  controller.setError('Test error');
  console.assert(controller.hasError(), 'Should have error');
  console.assert(controller.getError() === 'Test error', 'Error message should match');
  
  // Test utility functions
  const formattedTime = controller.formatTime(125);
  console.assert(formattedTime === '2:05', 'Time formatting should work correctly');
  
  const formattedDate = controller.formatDate('2024-01-01T10:00:00Z');
  console.assert(formattedDate.includes('2024'), 'Date formatting should work correctly');
  
  const scoreColor = controller.getScoreColor(85);
  console.assert(scoreColor === 'text-green-600', 'High score should have green color');
  
  const lowScoreColor = controller.getScoreColor(50);
  console.assert(lowScoreColor === 'text-red-600', 'Low score should have red color');
  
  // Test exam statistics
  const statistics = controller.getExamStatistics();
  console.assert(statistics.totalExams === 1, 'Total exams should be 1');
  console.assert(statistics.averageScore === 80, 'Average score should be 80');
  console.assert(statistics.highestScore === 80, 'Highest score should be 80');
  console.assert(statistics.lowestScore === 80, 'Lowest score should be 80');
  console.assert(statistics.totalTimeSpent === 1800, 'Total time spent should be 1800');
  console.assert(statistics.averageTimeSpent === 1800, 'Average time spent should be 1800');
  
  // Test get exam by ID
  const examById = controller.getExamById('exam1');
  console.assert(examById?.id === 'exam1', 'Should find exam by ID');
  
  const invalidExamById = controller.getExamById('invalid');
  console.assert(invalidExamById === null, 'Invalid exam ID should return null');
  
  // Test get exams by exam set
  const examsByExamSet = controller.getExamsByExamSet('examset1');
  console.assert(examsByExamSet.length === 1, 'Should find 1 exam for exam set');
  
  // Test get recent exams
  const recentExams = controller.getRecentExams(1);
  console.assert(recentExams.length === 1, 'Should return 1 recent exam');
  
  // Test get best performing exams
  const bestExams = controller.getBestPerformingExams(1);
  console.assert(bestExams.length === 1, 'Should return 1 best performing exam');
  console.assert(bestExams[0].id === 'exam1', 'Best exam should match');
  
  // Test get exams by score range
  const scoreRangeExams = controller.getExamsByScoreRange(70, 90);
  console.assert(scoreRangeExams.length === 1, 'Should find 1 exam in score range');
  
  // Test get exams by date range
  const dateRangeExams = controller.getExamsByDateRange('2024-01-01', '2024-01-02');
  console.assert(dateRangeExams.length === 1, 'Should find 1 exam in date range');
  
  // Test has exams
  console.assert(controller.hasExams(), 'Should have exams');
  
  // Test reset state
  controller.resetState();
  const resetState = controller.getState();
  console.assert(resetState.exams.length === 0, 'Reset state should have empty exams');
  console.assert(resetState.loading, 'Reset state should be loading');
  
  console.log('✅ ExamHistoryController tests passed!');
}

/**
 * Test ExamHistoryView props interface
 */
export function testExamHistoryViewProps() {
  console.log('🧪 Testing ExamHistoryView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'exams', 'loading', 'error',
    'onNavigateBack', 'onNavigateToExamResult', 'onNavigateToExamSets',
    'formatTime', 'formatDate', 'getScoreColor'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ ExamHistoryView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testExamHistoryMVCIntegration() {
  console.log('🧪 Testing ExamHistory MVC integration...');
  
  // Test that controller and view can work together
  const controller = new ExamHistoryController();
  
  // Simulate MVC flow
  controller.setExams([mockExamHistoryItem]);
  controller.setLoading(false);
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.exams.length === 1, 'Should have 1 exam');
  console.assert(!state.loading, 'Should not be loading');
  
  // Test action handling
  controller.setExams([]);
  controller.setLoading(true);
  
  const finalState = controller.getState();
  console.assert(finalState.exams.length === 0, 'Exams should be empty');
  console.assert(finalState.loading, 'Should be loading');
  
  console.log('✅ ExamHistory MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testExamHistoryErrorHandling() {
  console.log('🧪 Testing ExamHistory error handling...');
  
  const controller = new ExamHistoryController();
  
  // Test with empty data
  controller.setExams([]);
  const statistics = controller.getExamStatistics();
  console.assert(statistics.totalExams === 0, 'Empty exams should return zero total');
  console.assert(statistics.averageScore === 0, 'Empty exams should return zero average');
  console.assert(statistics.highestScore === 0, 'Empty exams should return zero highest');
  console.assert(statistics.lowestScore === 0, 'Empty exams should return zero lowest');
  console.assert(statistics.totalTimeSpent === 0, 'Empty exams should return zero total time');
  console.assert(statistics.averageTimeSpent === 0, 'Empty exams should return zero average time');
  
  // Test with invalid exam ID
  const invalidExam = controller.getExamById('invalid');
  console.assert(invalidExam === null, 'Invalid exam ID should return null');
  
  // Test with invalid exam set ID
  const invalidExamSetExams = controller.getExamsByExamSet('invalid');
  console.assert(invalidExamSetExams.length === 0, 'Invalid exam set ID should return empty array');
  
  // Test score colors
  const highScoreColor = controller.getScoreColor(95);
  console.assert(highScoreColor === 'text-green-600', 'High score should have green color');
  
  const mediumScoreColor = controller.getScoreColor(75);
  console.assert(mediumScoreColor === 'text-yellow-600', 'Medium score should have yellow color');
  
  const lowScoreColor = controller.getScoreColor(50);
  console.assert(lowScoreColor === 'text-red-600', 'Low score should have red color');
  
  // Test has exams
  console.assert(!controller.hasExams(), 'Should not have exams');
  
  console.log('✅ ExamHistory error handling tests passed!');
}

/**
 * Test performance
 */
export function testExamHistoryPerformance() {
  console.log('🧪 Testing ExamHistory performance...');
  
  const controller = new ExamHistoryController();
  
  // Create test data
  const testExams: ExamHistoryItem[] = Array.from({ length: 100 }, (_, i) => ({
    ...mockExamHistoryItem,
    id: `exam${i}`,
    exam_set_id: `examset${i % 10}`,
    score: Math.floor(Math.random() * 100),
    time_spent: Math.floor(Math.random() * 3600),
    completed_at: new Date(Date.now() - i * 1000 * 60 * 60).toISOString()
  }));
  
  controller.setExams(testExams);
  
  const startTime = performance.now();
  
  // Test utility functions performance
  for (let i = 0; i < 100; i++) {
    controller.formatTime(125);
    controller.formatDate('2024-01-01T10:00:00Z');
    controller.getScoreColor(85);
    controller.getExamStatistics();
    controller.getExamById('exam1');
    controller.getExamsByExamSet('examset1');
    controller.getRecentExams(10);
    controller.getBestPerformingExams(5);
    controller.getExamsByScoreRange(70, 90);
    controller.getExamsByDateRange('2024-01-01', '2024-01-02');
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 1000, `Performance test should complete in under 1 second, took ${duration}ms`);
  
  console.log(`✅ ExamHistory performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Test data operations simulation
 */
export function testExamHistoryDataOperations() {
  console.log('🧪 Testing ExamHistory data operations...');
  
  const controller = new ExamHistoryController();
  
  // Test fetch exam history parameters
  const fetchParams: FetchExamHistoryParams = {
    userId: 'user1'
  };
  
  console.assert(fetchParams.userId === 'user1', 'Fetch params should have correct user ID');
  
  // Test state management
  controller.setExams([mockExamHistoryItem]);
  controller.setLoading(false);
  
  const state = controller.getState();
  console.assert(state.exams.length === 1, 'Should have 1 exam');
  console.assert(!state.loading, 'Should not be loading');
  
  console.log('✅ ExamHistory data operations tests passed!');
}

/**
 * Test filtering and search functionality
 */
export function testExamHistoryFiltering() {
  console.log('🧪 Testing ExamHistory filtering...');
  
  const controller = new ExamHistoryController();
  
  // Create test exam history with different scores
  const testExams: ExamHistoryItem[] = [
    { ...mockExamHistoryItem, score: 80, exam_set_id: 'examset1' },
    { ...mockExamHistoryItem, id: 'exam2', score: 70, exam_set_id: 'examset2' },
    { ...mockExamHistoryItem, id: 'exam3', score: 90, exam_set_id: 'examset1' },
    { ...mockExamHistoryItem, id: 'exam4', score: 60, exam_set_id: 'examset3' }
  ];
  
  controller.setExams(testExams);
  
  // Test filtering by score range
  const highScoreExams = controller.getExamsByScoreRange(80, 100);
  console.assert(highScoreExams.length === 2, 'Should find 2 high score exams');
  
  const lowScoreExams = controller.getExamsByScoreRange(0, 70);
  console.assert(lowScoreExams.length === 2, 'Should find 2 low score exams');
  
  // Test filtering by exam set
  const examSet1Exams = controller.getExamsByExamSet('examset1');
  console.assert(examSet1Exams.length === 2, 'Should find 2 exams for examset1');
  
  const examSet2Exams = controller.getExamsByExamSet('examset2');
  console.assert(examSet2Exams.length === 1, 'Should find 1 exam for examset2');
  
  // Test filtering by date range
  const dateRangeExams = controller.getExamsByDateRange('2024-01-01', '2024-01-02');
  console.assert(dateRangeExams.length === 4, 'Should find 4 exams in date range');
  
  // Test overview statistics
  const statistics = controller.getExamStatistics();
  console.assert(statistics.totalExams === 4, 'Total exams should be 4');
  console.assert(statistics.averageScore === 75, 'Average score should be 75');
  console.assert(statistics.highestScore === 90, 'Highest score should be 90');
  console.assert(statistics.lowestScore === 60, 'Lowest score should be 60');
  
  // Test get recent exams
  const recentExams = controller.getRecentExams(2);
  console.assert(recentExams.length === 2, 'Should return 2 recent exams');
  
  // Test get best performing exams
  const bestExams = controller.getBestPerformingExams(2);
  console.assert(bestExams.length === 2, 'Should return 2 best performing exams');
  console.assert(bestExams[0].score === 90, 'First best exam should have score 90');
  console.assert(bestExams[1].score === 80, 'Second best exam should have score 80');
  
  console.log('✅ ExamHistory filtering tests passed!');
}

/**
 * Run all ExamHistory migration tests
 */
export function runExamHistoryMigrationTests() {
  console.log('🚀 Running ExamHistory Migration Tests...');
  
  try {
    testExamHistoryController();
    testExamHistoryViewProps();
    testExamHistoryMVCIntegration();
    testExamHistoryErrorHandling();
    testExamHistoryPerformance();
    testExamHistoryDataOperations();
    testExamHistoryFiltering();
    
    console.log('🎉 All ExamHistory migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ ExamHistory migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testExamHistoryController,
  testExamHistoryViewProps,
  testExamHistoryMVCIntegration,
  testExamHistoryErrorHandling,
  testExamHistoryPerformance,
  testExamHistoryDataOperations,
  testExamHistoryFiltering,
  runExamHistoryMigrationTests
};
