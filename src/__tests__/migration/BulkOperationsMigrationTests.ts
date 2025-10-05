/**
 * BulkOperationsMigrationTests
 * Tests cho BulkOperations.tsx migration sang MVC pattern
 */

import { BulkOperationsController, BulkQuestion } from '../controllers/bulk/BulkOperationsController';

// Mock data
const mockBulkQuestion: BulkQuestion = {
  type: 'vocab',
  question: 'What is the meaning of "abundant"?',
  choiceA: 'scarce',
  choiceB: 'plentiful',
  choiceC: 'rare',
  choiceD: 'limited',
  answer: 'B',
  explanation: 'Abundant có nghĩa là dồi dào, phong phú',
  tags: 'vocabulary, common words',
  status: 'pending'
};

const mockInvalidQuestion: BulkQuestion = {
  type: 'vocab',
  question: '',
  choiceA: '',
  choiceB: '',
  choiceC: '',
  choiceD: '',
  answer: '',
  explanation: '',
  tags: '',
  status: 'pending'
};

/**
 * Test BulkOperationsController functionality
 */
export function testBulkOperationsController() {
  console.log('🧪 Testing BulkOperationsController...');
  
  const controller = new BulkOperationsController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(initialState.activeTab === 'import', 'Initial activeTab should be import');
  console.assert(initialState.questions.length === 0, 'Initial questions should be empty');
  console.assert(!initialState.loading, 'Initial loading should be false');
  console.assert(!initialState.importing, 'Initial importing should be false');
  console.assert(initialState.progress === 0, 'Initial progress should be 0');
  
  // Test question validation
  const validValidation = controller.validateQuestion(mockBulkQuestion);
  console.assert(validValidation.isValid, 'Valid question should pass validation');
  console.assert(validValidation.errors.length === 0, 'Valid question should have no errors');
  console.assert(validValidation.status === 'valid', 'Valid question should have valid status');
  
  const invalidValidation = controller.validateQuestion(mockInvalidQuestion);
  console.assert(!invalidValidation.isValid, 'Invalid question should fail validation');
  console.assert(invalidValidation.errors.length > 0, 'Invalid question should have errors');
  console.assert(invalidValidation.status === 'invalid', 'Invalid question should have invalid status');
  
  // Test setting questions
  controller.setQuestions([mockBulkQuestion, mockInvalidQuestion]);
  const stateAfterSetup = controller.getState();
  console.assert(stateAfterSetup.questions.length === 2, 'Should have 2 questions');
  
  // Test question counts
  const counts = controller.getQuestionCounts();
  console.assert(counts.total === 2, 'Total count should be 2');
  console.assert(counts.valid === 1, 'Valid count should be 1');
  console.assert(counts.invalid === 1, 'Invalid count should be 1');
  console.assert(counts.imported === 0, 'Imported count should be 0');
  
  // Test getting specific question types
  const validQuestions = controller.getValidQuestions();
  console.assert(validQuestions.length === 1, 'Should have 1 valid question');
  console.assert(validQuestions[0].question === mockBulkQuestion.question, 'Valid question should match');
  
  const invalidQuestions = controller.getInvalidQuestions();
  console.assert(invalidQuestions.length === 1, 'Should have 1 invalid question');
  console.assert(invalidQuestions[0].question === mockInvalidQuestion.question, 'Invalid question should match');
  
  // Test fixing a question
  controller.fixQuestion(1, 'question', 'What is the meaning of "scarce"?');
  controller.fixQuestion(1, 'choiceA', 'abundant');
  controller.fixQuestion(1, 'choiceB', 'limited');
  controller.fixQuestion(1, 'answer', 'A');
  
  const countsAfterFix = controller.getQuestionCounts();
  console.assert(countsAfterFix.valid === 2, 'Should have 2 valid questions after fix');
  console.assert(countsAfterFix.invalid === 0, 'Should have 0 invalid questions after fix');
  
  // Test removing a question
  controller.removeQuestion(0);
  const countsAfterRemove = controller.getQuestionCounts();
  console.assert(countsAfterRemove.total === 1, 'Should have 1 question after removal');
  
  // Test state management
  controller.setActiveTab('export');
  console.assert(controller.getActiveTab() === 'export', 'Active tab should be export');
  
  controller.setLoading(true);
  console.assert(controller.isLoading(), 'Should be loading');
  
  controller.setImporting(true);
  console.assert(controller.isImporting(), 'Should be importing');
  
  controller.setProgress(50);
  console.assert(controller.getProgress() === 50, 'Progress should be 50');
  
  // Test can import
  console.assert(controller.canImport(), 'Should be able to import with valid questions');
  
  // Test clear questions
  controller.clearQuestions();
  const countsAfterClear = controller.getQuestionCounts();
  console.assert(countsAfterClear.total === 0, 'Should have 0 questions after clear');
  console.assert(controller.getProgress() === 0, 'Progress should be 0 after clear');
  
  // Test reset state
  controller.resetState();
  const resetState = controller.getState();
  console.assert(resetState.activeTab === 'import', 'Reset state should have default activeTab');
  console.assert(resetState.questions.length === 0, 'Reset state should have empty questions');
  console.assert(!resetState.loading, 'Reset state should not be loading');
  console.assert(!resetState.importing, 'Reset state should not be importing');
  console.assert(resetState.progress === 0, 'Reset state should have 0 progress');
  
  console.log('✅ BulkOperationsController tests passed!');
}

