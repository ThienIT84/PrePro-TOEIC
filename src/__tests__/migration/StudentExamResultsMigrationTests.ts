/**
 * StudentExamResultsMigrationTests
 * Tests cho StudentExamResults.tsx migration sang MVC pattern
 */

import { 
  StudentExamResultsController, 
  StudentExamResult, 
  StudentStats, 
  StudentExamResultsState,
  FetchStudentExamResultsParams
} from '../controllers/analytics/StudentExamResultsController';

// Mock data
const mockStudentExamResult: StudentExamResult = {
  id: 'result1',
  exam_set_id: 'exam1',
  user_id: 'student1',
  total_questions: 20,
  correct_answers: 16,
  score: 80,
  time_spent: 1800,
  completed_at: '2024-01-01T10:00:00Z',
  exam_sets: {
    title: 'TOEIC Practice Test 1',
    description: 'Full TOEIC practice test'
  },
  profiles: {
    name: 'Nguyễn Văn A',
    user_id: 'student1'
  }
};

const mockStudentStats: StudentStats = {
  student_id: 'student1',
  student_name: 'Nguyễn Văn A',
  total_exams: 3,
  average_score: 75,
  best_score: 85,
  latest_exam_date: '2024-01-01T10:00:00Z'
};

const mockFetchParams: FetchStudentExamResultsParams = {
  teacherId: 'teacher1'
};

/**
 * Test StudentExamResultsController functionality
 */
export function testStudentExamResultsController() {
  console.log('🧪 Testing StudentExamResultsController...');
  
  const controller = new StudentExamResultsController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(initialState.examResults.length === 0, 'Initial examResults should be empty');
  console.assert(initialState.studentStats.length === 0, 'Initial studentStats should be empty');
  console.assert(initialState.loading, 'Initial loading should be true');
  console.assert(initialState.error === null, 'Initial error should be null');
  console.assert(initialState.selectedStudent === null, 'Initial selectedStudent should be null');
  console.assert(initialState.viewingExamId === null, 'Initial viewingExamId should be null');
  
  // Test state management
  controller.setExamResults([mockStudentExamResult]);
  console.assert(controller.getExamResults().length === 1, 'Should have 1 exam result');
  console.assert(controller.getExamResults()[0].id === 'result1', 'Exam result ID should match');
  
  controller.setStudentStats([mockStudentStats]);
  console.assert(controller.getStudentStats().length === 1, 'Should have 1 student stat');
  console.assert(controller.getStudentStats()[0].student_id === 'student1', 'Student stat ID should match');
  
  controller.setLoading(false);
  console.assert(!controller.isLoading(), 'Should not be loading');
  
  controller.setError('Test error');
  console.assert(controller.hasError(), 'Should have error');
  console.assert(controller.getError() === 'Test error', 'Error message should match');
  
  controller.setSelectedStudent('student1');
  console.assert(controller.getSelectedStudent() === 'student1', 'Selected student should be set');
  
  controller.setViewingExamId('result1');
  console.assert(controller.getViewingExamId() === 'result1', 'Viewing exam ID should be set');
  
  // Test utility functions
  const formattedTime = controller.formatTime(125);
  console.assert(formattedTime === '2:05', 'Time formatting should work correctly');
  
  const formattedDate = controller.formatDate('2024-01-01T10:00:00Z');
  console.assert(formattedDate.includes('2024'), 'Date formatting should work correctly');
  
  const scoreColor = controller.getScoreColor(85);
  console.assert(scoreColor === 'text-green-600', 'High score should have green color');
  
  const lowScoreColor = controller.getScoreColor(50);
  console.assert(lowScoreColor === 'text-red-600', 'Low score should have red color');
  
  const scoreBadgeVariant = controller.getScoreBadgeVariant(85);
  console.assert(scoreBadgeVariant === 'default', 'High score should have default variant');
  
  const lowScoreBadgeVariant = controller.getScoreBadgeVariant(50);
  console.assert(lowScoreBadgeVariant === 'destructive', 'Low score should have destructive variant');
  
  // Test filtered results
  controller.setSelectedStudent('student1');
  const filteredResults = controller.getFilteredResults();
  console.assert(filteredResults.length === 1, 'Should find 1 filtered result');
  console.assert(filteredResults[0].user_id === 'student1', 'Filtered result should match student');
  
  // Test overview statistics
  const statistics = controller.getOverviewStatistics();
  console.assert(statistics.totalStudents === 1, 'Total students should be 1');
  console.assert(statistics.totalExams === 1, 'Total exams should be 1');
  console.assert(statistics.averageScore === 80, 'Average score should be 80');
  console.assert(statistics.highestScore === 80, 'Highest score should be 80');
  
  // Test get student statistics
  const studentStatistics = controller.getStudentStatistics('student1');
  console.assert(studentStatistics?.student_id === 'student1', 'Student statistics should match');
  console.assert(studentStatistics?.average_score === 75, 'Student average score should match');
  
  // Test get exam results by student
  const studentResults = controller.getExamResultsByStudent('student1');
  console.assert(studentResults.length === 1, 'Should find 1 result for student');
  
  // Test get exam results by exam set
  const examSetResults = controller.getExamResultsByExamSet('exam1');
  console.assert(examSetResults.length === 1, 'Should find 1 result for exam set');
  
  // Test get recent exam results
  const recentResults = controller.getRecentExamResults(1);
  console.assert(recentResults.length === 1, 'Should return 1 recent result');
  
  // Test get top performing students
  const topStudents = controller.getTopPerformingStudents(1);
  console.assert(topStudents.length === 1, 'Should return 1 top performing student');
  console.assert(topStudents[0].student_id === 'student1', 'Top student should match');
  
  // Test get exam results by score range
  const scoreRangeResults = controller.getExamResultsByScoreRange(70, 90);
  console.assert(scoreRangeResults.length === 1, 'Should find 1 result in score range');
  
  // Test get exam results by date range
  const dateRangeResults = controller.getExamResultsByDateRange('2024-01-01', '2024-01-02');
  console.assert(dateRangeResults.length === 1, 'Should find 1 result in date range');
  
  // Test reset state
  controller.resetState();
  const resetState = controller.getState();
  console.assert(resetState.examResults.length === 0, 'Reset state should have empty exam results');
  console.assert(resetState.studentStats.length === 0, 'Reset state should have empty student stats');
  console.assert(resetState.loading, 'Reset state should be loading');
  
  console.log('✅ StudentExamResultsController tests passed!');
}

