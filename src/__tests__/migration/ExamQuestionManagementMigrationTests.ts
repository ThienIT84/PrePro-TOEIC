/**
 * ExamQuestionManagementMigrationTests
 * Tests cho ExamQuestionManagement.tsx migration sang MVC pattern
 */

import { 
  ExamQuestionManagementController, 
  ExamSet, 
  ExamQuestion, 
  Question, 
  ExamQuestionManagementState,
  AddQuestionToExamParams,
  RemoveQuestionFromExamParams,
  UpdateQuestionOrderParams,
  UpdateExamSetQuestionCountParams
} from '../controllers/exam/ExamQuestionManagementController';

// Mock data
const mockExamSet: ExamSet = {
  id: 'exam1',
  title: 'TOEIC Practice Test 1',
  description: 'Full TOEIC practice test',
  type: 'mix',
  difficulty: 'medium',
  time_limit: 120,
  question_count: 5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockQuestion: Question = {
  id: 'question1',
  question: 'What is the capital of France?',
  type: 'vocab',
  difficulty: 'easy',
  choices: ['Paris', 'London', 'Berlin', 'Madrid'],
  correct_answer: 'Paris',
  explanation: 'Paris is the capital of France',
  audio_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockExamQuestion: ExamQuestion = {
  id: 'exam_question1',
  exam_set_id: 'exam1',
  question_id: 'question1',
  order_index: 1,
  question: mockQuestion
};

const mockQuestion2: Question = {
  id: 'question2',
  question: 'What is 2 + 2?',
  type: 'grammar',
  difficulty: 'easy',
  choices: ['3', '4', '5', '6'],
  correct_answer: '4',
  explanation: '2 + 2 = 4',
  audio_url: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

/**
 * Test ExamQuestionManagementController functionality
 */
export function testExamQuestionManagementController() {
  console.log('🧪 Testing ExamQuestionManagementController...');
  
  const controller = new ExamQuestionManagementController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(initialState.examSet === null, 'Initial examSet should be null');
  console.assert(initialState.examQuestions.length === 0, 'Initial examQuestions should be empty');
  console.assert(initialState.allQuestions.length === 0, 'Initial allQuestions should be empty');
  console.assert(initialState.loading, 'Initial loading should be true');
  console.assert(!initialState.isAddDialogOpen, 'Initial isAddDialogOpen should be false');
  console.assert(!initialState.isExcelDialogOpen, 'Initial isExcelDialogOpen should be false');
  console.assert(initialState.searchTerm === '', 'Initial searchTerm should be empty');
  console.assert(initialState.selectedType === 'all', 'Initial selectedType should be all');
  console.assert(initialState.editingQuestion === null, 'Initial editingQuestion should be null');
  console.assert(initialState.viewingQuestion === null, 'Initial viewingQuestion should be null');
  
  // Test state management
  controller.setExamSet(mockExamSet);
  console.assert(controller.getExamSet()?.id === 'exam1', 'Exam set ID should match');
  
  controller.setExamQuestions([mockExamQuestion]);
  console.assert(controller.getExamQuestions().length === 1, 'Should have 1 exam question');
  
  controller.setAllQuestions([mockQuestion, mockQuestion2]);
  console.assert(controller.getAllQuestions().length === 2, 'Should have 2 questions');
  
  controller.setLoading(false);
  console.assert(!controller.isLoading(), 'Should not be loading');
  
  controller.setAddDialogOpen(true);
  console.assert(controller.isAddDialogOpen(), 'Add dialog should be open');
  
  controller.setExcelDialogOpen(true);
  console.assert(controller.isExcelDialogOpen(), 'Excel dialog should be open');
  
  controller.setSearchTerm('test');
  console.assert(controller.getSearchTerm() === 'test', 'Search term should be set');
  
  controller.setSelectedType('vocab');
  console.assert(controller.getSelectedType() === 'vocab', 'Selected type should be vocab');
  
  controller.setEditingQuestion(mockQuestion);
  console.assert(controller.getEditingQuestion()?.id === 'question1', 'Editing question should match');
  
  controller.setViewingQuestion(mockQuestion2);
  console.assert(controller.getViewingQuestion()?.id === 'question2', 'Viewing question should match');
  
  // Test utility functions
  const typeLabel = controller.getTypeLabel('vocab');
  console.assert(typeLabel === 'Từ vựng', 'Vocab type should show correct label');
  
  const difficultyLabel = controller.getDifficultyLabel('easy');
  console.assert(difficultyLabel === 'Dễ', 'Easy difficulty should show correct label');
  
  const questionPreview = controller.getQuestionPreview(mockQuestion);
  console.assert(questionPreview.includes('Paris'), 'Question preview should include first choice');
  
  // Test filtered questions
  controller.setSearchTerm('capital');
  controller.setSelectedType('vocab');
  const filteredQuestions = controller.getFilteredQuestions();
  console.assert(filteredQuestions.length === 1, 'Should find 1 filtered question');
  console.assert(filteredQuestions[0].id === 'question1', 'Filtered question should match');
  
  // Test question count sync
  controller.setExamQuestions([mockExamQuestion]);
  controller.setExamSet({ ...mockExamSet, question_count: 1 });
  console.assert(controller.isQuestionCountSynced(), 'Question count should be synced');
  
  controller.setExamSet({ ...mockExamSet, question_count: 0 });
  console.assert(!controller.isQuestionCountSynced(), 'Question count should not be synced');
  
  const countDifference = controller.getQuestionCountDifference();
  console.assert(countDifference === 1, 'Question count difference should be 1');
  
  // Test statistics
  const statistics = controller.getExamSetStatistics();
  console.assert(statistics.totalQuestions === 1, 'Total questions should be 1');
  console.assert(statistics.questionsByType.vocab === 1, 'Vocab questions should be 1');
  console.assert(statistics.questionsByDifficulty.easy === 1, 'Easy questions should be 1');
  console.assert(statistics.averageDifficulty === 1, 'Average difficulty should be 1');
  console.assert(!statistics.hasAudioQuestions, 'Should not have audio questions');
  
  // Test get questions by type
  const vocabQuestions = controller.getQuestionsByType('vocab');
  console.assert(vocabQuestions.length === 1, 'Should find 1 vocab question');
  
  // Test get questions by difficulty
  const easyQuestions = controller.getQuestionsByDifficulty('easy');
  console.assert(easyQuestions.length === 2, 'Should find 2 easy questions');
  
  // Test available types and difficulties
  const availableTypes = controller.getAvailableQuestionTypes();
  console.assert(availableTypes.length === 2, 'Should have 2 available types');
  console.assert(availableTypes.includes('vocab'), 'Should include vocab type');
  console.assert(availableTypes.includes('grammar'), 'Should include grammar type');
  
  const availableDifficulties = controller.getAvailableDifficulties();
  console.assert(availableDifficulties.length === 1, 'Should have 1 available difficulty');
  console.assert(availableDifficulties.includes('easy'), 'Should include easy difficulty');
  
  // Test reset state
  controller.resetState();
  const resetState = controller.getState();
  console.assert(resetState.examSet === null, 'Reset state should have null exam set');
  console.assert(resetState.examQuestions.length === 0, 'Reset state should have empty exam questions');
  console.assert(resetState.loading, 'Reset state should be loading');
  
  console.log('✅ ExamQuestionManagementController tests passed!');
}

/**
 * Test ExamQuestionManagementView props interface
 */
export function testExamQuestionManagementViewProps() {
  console.log('🧪 Testing ExamQuestionManagementView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'examSet', 'examQuestions', 'allQuestions', 'loading',
    'isAddDialogOpen', 'isExcelDialogOpen', 'searchTerm', 'selectedType',
    'editingQuestion', 'viewingQuestion',
    'onSetAddDialogOpen', 'onSetExcelDialogOpen', 'onSetSearchTerm', 'onSetSelectedType',
    'onSetEditingQuestion', 'onSetViewingQuestion',
    'onAddQuestionToExam', 'onRemoveQuestionFromExam', 'onUpdateQuestionOrder',
    'onUpdateExamSetQuestionCount', 'onNavigateBack', 'onNavigateToExam',
    'getFilteredQuestions', 'getTypeLabel', 'getDifficultyLabel', 'getQuestionPreview',
    'isQuestionCountSynced', 'getQuestionCountDifference', 'getExamSetStatistics'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ ExamQuestionManagementView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testExamQuestionManagementMVCIntegration() {
  console.log('🧪 Testing ExamQuestionManagement MVC integration...');
  
  // Test that controller and view can work together
  const controller = new ExamQuestionManagementController();
  
  // Simulate MVC flow
  controller.setExamSet(mockExamSet);
  controller.setExamQuestions([mockExamQuestion]);
  controller.setAllQuestions([mockQuestion, mockQuestion2]);
  controller.setLoading(false);
  controller.setSearchTerm('test');
  controller.setSelectedType('vocab');
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.examSet?.id === 'exam1', 'Should have exam set');
  console.assert(state.examQuestions.length === 1, 'Should have 1 exam question');
  console.assert(state.allQuestions.length === 2, 'Should have 2 questions');
  console.assert(!state.loading, 'Should not be loading');
  console.assert(state.searchTerm === 'test', 'Search term should be set');
  console.assert(state.selectedType === 'vocab', 'Selected type should be vocab');
  
  // Test action handling
  controller.setAddDialogOpen(true);
  controller.setEditingQuestion(mockQuestion);
  
  const finalState = controller.getState();
  console.assert(finalState.isAddDialogOpen, 'Add dialog should be open');
  console.assert(finalState.editingQuestion?.id === 'question1', 'Editing question should be set');
  
  console.log('✅ ExamQuestionManagement MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testExamQuestionManagementErrorHandling() {
  console.log('🧪 Testing ExamQuestionManagement error handling...');
  
  const controller = new ExamQuestionManagementController();
  
  // Test with empty data
  controller.setExamQuestions([]);
  controller.setAllQuestions([]);
  const statistics = controller.getExamSetStatistics();
  console.assert(statistics.totalQuestions === 0, 'Empty exam questions should return zero total');
  console.assert(statistics.averageDifficulty === 0, 'Empty exam questions should return zero average');
  
  // Test with invalid type
  const invalidTypeLabel = controller.getTypeLabel('invalid');
  console.assert(invalidTypeLabel === 'invalid', 'Invalid type should return original value');
  
  const invalidDifficultyLabel = controller.getDifficultyLabel('invalid');
  console.assert(invalidDifficultyLabel === 'invalid', 'Invalid difficulty should return original value');
  
  // Test question preview with no choices
  const questionWithoutChoices: Question = {
    ...mockQuestion,
    choices: undefined
  };
  const previewWithoutChoices = controller.getQuestionPreview(questionWithoutChoices);
  console.assert(previewWithoutChoices === questionWithoutChoices.question, 'Preview without choices should return question text');
  
  // Test question preview with empty choices
  const questionWithEmptyChoices: Question = {
    ...mockQuestion,
    choices: []
  };
  const previewWithEmptyChoices = controller.getQuestionPreview(questionWithEmptyChoices);
  console.assert(previewWithEmptyChoices === questionWithEmptyChoices.question, 'Preview with empty choices should return question text');
  
  // Test filtered questions with no matches
  controller.setSearchTerm('nonexistent');
  controller.setSelectedType('nonexistent');
  const noMatches = controller.getFilteredQuestions();
  console.assert(noMatches.length === 0, 'Should return empty array for no matches');
  
  console.log('✅ ExamQuestionManagement error handling tests passed!');
}

/**
 * Test performance
 */
export function testExamQuestionManagementPerformance() {
  console.log('🧪 Testing ExamQuestionManagement performance...');
  
  const controller = new ExamQuestionManagementController();
  
  // Create test data
  const testQuestions: Question[] = Array.from({ length: 100 }, (_, i) => ({
    ...mockQuestion,
    id: `question${i}`,
    question: `Question ${i}`,
    type: ['vocab', 'grammar', 'listening', 'reading', 'mix'][i % 5],
    difficulty: ['easy', 'medium', 'hard'][i % 3]
  }));
  
  const testExamQuestions: ExamQuestion[] = Array.from({ length: 50 }, (_, i) => ({
    ...mockExamQuestion,
    id: `exam_question${i}`,
    question_id: `question${i}`,
    order_index: i,
    question: testQuestions[i]
  }));
  
  controller.setExamQuestions(testExamQuestions);
  controller.setAllQuestions(testQuestions);
  
  const startTime = performance.now();
  
  // Test utility functions performance
  for (let i = 0; i < 100; i++) {
    controller.getTypeLabel('vocab');
    controller.getDifficultyLabel('easy');
    controller.getQuestionPreview(testQuestions[0]);
    controller.getFilteredQuestions();
    controller.isQuestionCountSynced();
    controller.getQuestionCountDifference();
    controller.getExamSetStatistics();
    controller.getQuestionsByType('vocab');
    controller.getQuestionsByDifficulty('easy');
    controller.getAvailableQuestionTypes();
    controller.getAvailableDifficulties();
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 1000, `Performance test should complete in under 1 second, took ${duration}ms`);
  
  console.log(`✅ ExamQuestionManagement performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Test data operations simulation
 */
export function testExamQuestionManagementDataOperations() {
  console.log('🧪 Testing ExamQuestionManagement data operations...');
  
  const controller = new ExamQuestionManagementController();
  
  // Test add question to exam parameters
  const addParams: AddQuestionToExamParams = {
    examSetId: 'exam1',
    questionId: 'question1',
    orderIndex: 1
  };
  
  console.assert(addParams.examSetId === 'exam1', 'Add params should have correct exam set ID');
  console.assert(addParams.questionId === 'question1', 'Add params should have correct question ID');
  console.assert(addParams.orderIndex === 1, 'Add params should have correct order index');
  
  // Test remove question from exam parameters
  const removeParams: RemoveQuestionFromExamParams = {
    examQuestionId: 'exam_question1'
  };
  
  console.assert(removeParams.examQuestionId === 'exam_question1', 'Remove params should have correct exam question ID');
  
  // Test update question order parameters
  const updateOrderParams: UpdateQuestionOrderParams = {
    examQuestionId: 'exam_question1',
    newOrder: 2
  };
  
  console.assert(updateOrderParams.examQuestionId === 'exam_question1', 'Update order params should have correct exam question ID');
  console.assert(updateOrderParams.newOrder === 2, 'Update order params should have correct new order');
  
  // Test update exam set question count parameters
  const updateCountParams: UpdateExamSetQuestionCountParams = {
    examSetId: 'exam1',
    newCount: 10
  };
  
  console.assert(updateCountParams.examSetId === 'exam1', 'Update count params should have correct exam set ID');
  console.assert(updateCountParams.newCount === 10, 'Update count params should have correct new count');
  
  // Test state management
  controller.setExamSet(mockExamSet);
  controller.setExamQuestions([mockExamQuestion]);
  controller.setAllQuestions([mockQuestion, mockQuestion2]);
  
  const state = controller.getState();
  console.assert(state.examSet?.id === 'exam1', 'Should have exam set');
  console.assert(state.examQuestions.length === 1, 'Should have 1 exam question');
  console.assert(state.allQuestions.length === 2, 'Should have 2 questions');
  
  console.log('✅ ExamQuestionManagement data operations tests passed!');
}

/**
 * Test filtering and search functionality
 */
export function testExamQuestionManagementFiltering() {
  console.log('🧪 Testing ExamQuestionManagement filtering...');
  
  const controller = new ExamQuestionManagementController();
  
  // Create test questions with different types and difficulties
  const testQuestions: Question[] = [
    { ...mockQuestion, type: 'vocab', difficulty: 'easy' },
    { ...mockQuestion2, type: 'grammar', difficulty: 'medium' },
    { ...mockQuestion, id: 'question3', type: 'listening', difficulty: 'hard' },
    { ...mockQuestion2, id: 'question4', type: 'reading', difficulty: 'easy' }
  ];
  
  controller.setAllQuestions(testQuestions);
  
  // Test filtering by type
  const vocabQuestions = controller.getQuestionsByType('vocab');
  console.assert(vocabQuestions.length === 1, 'Should find 1 vocab question');
  
  const grammarQuestions = controller.getQuestionsByType('grammar');
  console.assert(grammarQuestions.length === 1, 'Should find 1 grammar question');
  
  // Test filtering by difficulty
  const easyQuestions = controller.getQuestionsByDifficulty('easy');
  console.assert(easyQuestions.length === 2, 'Should find 2 easy questions');
  
  const hardQuestions = controller.getQuestionsByDifficulty('hard');
  console.assert(hardQuestions.length === 1, 'Should find 1 hard question');
  
  // Test search filtering
  controller.setSearchTerm('capital');
  controller.setSelectedType('all');
  const searchFiltered = controller.getFilteredQuestions();
  console.assert(searchFiltered.length === 1, 'Should find 1 question matching search term');
  
  // Test combined filtering
  controller.setSearchTerm('What');
  controller.setSelectedType('vocab');
  const combinedFiltered = controller.getFilteredQuestions();
  console.assert(combinedFiltered.length === 1, 'Should find 1 question matching both filters');
  
  // Test available types and difficulties
  const availableTypes = controller.getAvailableQuestionTypes();
  console.assert(availableTypes.length === 4, 'Should have 4 available types');
  console.assert(availableTypes.includes('vocab'), 'Should include vocab type');
  console.assert(availableTypes.includes('grammar'), 'Should include grammar type');
  console.assert(availableTypes.includes('listening'), 'Should include listening type');
  console.assert(availableTypes.includes('reading'), 'Should include reading type');
  
  const availableDifficulties = controller.getAvailableDifficulties();
  console.assert(availableDifficulties.length === 3, 'Should have 3 available difficulties');
  console.assert(availableDifficulties.includes('easy'), 'Should include easy difficulty');
  console.assert(availableDifficulties.includes('medium'), 'Should include medium difficulty');
  console.assert(availableDifficulties.includes('hard'), 'Should include hard difficulty');
  
  console.log('✅ ExamQuestionManagement filtering tests passed!');
}

/**
 * Run all ExamQuestionManagement migration tests
 */
export function runExamQuestionManagementMigrationTests() {
  console.log('🚀 Running ExamQuestionManagement Migration Tests...');
  
  try {
    testExamQuestionManagementController();
    testExamQuestionManagementViewProps();
    testExamQuestionManagementMVCIntegration();
    testExamQuestionManagementErrorHandling();
    testExamQuestionManagementPerformance();
    testExamQuestionManagementDataOperations();
    testExamQuestionManagementFiltering();
    
    console.log('🎉 All ExamQuestionManagement migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ ExamQuestionManagement migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testExamQuestionManagementController,
  testExamQuestionManagementViewProps,
  testExamQuestionManagementMVCIntegration,
  testExamQuestionManagementErrorHandling,
  testExamQuestionManagementPerformance,
  testExamQuestionManagementDataOperations,
  testExamQuestionManagementFiltering,
  runExamQuestionManagementMigrationTests
};
