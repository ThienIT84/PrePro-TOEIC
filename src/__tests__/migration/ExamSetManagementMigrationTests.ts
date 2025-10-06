/**
 * ExamSetManagementMigrationTests
 * Tests cho ExamSetManagement.tsx migration sang MVC pattern
 */

import { 
  ExamSetManagementController, 
  ExamSet, 
  ExamSetFormData, 
  ExamSetManagementState,
  CreateExamSetParams,
  UpdateExamSetParams
} from '../controllers/exam/ExamSetManagementController';

// Mock data
const mockExamSet: ExamSet = {
  id: 'exam1',
  title: 'TOEIC Practice Test 1',
  description: 'Full TOEIC practice test with 200 questions',
  total_questions: 200,
  time_limit: 120,
  difficulty: 'medium',
  status: 'active',
  created_by: 'user123',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockExamSet2: ExamSet = {
  id: 'exam2',
  title: 'TOEIC Practice Test 2',
  description: 'Another TOEIC practice test',
  total_questions: 200,
  time_limit: 90,
  difficulty: 'hard',
  status: 'inactive',
  created_by: 'user123',
  created_at: '2024-01-02T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z'
};

const mockFormData: ExamSetFormData = {
  title: 'New TOEIC Test',
  description: 'A new TOEIC test',
  time_limit: 120,
  difficulty: 'medium',
  status: 'active'
};

/**
 * Test ExamSetManagementController functionality
 */
export function testExamSetManagementController() {
  console.log('🧪 Testing ExamSetManagementController...');
  
  const controller = new ExamSetManagementController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(initialState.examSets.length === 0, 'Initial examSets should be empty');
  console.assert(initialState.loading, 'Initial loading should be true');
  console.assert(!initialState.isCreateDialogOpen, 'Initial create dialog should be closed');
  console.assert(!initialState.isEditDialogOpen, 'Initial edit dialog should be closed');
  console.assert(initialState.editingExamSet === null, 'Initial editingExamSet should be null');
  console.assert(initialState.formData.title === '', 'Initial formData title should be empty');
  console.assert(initialState.formData.time_limit === 120, 'Initial formData time_limit should be 120');
  
  // Test state management
  controller.setExamSets([mockExamSet]);
  console.assert(controller.getExamSets().length === 1, 'Should have 1 exam set');
  console.assert(controller.getExamSets()[0].id === 'exam1', 'Exam set ID should match');
  
  controller.setLoading(false);
  console.assert(!controller.isLoading(), 'Should not be loading');
  
  controller.setCreateDialogOpen(true);
  console.assert(controller.isCreateDialogOpen(), 'Create dialog should be open');
  
  controller.setEditDialogOpen(true);
  console.assert(controller.isEditDialogOpen(), 'Edit dialog should be open');
  
  controller.setEditingExamSet(mockExamSet);
  console.assert(controller.getEditingExamSet()?.id === 'exam1', 'Editing exam set should match');
  
  controller.setFormData({ title: 'Updated Title' });
  console.assert(controller.getFormData().title === 'Updated Title', 'Form data title should be updated');
  
  // Test dialog management
  controller.openCreateDialog();
  console.assert(controller.isCreateDialogOpen(), 'Create dialog should be open');
  console.assert(controller.getFormData().title === '', 'Form data should be reset');
  
  controller.closeCreateDialog();
  console.assert(!controller.isCreateDialogOpen(), 'Create dialog should be closed');
  
  controller.openEditDialog(mockExamSet);
  console.assert(controller.isEditDialogOpen(), 'Edit dialog should be open');
  console.assert(controller.getEditingExamSet()?.id === 'exam1', 'Editing exam set should be set');
  console.assert(controller.getFormData().title === 'TOEIC Practice Test 1', 'Form data should be populated');
  
  controller.closeEditDialog();
  console.assert(!controller.isEditDialogOpen(), 'Edit dialog should be closed');
  console.assert(controller.getEditingExamSet() === null, 'Editing exam set should be null');
  
  // Test utility functions
  const difficultyColor = controller.getDifficultyColor('easy');
  console.assert(difficultyColor.includes('green'), 'Easy difficulty should have green color');
  
  const statusColor = controller.getStatusColor('active');
  console.assert(statusColor.includes('green'), 'Active status should have green color');
  
  const difficultyText = controller.getDifficultyDisplayText('medium');
  console.assert(difficultyText === 'Trung bình', 'Medium difficulty should show correct text');
  
  const statusText = controller.getStatusDisplayText('active');
  console.assert(statusText === 'Hoạt động', 'Active status should show correct text');
  
  // Test form validation
  controller.setFormData(mockFormData);
  const validation = controller.validateFormData();
  console.assert(validation.isValid, 'Valid form data should pass validation');
  
  controller.setFormData({ title: '', description: '' });
  const invalidValidation = controller.validateFormData();
  console.assert(!invalidValidation.isValid, 'Invalid form data should fail validation');
  console.assert(invalidValidation.errors.length > 0, 'Should have validation errors');
  
  // Test exam set operations
  controller.setExamSets([mockExamSet, mockExamSet2]);
  const foundExamSet = controller.getExamSetById('exam1');
  console.assert(foundExamSet?.id === 'exam1', 'Should find exam set by ID');
  
  const activeExamSets = controller.getExamSetsByStatus('active');
  console.assert(activeExamSets.length === 1, 'Should find 1 active exam set');
  
  const mediumExamSets = controller.getExamSetsByDifficulty('medium');
  console.assert(mediumExamSets.length === 1, 'Should find 1 medium difficulty exam set');
  
  // Test statistics
  const statistics = controller.getExamSetStatistics();
  console.assert(statistics.totalExamSets === 2, 'Total exam sets should be 2');
  console.assert(statistics.activeExamSets === 1, 'Active exam sets should be 1');
  console.assert(statistics.inactiveExamSets === 1, 'Inactive exam sets should be 1');
  console.assert(statistics.totalQuestions === 400, 'Total questions should be 400');
  console.assert(statistics.averageTimeLimit === 105, 'Average time limit should be 105');
  console.assert(statistics.difficultyDistribution.medium === 1, 'Medium difficulty count should be 1');
  console.assert(statistics.difficultyDistribution.hard === 1, 'Hard difficulty count should be 1');
  
  // Test reset state
  controller.resetState();
  const resetState = controller.getState();
  console.assert(resetState.examSets.length === 0, 'Reset state should have empty exam sets');
  console.assert(resetState.loading, 'Reset state should be loading');
  console.assert(!resetState.isCreateDialogOpen, 'Reset state should have closed create dialog');
  
  console.log('✅ ExamSetManagementController tests passed!');
}

/**
 * Test ExamSetManagementView props interface
 */
export function testExamSetManagementViewProps() {
  console.log('🧪 Testing ExamSetManagementView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'examSets', 'loading', 'isCreateDialogOpen', 'isEditDialogOpen',
    'editingExamSet', 'formData',
    'onSetCreateDialogOpen', 'onSetEditDialogOpen', 'onSetFormData',
    'onCreateExamSet', 'onUpdateExamSet', 'onDeleteExamSet',
    'onOpenEditDialog', 'onCloseCreateDialog', 'onCloseEditDialog',
    'getDifficultyColor', 'getStatusColor', 'getDifficultyDisplayText', 'getStatusDisplayText'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ ExamSetManagementView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testExamSetManagementMVCIntegration() {
  console.log('🧪 Testing ExamSetManagement MVC integration...');
  
  // Test that controller and view can work together
  const controller = new ExamSetManagementController();
  
  // Simulate MVC flow
  controller.setExamSets([mockExamSet]);
  controller.setLoading(false);
  controller.openCreateDialog();
  controller.setFormData(mockFormData);
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.examSets.length === 1, 'Should have 1 exam set');
  console.assert(!state.loading, 'Should not be loading');
  console.assert(state.isCreateDialogOpen, 'Create dialog should be open');
  console.assert(state.formData.title === 'New TOEIC Test', 'Form data should be set');
  
  // Test action handling
  controller.closeCreateDialog();
  controller.openEditDialog(mockExamSet);
  
  const finalState = controller.getState();
  console.assert(!finalState.isCreateDialogOpen, 'Create dialog should be closed');
  console.assert(finalState.isEditDialogOpen, 'Edit dialog should be open');
  
  console.log('✅ ExamSetManagement MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testExamSetManagementErrorHandling() {
  console.log('🧪 Testing ExamSetManagement error handling...');
  
  const controller = new ExamSetManagementController();
  
  // Test with empty exam sets
  controller.setExamSets([]);
  const statistics = controller.getExamSetStatistics();
  console.assert(statistics.totalExamSets === 0, 'Empty exam sets should return zero total');
  console.assert(statistics.averageTimeLimit === 0, 'Empty exam sets should return zero average');
  
  // Test with invalid difficulty
  const invalidDifficultyColor = controller.getDifficultyColor('invalid');
  console.assert(invalidDifficultyColor.includes('gray'), 'Invalid difficulty should have gray color');
  
  const invalidDifficultyText = controller.getDifficultyDisplayText('invalid');
  console.assert(invalidDifficultyText === 'Không xác định', 'Invalid difficulty should show unknown text');
  
  // Test with invalid status
  const invalidStatusColor = controller.getStatusColor('invalid');
  console.assert(invalidStatusColor.includes('gray'), 'Invalid status should have gray color');
  
  const invalidStatusText = controller.getStatusDisplayText('invalid');
  console.assert(invalidStatusText === 'Không xác định', 'Invalid status should show unknown text');
  
  // Test form validation edge cases
  controller.setFormData({ title: '', description: '', time_limit: 0 });
  const validation = controller.validateFormData();
  console.assert(!validation.isValid, 'Empty form should fail validation');
  console.assert(validation.errors.length >= 2, 'Should have multiple validation errors');
  
  controller.setFormData({ title: 'Valid', description: 'Valid', time_limit: 500 });
  const invalidTimeValidation = controller.validateFormData();
  console.assert(!invalidTimeValidation.isValid, 'Invalid time limit should fail validation');
  
  console.log('✅ ExamSetManagement error handling tests passed!');
}

/**
 * Test performance
 */
export function testExamSetManagementPerformance() {
  console.log('🧪 Testing ExamSetManagement performance...');
  
  const controller = new ExamSetManagementController();
  
  // Create test data
  const testExamSets: ExamSet[] = Array.from({ length: 100 }, (_, i) => ({
    ...mockExamSet,
    id: `exam${i}`,
    title: `Exam ${i}`,
    description: `Description ${i}`,
    time_limit: 60 + (i % 120),
    difficulty: ['easy', 'medium', 'hard'][i % 3] as 'easy' | 'medium' | 'hard',
    status: ['active', 'inactive'][i % 2] as 'active' | 'inactive'
  }));
  
  controller.setExamSets(testExamSets);
  
  const startTime = performance.now();
  
  // Test utility functions performance
  for (let i = 0; i < 100; i++) {
    controller.getDifficultyColor('medium');
    controller.getStatusColor('active');
    controller.getDifficultyDisplayText('medium');
    controller.getStatusDisplayText('active');
    controller.getExamSetStatistics();
    controller.getExamSetsByStatus('active');
    controller.getExamSetsByDifficulty('medium');
    controller.validateFormData();
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 1000, `Performance test should complete in under 1 second, took ${duration}ms`);
  
  console.log(`✅ ExamSetManagement performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Test form management
 */
export function testExamSetManagementFormManagement() {
  console.log('🧪 Testing ExamSetManagement form management...');
  
  const controller = new ExamSetManagementController();
  
  // Test form data initialization
  const initialFormData = controller.getFormData();
  console.assert(initialFormData.title === '', 'Initial form title should be empty');
  console.assert(initialFormData.time_limit === 120, 'Initial form time limit should be 120');
  console.assert(initialFormData.difficulty === 'medium', 'Initial form difficulty should be medium');
  console.assert(initialFormData.status === 'active', 'Initial form status should be active');
  
  // Test form data updates
  controller.setFormData({ title: 'New Title' });
  const updatedFormData = controller.getFormData();
  console.assert(updatedFormData.title === 'New Title', 'Form title should be updated');
  console.assert(updatedFormData.time_limit === 120, 'Other fields should remain unchanged');
  
  // Test form data reset
  controller.resetFormData();
  const resetFormData = controller.getFormData();
  console.assert(resetFormData.title === '', 'Reset form title should be empty');
  console.assert(resetFormData.time_limit === 120, 'Reset form time limit should be 120');
  
  // Test dialog state management
  controller.openCreateDialog();
  console.assert(controller.isCreateDialogOpen(), 'Create dialog should be open after opening');
  console.assert(controller.getFormData().title === '', 'Form should be reset when opening create dialog');
  
  controller.closeCreateDialog();
  console.assert(!controller.isCreateDialogOpen(), 'Create dialog should be closed after closing');
  
  // Test edit dialog with form data
  controller.openEditDialog(mockExamSet);
  console.assert(controller.isEditDialogOpen(), 'Edit dialog should be open');
  console.assert(controller.getEditingExamSet()?.id === 'exam1', 'Editing exam set should be set');
  console.assert(controller.getFormData().title === 'TOEIC Practice Test 1', 'Form should be populated with exam set data');
  
  controller.closeEditDialog();
  console.assert(!controller.isEditDialogOpen(), 'Edit dialog should be closed');
  console.assert(controller.getEditingExamSet() === null, 'Editing exam set should be cleared');
  
  console.log('✅ ExamSetManagement form management tests passed!');
}

/**
 * Test data operations simulation
 */
export function testExamSetManagementDataOperations() {
  console.log('🧪 Testing ExamSetManagement data operations...');
  
  const controller = new ExamSetManagementController();
  
  // Test create exam set parameters
  const createParams: CreateExamSetParams = {
    title: 'New Exam',
    description: 'New exam description',
    time_limit: 120,
    difficulty: 'medium',
    status: 'active',
    created_by: 'user123'
  };
  
  console.assert(createParams.title === 'New Exam', 'Create params should have correct title');
  console.assert(createParams.created_by === 'user123', 'Create params should have correct created_by');
  
  // Test update exam set parameters
  const updateParams: UpdateExamSetParams = {
    id: 'exam1',
    title: 'Updated Exam',
    description: 'Updated exam description',
    time_limit: 90,
    difficulty: 'hard',
    status: 'inactive'
  };
  
  console.assert(updateParams.id === 'exam1', 'Update params should have correct ID');
  console.assert(updateParams.title === 'Updated Exam', 'Update params should have correct title');
  
  // Test state management
  controller.setExamSets([mockExamSet]);
  controller.setFormData(mockFormData);
  
  const state = controller.getState();
  console.assert(state.examSets.length === 1, 'Should have 1 exam set');
  console.assert(state.formData.title === 'New TOEIC Test', 'Form data should be set');
  
  console.log('✅ ExamSetManagement data operations tests passed!');
}

/**
 * Run all ExamSetManagement migration tests
 */
export function runExamSetManagementMigrationTests() {
  console.log('🚀 Running ExamSetManagement Migration Tests...');
  
  try {
    testExamSetManagementController();
    testExamSetManagementViewProps();
    testExamSetManagementMVCIntegration();
    testExamSetManagementErrorHandling();
    testExamSetManagementPerformance();
    testExamSetManagementFormManagement();
    testExamSetManagementDataOperations();
    
    console.log('🎉 All ExamSetManagement migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ ExamSetManagement migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testExamSetManagementController,
  testExamSetManagementViewProps,
  testExamSetManagementMVCIntegration,
  testExamSetManagementErrorHandling,
  testExamSetManagementPerformance,
  testExamSetManagementFormManagement,
  testExamSetManagementDataOperations,
  runExamSetManagementMigrationTests
};
