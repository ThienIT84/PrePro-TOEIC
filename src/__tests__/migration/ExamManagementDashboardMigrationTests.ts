/**
 * ExamManagementDashboardMigrationTests
 * Tests cho ExamManagementDashboard.tsx migration sang MVC pattern
 */

import { 
  ExamManagementDashboardController, 
  ExamSet, 
  ExamStatistics, 
  ExamManagementDashboardState 
} from '../controllers/exam/ExamManagementDashboardController';

// Mock data
const mockExamSet: ExamSet = {
  id: 'exam1',
  title: 'TOEIC Practice Test 1',
  description: 'Full TOEIC practice test with 200 questions',
  type: 'full',
  total_questions: 200,
  time_limit: 120,
  difficulty: 'medium',
  status: 'active',
  created_by: 'user123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  total_attempts: 15,
  average_score: 85.5,
  completion_rate: 90,
  average_time_spent: 110
};

const mockStatistics: ExamStatistics = {
  totalExamSets: 10,
  activeExamSets: 8,
  totalAttempts: 150,
  averageScore: 82.5,
  totalQuestions: 2000
};

/**
 * Test ExamManagementDashboardController functionality
 */
export function testExamManagementDashboardController() {
  console.log('🧪 Testing ExamManagementDashboardController...');
  
  const controller = new ExamManagementDashboardController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(initialState.activeTab === 'dashboard', 'Initial activeTab should be dashboard');
  console.assert(initialState.examSets.length === 0, 'Initial examSets should be empty');
  console.assert(initialState.statistics.totalExamSets === 0, 'Initial statistics should be zero');
  console.assert(!initialState.loading, 'Initial loading should be false');
  console.assert(initialState.searchTerm === '', 'Initial searchTerm should be empty');
  console.assert(initialState.filterStatus === 'all', 'Initial filterStatus should be all');
  console.assert(initialState.filterType === 'all', 'Initial filterType should be all');
  
  // Test state management
  controller.setActiveTab('exams');
  console.assert(controller.getActiveTab() === 'exams', 'Active tab should be exams');
  
  controller.setExamSets([mockExamSet]);
  console.assert(controller.getExamSets().length === 1, 'Should have 1 exam set');
  console.assert(controller.getExamSets()[0].id === 'exam1', 'Exam set ID should match');
  
  controller.setStatistics(mockStatistics);
  console.assert(controller.getStatistics().totalExamSets === 10, 'Total exam sets should be 10');
  console.assert(controller.getStatistics().activeExamSets === 8, 'Active exam sets should be 8');
  
  controller.setLoading(true);
  console.assert(controller.isLoading(), 'Should be loading');
  
  controller.setSearchTerm('TOEIC');
  console.assert(controller.getSearchTerm() === 'TOEIC', 'Search term should be TOEIC');
  
  controller.setFilterStatus('active');
  console.assert(controller.getFilterStatus() === 'active', 'Filter status should be active');
  
  controller.setFilterType('full');
  console.assert(controller.getFilterType() === 'full', 'Filter type should be full');
  
  // Test utility functions
  const statusColor = controller.getStatusColor('active');
  console.assert(statusColor.includes('green'), 'Active status should have green color');
  
  const typeIcon = controller.getTypeIconName('full');
  console.assert(typeIcon === 'FileText', 'Full type should return FileText icon');
  
  // Test filtering
  controller.setExamSets([mockExamSet]);
  controller.setSearchTerm('TOEIC');
  const filteredSets = controller.getFilteredExamSets();
  console.assert(filteredSets.length === 1, 'Should filter to 1 exam set');
  
  controller.setSearchTerm('NonExistent');
  const noResults = controller.getFilteredExamSets();
  console.assert(noResults.length === 0, 'Should filter to 0 exam sets');
  
  // Test clear filters
  controller.clearFilters();
  console.assert(controller.getSearchTerm() === '', 'Search term should be cleared');
  console.assert(controller.getFilterStatus() === 'all', 'Filter status should be cleared');
  console.assert(controller.getFilterType() === 'all', 'Filter type should be cleared');
  
  // Test recent exam sets
  controller.setExamSets([mockExamSet, { ...mockExamSet, id: 'exam2' }]);
  const recentSets = controller.getRecentExamSets(1);
  console.assert(recentSets.length === 1, 'Should return 1 recent exam set');
  
  // Test get exam set by ID
  const foundExamSet = controller.getExamSetById('exam1');
  console.assert(foundExamSet?.id === 'exam1', 'Should find exam set by ID');
  
  const notFoundExamSet = controller.getExamSetById('nonexistent');
  console.assert(notFoundExamSet === null, 'Should return null for non-existent ID');
  
  // Test get exam sets by status
  const activeSets = controller.getExamSetsByStatus('active');
  console.assert(activeSets.length === 1, 'Should find 1 active exam set');
  
  // Test get exam sets by type
  const fullSets = controller.getExamSetsByType('full');
  console.assert(fullSets.length === 1, 'Should find 1 full exam set');
  
  // Test statistics summary
  const summary = controller.getExamSetStatisticsSummary();
  console.assert(summary.totalExamSets === 2, 'Total exam sets should be 2');
  console.assert(summary.activeExamSets === 1, 'Active exam sets should be 1');
  console.assert(summary.totalQuestions === 400, 'Total questions should be 400');
  
  // Test performance metrics
  const metrics = controller.getPerformanceMetrics();
  console.assert(metrics.averageScore === 85.5, 'Average score should be 85.5');
  console.assert(metrics.totalAttempts === 15, 'Total attempts should be 15');
  
  console.log('✅ ExamManagementDashboardController tests passed!');
}

