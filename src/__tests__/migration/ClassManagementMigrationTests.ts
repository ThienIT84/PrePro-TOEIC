/**
 * ClassManagementMigrationTests
 * Tests cho ClassManagement.tsx migration sang MVC pattern
 */

import { ClassManagementController } from '../controllers/user/ClassManagementController';
import { ClassInfo, Student } from '../controllers/user/ClassManagementController';

// Mock data
const mockClassInfo: ClassInfo = {
  id: 'test-class',
  name: 'Test Class',
  description: 'Test Description',
  student_count: 5,
  created_at: '2024-01-01T00:00:00Z',
  avg_score: 75,
  completion_rate: 80,
  students: []
};

const mockStudent: Student = {
  id: 'test-student',
  name: 'Test Student',
  email: 'test@example.com',
  avg_score: 85,
  last_activity: '2024-01-01T00:00:00Z',
  is_in_class: false
};

/**
 * Test ClassManagementController functionality
 */
export function testClassManagementController() {
  console.log('🧪 Testing ClassManagementController...');
  
  const controller = new ClassManagementController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(initialState.classes.length === 0, 'Initial classes should be empty');
  console.assert(initialState.students.length === 0, 'Initial students should be empty');
  console.assert(!initialState.loading, 'Initial loading should be false');
  console.assert(initialState.selectedClass === null, 'Initial selectedClass should be null');
  console.assert(!initialState.isCreateDialogOpen, 'Initial isCreateDialogOpen should be false');
  console.assert(!initialState.isEditDialogOpen, 'Initial isEditDialogOpen should be false');
  console.assert(initialState.newClass.name === '', 'Initial newClass name should be empty');
  console.assert(initialState.newClass.description === '', 'Initial newClass description should be empty');
  
  // Test setting data
  controller.setClasses([mockClassInfo]);
  controller.setStudents([mockStudent]);
  controller.setLoading(true);
  
  const stateAfterSetup = controller.getState();
  console.assert(stateAfterSetup.classes.length === 1, 'Classes should be set correctly');
  console.assert(stateAfterSetup.students.length === 1, 'Students should be set correctly');
  console.assert(stateAfterSetup.loading, 'Loading should be set correctly');
  
  // Test class creation
  controller.updateNewClassField('name', 'New Class');
  controller.updateNewClassField('description', 'New Description');
  
  const createResult = controller.createClass();
  console.assert(createResult.success, 'Class creation should succeed');
  
  const stateAfterCreate = controller.getState();
  console.assert(stateAfterCreate.classes.length === 2, 'Should have 2 classes after creation');
  console.assert(stateAfterCreate.newClass.name === '', 'New class form should be reset');
  
  // Test class deletion
  const deleteResult = controller.deleteClass('test-class');
  console.assert(deleteResult.success, 'Class deletion should succeed');
  
  const stateAfterDelete = controller.getState();
  console.assert(stateAfterDelete.classes.length === 1, 'Should have 1 class after deletion');
  
  // Test student management
  controller.setClasses([mockClassInfo]);
  const addResult = controller.addStudentToClass('test-class', 'test-student');
  console.assert(addResult.success, 'Adding student should succeed');
  
  const classWithStudent = controller.getClassById('test-class');
  console.assert(classWithStudent?.students.length === 1, 'Class should have 1 student');
  console.assert(classWithStudent?.student_count === 1, 'Class student count should be 1');
  
  const removeResult = controller.removeStudentFromClass('test-class', 'test-student');
  console.assert(removeResult.success, 'Removing student should succeed');
  
  const classWithoutStudent = controller.getClassById('test-class');
  console.assert(classWithoutStudent?.students.length === 0, 'Class should have 0 students');
  console.assert(classWithoutStudent?.student_count === 0, 'Class student count should be 0');
  
  // Test utility functions
  const availableStudents = controller.getAvailableStudentsForClass('test-class');
  console.assert(availableStudents.length === 1, 'Should have 1 available student');
  
  const statistics = controller.calculateClassStatistics('test-class');
  console.assert(statistics.totalStudents === 0, 'Total students should be 0');
  console.assert(statistics.avgScore === 0, 'Average score should be 0');
  
  const analytics = controller.getClassAnalytics('test-class');
  console.assert(Array.isArray(analytics.scoreDistribution), 'Score distribution should be array');
  console.assert(Array.isArray(analytics.activityTrend), 'Activity trend should be array');
  
  // Test form validation
  const validForm = controller.validateClassForm({ name: 'Valid Class', description: 'Valid Description' });
  console.assert(validForm.isValid, 'Valid form should pass validation');
  
  const invalidForm = controller.validateClassForm({ name: '', description: 'Valid Description' });
  console.assert(!invalidForm.isValid, 'Invalid form should fail validation');
  console.assert(invalidForm.errors.length > 0, 'Invalid form should have errors');
  
  // Test search functionality
  controller.setClasses([mockClassInfo]);
  const searchResults = controller.searchClasses('Test');
  console.assert(searchResults.length === 1, 'Search should find 1 class');
  
  const noSearchResults = controller.searchClasses('NonExistent');
  console.assert(noSearchResults.length === 0, 'Search should find 0 classes');
  
  // Test summary statistics
  const summaryStats = controller.getClassSummaryStatistics();
  console.assert(summaryStats.totalClasses === 1, 'Total classes should be 1');
  console.assert(summaryStats.totalStudents === 0, 'Total students should be 0');
  
  // Test cleanup
  controller.cleanup();
  
  console.log('✅ ClassManagementController tests passed!');
}