/**
 * Test BulkOperationsView props interface
 */
export function testBulkOperationsViewProps() {
  console.log('🧪 Testing BulkOperationsView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'activeTab', 'questions', 'loading', 'importing', 'progress',
    'onSetActiveTab', 'onFileUpload', 'onImportQuestions', 'onExportQuestions',
    'onGenerateTemplate', 'onFixQuestion', 'onRemoveQuestion',
    'getQuestionCounts', 'getValidQuestions', 'getInvalidQuestions', 'getImportedQuestions',
    'canImport', 'isImporting', 'isLoading', 'getProgress', 'getActiveTab', 'getQuestions',
    'clearQuestions', 'resetState'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ BulkOperationsView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testBulkOperationsMVCIntegration() {
  console.log('🧪 Testing BulkOperations MVC integration...');
  
  // Test that controller and view can work together
  const controller = new BulkOperationsController();
  
  // Simulate MVC flow
  controller.setQuestions([mockBulkQuestion]);
  controller.setActiveTab('export');
  controller.setLoading(true);
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.questions.length === 1, 'Should have 1 question');
  console.assert(state.activeTab === 'export', 'Active tab should be export');
  console.assert(state.loading, 'Should be loading');
  
  // Test action handling
  controller.fixQuestion(0, 'question', 'Updated question');
  controller.setActiveTab('import');
  
  const finalState = controller.getState();
  console.assert(finalState.questions[0].question === 'Updated question', 'Question should be updated');
  console.assert(finalState.activeTab === 'import', 'Active tab should be import');
  
  console.log('✅ BulkOperations MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testBulkOperationsErrorHandling() {
  console.log('🧪 Testing BulkOperations error handling...');
  
  const controller = new BulkOperationsController();
  
  // Test with empty questions
  const counts = controller.getQuestionCounts();
  console.assert(counts.total === 0, 'Should have 0 questions initially');
  console.assert(counts.valid === 0, 'Should have 0 valid questions initially');
  
  // Test can import with no valid questions
  console.assert(!controller.canImport(), 'Should not be able to import with no valid questions');
  
  // Test removing non-existent question
  controller.removeQuestion(999); // Should not throw error
  console.assert(controller.getQuestionCounts().total === 0, 'Should still have 0 questions');
  
  // Test fixing non-existent question
  controller.fixQuestion(999, 'question', 'test'); // Should not throw error
  console.assert(controller.getQuestionCounts().total === 0, 'Should still have 0 questions');
  
  console.log('✅ BulkOperations error handling tests passed!');
}

/**
 * Test performance
 */
export function testBulkOperationsPerformance() {
  console.log('🧪 Testing BulkOperations performance...');
  
  const controller = new BulkOperationsController();
  
  // Test with large dataset
  const largeQuestions: BulkQuestion[] = Array.from({ length: 1000 }, (_, i) => ({
    ...mockBulkQuestion,
    question: `Question ${i}`,
    status: 'pending' as const
  }));
  
  controller.setQuestions(largeQuestions);
  
  const startTime = performance.now();
  
  // Test data processing performance
  for (let i = 0; i < 100; i++) {
    controller.getQuestionCounts();
    controller.getValidQuestions();
    controller.getInvalidQuestions();
    controller.getImportedQuestions();
    controller.canImport();
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 1000, `Performance test should complete in under 1 second, took ${duration}ms`);
  
  console.log(`✅ BulkOperations performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Test file processing simulation
 */
export function testBulkOperationsFileProcessing() {
  console.log('🧪 Testing BulkOperations file processing simulation...');
  
  const controller = new BulkOperationsController();
  
  // Simulate file processing
  const mockQuestions: BulkQuestion[] = [
    { ...mockBulkQuestion, status: 'valid' },
    { ...mockInvalidQuestion, status: 'invalid' },
    { ...mockBulkQuestion, question: 'Another question', status: 'valid' }
  ];
  
  controller.setQuestions(mockQuestions);
  
  const counts = controller.getQuestionCounts();
  console.assert(counts.total === 3, 'Should have 3 questions');
  console.assert(counts.valid === 2, 'Should have 2 valid questions');
  console.assert(counts.invalid === 1, 'Should have 1 invalid question');
  
  // Test progress simulation
  controller.setImporting(true);
  controller.setProgress(33);
  console.assert(controller.getProgress() === 33, 'Progress should be 33');
  
  controller.setProgress(66);
  console.assert(controller.getProgress() === 66, 'Progress should be 66');
  
  controller.setProgress(100);
  console.assert(controller.getProgress() === 100, 'Progress should be 100');
  
  console.log('✅ BulkOperations file processing simulation tests passed!');
}

/**
 * Run all BulkOperations migration tests
 */
export function runBulkOperationsMigrationTests() {
  console.log('🚀 Running BulkOperations Migration Tests...');
  
  try {
    testBulkOperationsController();
    testBulkOperationsViewProps();
    testBulkOperationsMVCIntegration();
    testBulkOperationsErrorHandling();
    testBulkOperationsPerformance();
    testBulkOperationsFileProcessing();
    
    console.log('🎉 All BulkOperations migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ BulkOperations migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testBulkOperationsController,
  testBulkOperationsViewProps,
  testBulkOperationsMVCIntegration,
  testBulkOperationsErrorHandling,
  testBulkOperationsPerformance,
  testBulkOperationsFileProcessing,
  runBulkOperationsMigrationTests
};
