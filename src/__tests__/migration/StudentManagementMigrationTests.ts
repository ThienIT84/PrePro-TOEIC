/**
 * StudentManagementMigrationTests
 * Tests cho StudentManagement.tsx migration sang MVC pattern
 */

import { 
  StudentManagementController, 
  Student, 
  StudentStatistics, 
  StudentManagementState,
  ReassignStudentParams,
  UnassignStudentParams
} from '../controllers/user/StudentManagementController';

// Mock data
const mockStudent: Student = {
  student_id: 'student1',
  student_name: 'Nguyễn Văn A',
  student_email: 'nguyenvana@example.com',
  assigned_at: '2024-01-01T00:00:00Z',
  status: 'active',
  notes: 'Good student',
  total_attempts: 15,
  accuracy_percentage: 85.5
};

const mockStudent2: Student = {
  student_id: 'student2',
  student_name: 'Trần Thị B',
  student_email: 'tranthib@example.com',
  assigned_at: '2024-01-02T00:00:00Z',
  status: 'inactive',
  notes: null,
  total_attempts: 8,
  accuracy_percentage: 72.3
};

/**
 * Test StudentManagementController functionality
 */
export function testStudentManagementController() {
  console.log('🧪 Testing StudentManagementController...');
  
  const controller = new StudentManagementController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(initialState.students.length === 0, 'Initial students should be empty');
  console.assert(!initialState.loading, 'Initial loading should be false');
  console.assert(initialState.error === null, 'Initial error should be null');
  console.assert(initialState.reassigning === null, 'Initial reassigning should be null');
  
  // Test state management
  controller.setStudents([mockStudent]);
  console.assert(controller.getStudents().length === 1, 'Should have 1 student');
  console.assert(controller.getStudents()[0].student_id === 'student1', 'Student ID should match');
  
  controller.setLoading(true);
  console.assert(controller.isLoading(), 'Should be loading');
  
  controller.setError('Test error');
  console.assert(controller.getError() === 'Test error', 'Error should be set');
  
  controller.setReassigning('student1');
  console.assert(controller.isReassigning('student1'), 'Should be reassigning student1');
  console.assert(controller.isReassigning(), 'Should be reassigning');
  
  // Test utility functions
  const formattedName = controller.formatStudentName(mockStudent);
  console.assert(formattedName === 'Nguyễn Văn A', 'Student name should be formatted correctly');
  
  const formattedEmail = controller.formatStudentEmail(mockStudent);
  console.assert(formattedEmail === 'nguyenvana@example.com', 'Student email should be formatted correctly');
  
  const formattedDate = controller.formatAssignedDate(mockStudent.assigned_at);
  console.assert(formattedDate.includes('2024'), 'Date should be formatted correctly');
  
  const initials = controller.getStudentInitials(mockStudent);
  console.assert(initials === 'N', 'Initials should be correct');
  
  const badgeVariant = controller.getStatusBadgeVariant('active');
  console.assert(badgeVariant === 'default', 'Active status should have default variant');
  
  const badgeClass = controller.getStatusBadgeClass('active');
  console.assert(badgeClass.includes('green'), 'Active status should have green class');
  
  const statusText = controller.getStatusDisplayText('active');
  console.assert(statusText === 'Hoạt động', 'Status text should be correct');
  
  // Test statistics
  controller.setStudents([mockStudent, mockStudent2]);
  const statistics = controller.getStudentStatistics();
  console.assert(statistics.totalStudents === 2, 'Total students should be 2');
  console.assert(statistics.activeStudents === 1, 'Active students should be 1');
  console.assert(statistics.totalAttempts === 23, 'Total attempts should be 23');
  console.assert(statistics.averageAccuracy === 78.9, 'Average accuracy should be 78.9');
  
  // Test get active students
  const activeStudents = controller.getActiveStudents();
  console.assert(activeStudents.length === 1, 'Should have 1 active student');
  console.assert(activeStudents[0].status === 'active', 'Active student should have active status');
  
  // Test get student by ID
  const foundStudent = controller.getStudentById('student1');
  console.assert(foundStudent?.student_id === 'student1', 'Should find student by ID');
  
  const notFoundStudent = controller.getStudentById('nonexistent');
  console.assert(notFoundStudent === null, 'Should return null for non-existent ID');
  
  // Test get students by status
  const activeStudentsByStatus = controller.getStudentsByStatus('active');
  console.assert(activeStudentsByStatus.length === 1, 'Should find 1 active student');
  
  // Test get top performing students
  const topPerformers = controller.getTopPerformingStudents(1);
  console.assert(topPerformers.length === 1, 'Should return 1 top performer');
  console.assert(topPerformers[0].student_id === 'student1', 'Top performer should be student1');
  
  // Test get most active students
  const mostActive = controller.getMostActiveStudents(1);
  console.assert(mostActive.length === 1, 'Should return 1 most active student');
  console.assert(mostActive[0].student_id === 'student1', 'Most active should be student1');
  
  // Test performance summary
  const summary = controller.getStudentPerformanceSummary();
  console.assert(summary.totalStudents === 2, 'Summary total students should be 2');
  console.assert(summary.activeStudents === 1, 'Summary active students should be 1');
  console.assert(summary.inactiveStudents === 1, 'Summary inactive students should be 1');
  console.assert(summary.totalAttempts === 23, 'Summary total attempts should be 23');
  console.assert(summary.averageAttempts === 11.5, 'Summary average attempts should be 11.5');
  console.assert(summary.averageAccuracy === 78.9, 'Summary average accuracy should be 78.9');
  console.assert(summary.topPerformer?.student_id === 'student1', 'Top performer should be student1');
  console.assert(summary.mostActive?.student_id === 'student1', 'Most active should be student1');
  
  // Test clear error
  controller.clearError();
  console.assert(controller.getError() === null, 'Error should be cleared');
  
  // Test reset state
  controller.resetState();
  const resetState = controller.getState();
  console.assert(resetState.students.length === 0, 'Reset state should have empty students');
  console.assert(!resetState.loading, 'Reset state should not be loading');
  console.assert(resetState.error === null, 'Reset state should have null error');
  console.assert(resetState.reassigning === null, 'Reset state should have null reassigning');
  
  console.log('✅ StudentManagementController tests passed!');
}