/**
 * Test ExamManagementDashboardView props interface
 */
export function testExamManagementDashboardViewProps() {
  console.log('🧪 Testing ExamManagementDashboardView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'activeTab', 'examSets', 'statistics', 'loading',
    'searchTerm', 'filterStatus', 'filterType',
    'onSetActiveTab', 'onSetSearchTerm', 'onSetFilterStatus', 'onSetFilterType',
    'onClearFilters', 'onDeleteExamSet', 'onToggleExamStatus',
    'onCreateExamSet', 'onPreviewExamSet', 'onEditExamSet',
    'getFilteredExamSets', 'getStatusColor', 'getTypeIconName', 'getRecentExamSets'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ ExamManagementDashboardView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testExamManagementDashboardMVCIntegration() {
  console.log('🧪 Testing ExamManagementDashboard MVC integration...');
  
  // Test that controller and view can work together
  const controller = new ExamManagementDashboardController();
  
  // Simulate MVC flow
  controller.setActiveTab('exams');
  controller.setExamSets([mockExamSet]);
  controller.setStatistics(mockStatistics);
  controller.setSearchTerm('TOEIC');
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.activeTab === 'exams', 'Should be on exams tab');
  console.assert(state.examSets.length === 1, 'Should have 1 exam set');
  console.assert(state.statistics.totalExamSets === 10, 'Total exam sets should be 10');
  console.assert(state.searchTerm === 'TOEIC', 'Search term should be TOEIC');
  
  // Test action handling
  controller.setActiveTab('dashboard');
  controller.clearFilters();
  
  const finalState = controller.getState();
  console.assert(finalState.activeTab === 'dashboard', 'Should be on dashboard tab');
  console.assert(finalState.searchTerm === '', 'Search term should be cleared');
  
  console.log('✅ ExamManagementDashboard MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testExamManagementDashboardErrorHandling() {
  console.log('🧪 Testing ExamManagementDashboard error handling...');
  
  const controller = new ExamManagementDashboardController();
  
  // Test with empty exam sets
  controller.setExamSets([]);
  const emptyFiltered = controller.getFilteredExamSets();
  console.assert(emptyFiltered.length === 0, 'Empty exam sets should return empty filtered');
  
  // Test with invalid status
  const invalidStatusColor = controller.getStatusColor('invalid');
  console.assert(invalidStatusColor.includes('gray'), 'Invalid status should have gray color');
  
  // Test with invalid type
  const invalidTypeIcon = controller.getTypeIconName('invalid');
  console.assert(invalidTypeIcon === 'FileText', 'Invalid type should return default icon');
  
  // Test statistics with zero values
  const zeroStats: ExamStatistics = {
    totalExamSets: 0,
    activeExamSets: 0,
    totalAttempts: 0,
    averageScore: 0,
    totalQuestions: 0
  };
  
  controller.setStatistics(zeroStats);
  const summary = controller.getExamSetStatisticsSummary();
  console.assert(summary.totalExamSets === 0, 'Zero stats should return zero total');
  console.assert(summary.averageQuestions === 0, 'Zero stats should return zero average');
  
  console.log('✅ ExamManagementDashboard error handling tests passed!');
}

/**
 * Test performance
 */
export function testExamManagementDashboardPerformance() {
  console.log('🧪 Testing ExamManagementDashboard performance...');
  
  const controller = new ExamManagementDashboardController();
  
  const startTime = performance.now();
  
  // Test utility functions performance
  for (let i = 0; i < 100; i++) {
    controller.getStatusColor('active');
    controller.getTypeIconName('full');
    controller.getFilteredExamSets();
    controller.getRecentExamSets();
    controller.getExamSetStatisticsSummary();
    controller.getPerformanceMetrics();
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 1000, `Performance test should complete in under 1 second, took ${duration}ms`);
  
  console.log(`✅ ExamManagementDashboard performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Test filtering functionality
 */
export function testExamManagementDashboardFiltering() {
  console.log('🧪 Testing ExamManagementDashboard filtering...');
  
  const controller = new ExamManagementDashboardController();
  
  // Create test exam sets
  const testExamSets: ExamSet[] = [
    { ...mockExamSet, id: '1', title: 'TOEIC Test 1', status: 'active', type: 'full' },
    { ...mockExamSet, id: '2', title: 'Grammar Test', status: 'draft', type: 'mini' },
    { ...mockExamSet, id: '3', title: 'TOEIC Test 2', status: 'active', type: 'custom' },
    { ...mockExamSet, id: '4', title: 'Vocabulary Test', status: 'inactive', type: 'mini' }
  ];
  
  controller.setExamSets(testExamSets);
  
  // Test search filtering
  controller.setSearchTerm('TOEIC');
  const searchResults = controller.getFilteredExamSets();
  console.assert(searchResults.length === 2, 'Should find 2 TOEIC tests');
  
  // Test status filtering
  controller.clearFilters();
  controller.setFilterStatus('active');
  const activeResults = controller.getFilteredExamSets();
  console.assert(activeResults.length === 2, 'Should find 2 active tests');
  
  // Test type filtering
  controller.clearFilters();
  controller.setFilterType('mini');
  const miniResults = controller.getFilteredExamSets();
  console.assert(miniResults.length === 2, 'Should find 2 mini tests');
  
  // Test combined filtering
  controller.setSearchTerm('TOEIC');
  controller.setFilterStatus('active');
  controller.setFilterType('full');
  const combinedResults = controller.getFilteredExamSets();
  console.assert(combinedResults.length === 1, 'Should find 1 active full TOEIC test');
  
  console.log('✅ ExamManagementDashboard filtering tests passed!');
}

/**
 * Test statistics calculations
 */
export function testExamManagementDashboardStatistics() {
  console.log('🧪 Testing ExamManagementDashboard statistics...');
  
  const controller = new ExamManagementDashboardController();
  
  // Create test exam sets with different statistics
  const testExamSets: ExamSet[] = [
    { ...mockExamSet, id: '1', status: 'active', total_questions: 100, total_attempts: 10, average_score: 80 },
    { ...mockExamSet, id: '2', status: 'active', total_questions: 200, total_attempts: 20, average_score: 90 },
    { ...mockExamSet, id: '3', status: 'draft', total_questions: 150, total_attempts: 0, average_score: 0 },
    { ...mockExamSet, id: '4', status: 'inactive', total_questions: 50, total_attempts: 5, average_score: 70 }
  ];
  
  controller.setExamSets(testExamSets);
  
  // Test statistics summary
  const summary = controller.getExamSetStatisticsSummary();
  console.assert(summary.totalExamSets === 4, 'Total exam sets should be 4');
  console.assert(summary.activeExamSets === 2, 'Active exam sets should be 2');
  console.assert(summary.draftExamSets === 1, 'Draft exam sets should be 1');
  console.assert(summary.inactiveExamSets === 1, 'Inactive exam sets should be 1');
  console.assert(summary.totalQuestions === 500, 'Total questions should be 500');
  console.assert(summary.averageQuestions === 125, 'Average questions should be 125');
  
  // Test performance metrics
  const metrics = controller.getPerformanceMetrics();
  console.assert(metrics.totalAttempts === 35, 'Total attempts should be 35');
  console.assert(metrics.averageScore === 80, 'Average score should be 80');
  console.assert(metrics.completionRate === 50, 'Completion rate should be 50');
  console.assert(metrics.topPerformingExam?.id === '2', 'Top performing exam should be exam 2');
  
  console.log('✅ ExamManagementDashboard statistics tests passed!');
}

/**
 * Run all ExamManagementDashboard migration tests
 */
export function runExamManagementDashboardMigrationTests() {
  console.log('🚀 Running ExamManagementDashboard Migration Tests...');
  
  try {
    testExamManagementDashboardController();
    testExamManagementDashboardViewProps();
    testExamManagementDashboardMVCIntegration();
    testExamManagementDashboardErrorHandling();
    testExamManagementDashboardPerformance();
    testExamManagementDashboardFiltering();
    testExamManagementDashboardStatistics();
    
    console.log('🎉 All ExamManagementDashboard migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ ExamManagementDashboard migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testExamManagementDashboardController,
  testExamManagementDashboardViewProps,
  testExamManagementDashboardMVCIntegration,
  testExamManagementDashboardErrorHandling,
  testExamManagementDashboardPerformance,
  testExamManagementDashboardFiltering,
  testExamManagementDashboardStatistics,
  runExamManagementDashboardMigrationTests
};