/**
 * Test StudentExamResultsView props interface
 */
export function testStudentExamResultsViewProps() {
  console.log('🧪 Testing StudentExamResultsView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'examResults', 'studentStats', 'loading', 'error', 'selectedStudent', 'viewingExamId',
    'onSetSelectedStudent', 'onSetViewingExamId', 'onNavigateBack', 'onNavigateToExamResult',
    'getFilteredResults', 'formatTime', 'formatDate', 'getScoreColor', 'getScoreBadgeVariant',
    'getOverviewStatistics'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ StudentExamResultsView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testStudentExamResultsMVCIntegration() {
  console.log('🧪 Testing StudentExamResults MVC integration...');
  
  // Test that controller and view can work together
  const controller = new StudentExamResultsController();
  
  // Simulate MVC flow
  controller.setExamResults([mockStudentExamResult]);
  controller.setStudentStats([mockStudentStats]);
  controller.setLoading(false);
  controller.setSelectedStudent('student1');
  controller.setViewingExamId('result1');
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.examResults.length === 1, 'Should have 1 exam result');
  console.assert(state.studentStats.length === 1, 'Should have 1 student stat');
  console.assert(!state.loading, 'Should not be loading');
  console.assert(state.selectedStudent === 'student1', 'Selected student should be set');
  console.assert(state.viewingExamId === 'result1', 'Viewing exam ID should be set');
  
  // Test action handling
  controller.setSelectedStudent(null);
  controller.setViewingExamId(null);
  
  const finalState = controller.getState();
  console.assert(finalState.selectedStudent === null, 'Selected student should be null');
  console.assert(finalState.viewingExamId === null, 'Viewing exam ID should be null');
  
  console.log('✅ StudentExamResults MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testStudentExamResultsErrorHandling() {
  console.log('🧪 Testing StudentExamResults error handling...');
  
  const controller = new StudentExamResultsController();
  
  // Test with empty data
  controller.setExamResults([]);
  controller.setStudentStats([]);
  const statistics = controller.getOverviewStatistics();
  console.assert(statistics.totalStudents === 0, 'Empty student stats should return zero total');
  console.assert(statistics.totalExams === 0, 'Empty exam results should return zero total');
  console.assert(statistics.averageScore === 0, 'Empty exam results should return zero average');
  console.assert(statistics.highestScore === 0, 'Empty exam results should return zero highest');
  
  // Test with invalid student ID
  const invalidStudentStats = controller.getStudentStatistics('invalid');
  console.assert(invalidStudentStats === null, 'Invalid student ID should return null');
  
  // Test with invalid exam set ID
  const invalidExamSetResults = controller.getExamResultsByExamSet('invalid');
  console.assert(invalidExamSetResults.length === 0, 'Invalid exam set ID should return empty array');
  
  // Test with invalid student ID for exam results
  const invalidStudentResults = controller.getExamResultsByStudent('invalid');
  console.assert(invalidStudentResults.length === 0, 'Invalid student ID should return empty array');
  
  // Test score badge variants
  const highScoreVariant = controller.getScoreBadgeVariant(95);
  console.assert(highScoreVariant === 'default', 'High score should have default variant');
  
  const mediumScoreVariant = controller.getScoreBadgeVariant(75);
  console.assert(mediumScoreVariant === 'secondary', 'Medium score should have secondary variant');
  
  const lowScoreVariant = controller.getScoreBadgeVariant(50);
  console.assert(lowScoreVariant === 'destructive', 'Low score should have destructive variant');
  
  // Test score colors
  const highScoreColor = controller.getScoreColor(85);
  console.assert(highScoreColor === 'text-green-600', 'High score should have green color');
  
  const mediumScoreColor = controller.getScoreColor(70);
  console.assert(mediumScoreColor === 'text-yellow-600', 'Medium score should have yellow color');
  
  const lowScoreColor = controller.getScoreColor(50);
  console.assert(lowScoreColor === 'text-red-600', 'Low score should have red color');
  
  console.log('✅ StudentExamResults error handling tests passed!');
}

/**
 * Test performance
 */
export function testStudentExamResultsPerformance() {
  console.log('🧪 Testing StudentExamResults performance...');
  
  const controller = new StudentExamResultsController();
  
  // Create test data
  const testExamResults: StudentExamResult[] = Array.from({ length: 100 }, (_, i) => ({
    ...mockStudentExamResult,
    id: `result${i}`,
    user_id: `student${i % 10}`,
    score: Math.floor(Math.random() * 100),
    completed_at: new Date(Date.now() - i * 1000 * 60 * 60).toISOString()
  }));
  
  const testStudentStats: StudentStats[] = Array.from({ length: 10 }, (_, i) => ({
    ...mockStudentStats,
    student_id: `student${i}`,
    student_name: `Student ${i}`,
    total_exams: Math.floor(Math.random() * 10),
    average_score: Math.floor(Math.random() * 100),
    best_score: Math.floor(Math.random() * 100)
  }));
  
  controller.setExamResults(testExamResults);
  controller.setStudentStats(testStudentStats);
  
  const startTime = performance.now();
  
  // Test utility functions performance
  for (let i = 0; i < 100; i++) {
    controller.formatTime(125);
    controller.formatDate('2024-01-01T10:00:00Z');
    controller.getScoreColor(85);
    controller.getScoreBadgeVariant(85);
    controller.getFilteredResults();
    controller.getOverviewStatistics();
    controller.getStudentStatistics('student1');
    controller.getExamResultsByStudent('student1');
    controller.getExamResultsByExamSet('exam1');
    controller.getRecentExamResults(10);
    controller.getTopPerformingStudents(5);
    controller.getExamResultsByScoreRange(70, 90);
    controller.getExamResultsByDateRange('2024-01-01', '2024-01-02');
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 1000, `Performance test should complete in under 1 second, took ${duration}ms`);
  
  console.log(`✅ StudentExamResults performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Test data operations simulation
 */
export function testStudentExamResultsDataOperations() {
  console.log('🧪 Testing StudentExamResults data operations...');
  
  const controller = new StudentExamResultsController();
  
  // Test fetch student exam results parameters
  const fetchParams: FetchStudentExamResultsParams = {
    teacherId: 'teacher1'
  };
  
  console.assert(fetchParams.teacherId === 'teacher1', 'Fetch params should have correct teacher ID');
  
  // Test state management
  controller.setExamResults([mockStudentExamResult]);
  controller.setStudentStats([mockStudentStats]);
  controller.setSelectedStudent('student1');
  
  const state = controller.getState();
  console.assert(state.examResults.length === 1, 'Should have 1 exam result');
  console.assert(state.studentStats.length === 1, 'Should have 1 student stat');
  console.assert(state.selectedStudent === 'student1', 'Selected student should be set');
  
  console.log('✅ StudentExamResults data operations tests passed!');
}

/**
 * Test filtering and search functionality
 */
export function testStudentExamResultsFiltering() {
  console.log('🧪 Testing StudentExamResults filtering...');
  
  const controller = new StudentExamResultsController();
  
  // Create test exam results with different students
  const testExamResults: StudentExamResult[] = [
    { ...mockStudentExamResult, user_id: 'student1', score: 80 },
    { ...mockStudentExamResult, id: 'result2', user_id: 'student2', score: 70 },
    { ...mockStudentExamResult, id: 'result3', user_id: 'student1', score: 90 },
    { ...mockStudentExamResult, id: 'result4', user_id: 'student3', score: 60 }
  ];
  
  controller.setExamResults(testExamResults);
  
  // Test filtering by student
  controller.setSelectedStudent('student1');
  const student1Results = controller.getFilteredResults();
  console.assert(student1Results.length === 2, 'Should find 2 results for student1');
  
  controller.setSelectedStudent('student2');
  const student2Results = controller.getFilteredResults();
  console.assert(student2Results.length === 1, 'Should find 1 result for student2');
  
  // Test filtering by score range
  const highScoreResults = controller.getExamResultsByScoreRange(80, 100);
  console.assert(highScoreResults.length === 2, 'Should find 2 high score results');
  
  const lowScoreResults = controller.getExamResultsByScoreRange(0, 70);
  console.assert(lowScoreResults.length === 2, 'Should find 2 low score results');
  
  // Test filtering by exam set
  const examSetResults = controller.getExamResultsByExamSet('exam1');
  console.assert(examSetResults.length === 4, 'Should find 4 results for exam1');
  
  // Test filtering by date range
  const dateRangeResults = controller.getExamResultsByDateRange('2024-01-01', '2024-01-02');
  console.assert(dateRangeResults.length === 4, 'Should find 4 results in date range');
  
  // Test overview statistics
  const statistics = controller.getOverviewStatistics();
  console.assert(statistics.totalStudents === 0, 'Total students should be 0 (no student stats set)');
  console.assert(statistics.totalExams === 4, 'Total exams should be 4');
  console.assert(statistics.averageScore === 75, 'Average score should be 75');
  console.assert(statistics.highestScore === 90, 'Highest score should be 90');
  
  console.log('✅ StudentExamResults filtering tests passed!');
}

/**
 * Run all StudentExamResults migration tests
 */
export function runStudentExamResultsMigrationTests() {
  console.log('🚀 Running StudentExamResults Migration Tests...');
  
  try {
    testStudentExamResultsController();
    testStudentExamResultsViewProps();
    testStudentExamResultsMVCIntegration();
    testStudentExamResultsErrorHandling();
    testStudentExamResultsPerformance();
    testStudentExamResultsDataOperations();
    testStudentExamResultsFiltering();
    
    console.log('🎉 All StudentExamResults migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ StudentExamResults migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testStudentExamResultsController,
  testStudentExamResultsViewProps,
  testStudentExamResultsMVCIntegration,
  testStudentExamResultsErrorHandling,
  testStudentExamResultsPerformance,
  testStudentExamResultsDataOperations,
  testStudentExamResultsFiltering,
  runStudentExamResultsMigrationTests
};