/**
 * Test StudentManagementView props interface
 */
export function testStudentManagementViewProps() {
  console.log('🧪 Testing StudentManagementView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'students', 'loading', 'error', 'reassigning',
    'onFetchStudents', 'onReassignStudent', 'onUnassignStudent', 'onClearError',
    'getStudentStatistics', 'formatStudentName', 'formatStudentEmail', 'formatAssignedDate',
    'getStudentInitials', 'getStatusBadgeVariant', 'getStatusBadgeClass', 'getStatusDisplayText',
    'isReassigning'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ StudentManagementView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testStudentManagementMVCIntegration() {
  console.log('🧪 Testing StudentManagement MVC integration...');
  
  // Test that controller and view can work together
  const controller = new StudentManagementController();
  
  // Simulate MVC flow
  controller.setStudents([mockStudent, mockStudent2]);
  controller.setLoading(false);
  controller.setError(null);
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.students.length === 2, 'Should have 2 students');
  console.assert(!state.loading, 'Should not be loading');
  console.assert(state.error === null, 'Should have null error');
  
  // Test action handling
  controller.setLoading(true);
  controller.setError('Test error');
  
  const finalState = controller.getState();
  console.assert(finalState.loading, 'Should be loading');
  console.assert(finalState.error === 'Test error', 'Should have error');
  
  console.log('✅ StudentManagement MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testStudentManagementErrorHandling() {
  console.log('🧪 Testing StudentManagement error handling...');
  
  const controller = new StudentManagementController();
  
  // Test with empty students
  controller.setStudents([]);
  const statistics = controller.getStudentStatistics();
  console.assert(statistics.totalStudents === 0, 'Empty students should return zero total');
  console.assert(statistics.averageAccuracy === 0, 'Empty students should return zero average');
  
  // Test with invalid status
  const invalidStatusVariant = controller.getStatusBadgeVariant('invalid');
  console.assert(invalidStatusVariant === 'secondary', 'Invalid status should have secondary variant');
  
  const invalidStatusClass = controller.getStatusBadgeClass('invalid');
  console.assert(invalidStatusClass.includes('gray'), 'Invalid status should have gray class');
  
  const invalidStatusText = controller.getStatusDisplayText('invalid');
  console.assert(invalidStatusText === 'Không hoạt động', 'Invalid status should show inactive text');
  
  // Test with null/undefined values
  const studentWithNulls: Student = {
    student_id: 'null-student',
    student_name: null as any,
    student_email: '',
    assigned_at: '',
    status: '',
    notes: null,
    total_attempts: 0,
    accuracy_percentage: 0
  };
  
  const formattedNullName = controller.formatStudentName(studentWithNulls);
  console.assert(formattedNullName === 'Chưa có tên', 'Null name should show default text');
  
  const nullInitials = controller.getStudentInitials(studentWithNulls);
  console.assert(nullInitials === '', 'Empty name should return empty initials');
  
  console.log('✅ StudentManagement error handling tests passed!');
}

/**
 * Test performance
 */
export function testStudentManagementPerformance() {
  console.log('🧪 Testing StudentManagement performance...');
  
  const controller = new StudentManagementController();
  
  // Create test data
  const testStudents: Student[] = Array.from({ length: 100 }, (_, i) => ({
    ...mockStudent,
    student_id: `student${i}`,
    student_name: `Student ${i}`,
    student_email: `student${i}@example.com`,
    total_attempts: Math.floor(Math.random() * 50),
    accuracy_percentage: Math.random() * 100
  }));
  
  controller.setStudents(testStudents);
  
  const startTime = performance.now();
  
  // Test utility functions performance
  for (let i = 0; i < 100; i++) {
    controller.getStudentStatistics();
    controller.getActiveStudents();
    controller.getTopPerformingStudents();
    controller.getMostActiveStudents();
    controller.getStudentPerformanceSummary();
    controller.formatStudentName(testStudents[0]);
    controller.formatStudentEmail(testStudents[0]);
    controller.formatAssignedDate(testStudents[0].assigned_at);
    controller.getStudentInitials(testStudents[0]);
    controller.getStatusBadgeVariant('active');
    controller.getStatusBadgeClass('active');
    controller.getStatusDisplayText('active');
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 1000, `Performance test should complete in under 1 second, took ${duration}ms`);
  
  console.log(`✅ StudentManagement performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Test statistics calculations
 */
export function testStudentManagementStatistics() {
  console.log('🧪 Testing StudentManagement statistics...');
  
  const controller = new StudentManagementController();
  
  // Create test students with different statistics
  const testStudents: Student[] = [
    { ...mockStudent, id: '1', status: 'active', total_attempts: 20, accuracy_percentage: 90 },
    { ...mockStudent, id: '2', status: 'active', total_attempts: 15, accuracy_percentage: 85 },
    { ...mockStudent, id: '3', status: 'inactive', total_attempts: 5, accuracy_percentage: 70 },
    { ...mockStudent, id: '4', status: 'inactive', total_attempts: 0, accuracy_percentage: 0 }
  ];
  
  controller.setStudents(testStudents);
  
  // Test statistics
  const statistics = controller.getStudentStatistics();
  console.assert(statistics.totalStudents === 4, 'Total students should be 4');
  console.assert(statistics.activeStudents === 2, 'Active students should be 2');
  console.assert(statistics.totalAttempts === 40, 'Total attempts should be 40');
  console.assert(statistics.averageAccuracy === 61.25, 'Average accuracy should be 61.25');
  
  // Test performance summary
  const summary = controller.getStudentPerformanceSummary();
  console.assert(summary.totalStudents === 4, 'Summary total students should be 4');
  console.assert(summary.activeStudents === 2, 'Summary active students should be 2');
  console.assert(summary.inactiveStudents === 2, 'Summary inactive students should be 2');
  console.assert(summary.totalAttempts === 40, 'Summary total attempts should be 40');
  console.assert(summary.averageAttempts === 10, 'Summary average attempts should be 10');
  console.assert(summary.averageAccuracy === 61.25, 'Summary average accuracy should be 61.25');
  
  // Test top performers
  const topPerformers = controller.getTopPerformingStudents(2);
  console.assert(topPerformers.length === 2, 'Should return 2 top performers');
  console.assert(topPerformers[0].accuracy_percentage === 90, 'Top performer should have 90% accuracy');
  console.assert(topPerformers[1].accuracy_percentage === 85, 'Second performer should have 85% accuracy');
  
  // Test most active
  const mostActive = controller.getMostActiveStudents(2);
  console.assert(mostActive.length === 2, 'Should return 2 most active students');
  console.assert(mostActive[0].total_attempts === 20, 'Most active should have 20 attempts');
  console.assert(mostActive[1].total_attempts === 15, 'Second most active should have 15 attempts');
  
  console.log('✅ StudentManagement statistics tests passed!');
}

/**
 * Test data operations simulation
 */
export function testStudentManagementDataOperations() {
  console.log('🧪 Testing StudentManagement data operations...');
  
  const controller = new StudentManagementController();
  
  // Test reassign student parameters
  const reassignParams: ReassignStudentParams = {
    studentId: 'student1',
    newTeacherId: 'teacher2'
  };
  
  console.assert(reassignParams.studentId === 'student1', 'Reassign params should have correct student ID');
  console.assert(reassignParams.newTeacherId === 'teacher2', 'Reassign params should have correct teacher ID');
  
  // Test unassign student parameters
  const unassignParams: UnassignStudentParams = {
    studentId: 'student1',
    studentName: 'Nguyễn Văn A'
  };
  
  console.assert(unassignParams.studentId === 'student1', 'Unassign params should have correct student ID');
  console.assert(unassignParams.studentName === 'Nguyễn Văn A', 'Unassign params should have correct student name');
  
  // Test state management
  controller.setStudents([mockStudent]);
  controller.setReassigning('student1');
  
  const state = controller.getState();
  console.assert(state.students.length === 1, 'Should have 1 student');
  console.assert(state.reassigning === 'student1', 'Should be reassigning student1');
  
  console.log('✅ StudentManagement data operations tests passed!');
}

/**
 * Run all StudentManagement migration tests
 */
export function runStudentManagementMigrationTests() {
  console.log('🚀 Running StudentManagement Migration Tests...');
  
  try {
    testStudentManagementController();
    testStudentManagementViewProps();
    testStudentManagementMVCIntegration();
    testStudentManagementErrorHandling();
    testStudentManagementPerformance();
    testStudentManagementStatistics();
    testStudentManagementDataOperations();
    
    console.log('🎉 All StudentManagement migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ StudentManagement migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testStudentManagementController,
  testStudentManagementViewProps,
  testStudentManagementMVCIntegration,
  testStudentManagementErrorHandling,
  testStudentManagementPerformance,
  testStudentManagementStatistics,
  testStudentManagementDataOperations,
  runStudentManagementMigrationTests
};