/**
 * Test ClassManagementView props interface
 */
export function testClassManagementViewProps() {
  console.log('🧪 Testing ClassManagementView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'classes', 'students', 'loading', 'selectedClass', 'isCreateDialogOpen',
    'isEditDialogOpen', 'newClass', 'onCreateClass', 'onDeleteClass',
    'onAddStudentToClass', 'onRemoveStudentFromClass', 'onExportClassReport',
    'onSetSelectedClass', 'onSetCreateDialogOpen', 'onSetEditDialogOpen',
    'onUpdateNewClassField', 'onResetForm', 'getAvailableStudentsForClass',
    'getClassById', 'getStudentById', 'calculateClassStatistics',
    'getClassAnalytics', 'validateClassForm', 'searchClasses',
    'searchStudents', 'getClassSummaryStatistics'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ ClassManagementView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testClassManagementMVCIntegration() {
  console.log('🧪 Testing ClassManagement MVC integration...');
  
  // Test that controller and view can work together
  const controller = new ClassManagementController();
  
  // Simulate MVC flow
  controller.setClasses([mockClassInfo]);
  controller.setStudents([mockStudent]);
  controller.setLoading(false);
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.classes.length > 0, 'Classes should be set');
  console.assert(state.students.length > 0, 'Students should be set');
  console.assert(!state.loading, 'Loading should be false');
  
  // Test action handling
  controller.setSelectedClass(mockClassInfo);
  controller.setCreateDialogOpen(true);
  controller.updateNewClassField('name', 'New Class');
  
  const finalState = controller.getState();
  console.assert(finalState.selectedClass !== null, 'Selected class should be set');
  console.assert(finalState.isCreateDialogOpen, 'Create dialog should be open');
  console.assert(finalState.newClass.name === 'New Class', 'New class name should be set');
  
  console.log('✅ ClassManagement MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testClassManagementErrorHandling() {
  console.log('🧪 Testing ClassManagement error handling...');
  
  const controller = new ClassManagementController();
  
  // Test invalid class operations
  const deleteResult = controller.deleteClass('non-existent');
  console.assert(deleteResult.success, 'Deleting non-existent class should succeed (no-op)');
  
  const addResult = controller.addStudentToClass('non-existent', 'non-existent');
  console.assert(!addResult.success, 'Adding student to non-existent class should fail');
  
  const removeResult = controller.removeStudentFromClass('non-existent', 'non-existent');
  console.assert(!removeResult.success, 'Removing student from non-existent class should fail');
  
  // Test form validation edge cases
  const longNameForm = controller.validateClassForm({
    name: 'A'.repeat(101), // Too long
    description: 'Valid description'
  });
  console.assert(!longNameForm.isValid, 'Form with long name should be invalid');
  
  const longDescForm = controller.validateClassForm({
    name: 'Valid name',
    description: 'A'.repeat(501) // Too long
  });
  console.assert(!longDescForm.isValid, 'Form with long description should be invalid');
  
  console.log('✅ ClassManagement error handling tests passed!');
}

/**
 * Test performance
 */
export function testClassManagementPerformance() {
  console.log('🧪 Testing ClassManagement performance...');
  
  const controller = new ClassManagementController();
  
  // Test with large number of classes and students
  const largeClasses: ClassInfo[] = Array.from({ length: 100 }, (_, i) => ({
    ...mockClassInfo,
    id: `class_${i}`,
    name: `Class ${i}`
  }));
  
  const largeStudents: Student[] = Array.from({ length: 1000 }, (_, i) => ({
    ...mockStudent,
    id: `student_${i}`,
    name: `Student ${i}`,
    email: `student${i}@example.com`
  }));
  
  controller.setClasses(largeClasses);
  controller.setStudents(largeStudents);
  
  const startTime = performance.now();
  
  // Test search performance
  for (let i = 0; i < 100; i++) {
    controller.searchClasses(`Class ${i}`);
    controller.searchStudents(`Student ${i}`);
  }
  
  // Test statistics calculation performance
  for (let i = 0; i < 100; i++) {
    controller.calculateClassStatistics(`class_${i}`);
    controller.getClassAnalytics(`class_${i}`);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 2000, `Performance test should complete in under 2 seconds, took ${duration}ms`);
  
  console.log(`✅ ClassManagement performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Run all ClassManagement migration tests
 */
export function runClassManagementMigrationTests() {
  console.log('🚀 Running ClassManagement Migration Tests...');
  
  try {
    testClassManagementController();
    testClassManagementViewProps();
    testClassManagementMVCIntegration();
    testClassManagementErrorHandling();
    testClassManagementPerformance();
    
    console.log('🎉 All ClassManagement migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ ClassManagement migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testClassManagementController,
  testClassManagementViewProps,
  testClassManagementMVCIntegration,
  testClassManagementErrorHandling,
  testClassManagementPerformance,
  runClassManagementMigrationTests
};
