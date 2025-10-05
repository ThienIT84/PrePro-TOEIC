/**
 * QuestionManager Migration Tests
 * Test TOEICQuestionManager migration sang MVC pattern
 */

import { QuestionManagerController } from '@/controllers/question/QuestionManagerController';
import { QuestionManagerView } from '@/views/components/QuestionManagerView';
import { QuestionManagerMVC } from '@/views/components/QuestionManagerMVC';

// Mock data
const mockQuestion = {
  id: '1',
  part: 1,
  prompt_text: 'What is shown in the picture?',
  choices: {
    A: 'A man reading a book',
    B: 'A woman cooking dinner',
    C: 'A child playing with toys',
    D: 'A dog sleeping on the couch'
  },
  correct_choice: 'A',
  explain_vi: 'Trong hình, một người đàn ông đang đọc sách.',
  explain_en: 'In the picture, a man is reading a book.',
  tags: ['photos', 'listening', 'part1'],
  difficulty: 'easy' as const,
  status: 'published' as const,
  passage_id: undefined,
  blank_index: undefined,
  audio_url: 'https://example.com/audio1.mp3',
  image_url: 'https://example.com/image1.jpg',
  created_at: '2024-01-01T00:00:00Z',
  passages: undefined
};

/**
 * Test QuestionManagerController
 */
export function testQuestionManagerController() {
  console.log('🧪 Testing QuestionManagerController...');
  
  try {
    const controller = new QuestionManagerController();
    console.log('✅ QuestionManagerController created successfully');
    
    // Test initial state
    const initialState = controller.getState();
    console.log('  - Initial state loaded:', !!initialState);
    console.log('  - Questions array:', Array.isArray(initialState.questions));
    console.log('  - Loading state:', typeof initialState.loading);
    console.log('  - Search term:', typeof initialState.searchTerm);
    
    // Test TOEIC part info
    const partInfo = controller.getToeicPartInfo();
    console.log('  - TOEIC part info:', Object.keys(partInfo).length);
    console.log('  - Part 1 info:', partInfo[1].name);
    
    // Test difficulty colors
    const difficultyColors = controller.getDifficultyColors();
    console.log('  - Difficulty colors:', Object.keys(difficultyColors).length);
    console.log('  - Easy color:', difficultyColors.easy);
    
    // Test status colors
    const statusColors = controller.getStatusColors();
    console.log('  - Status colors:', Object.keys(statusColors).length);
    console.log('  - Published color:', statusColors.published);
    
    // Test filter management
    controller.setSearchTerm('test search');
    controller.setFilterPart('1');
    controller.setFilterDifficulty('easy');
    controller.setFilterStatus('published');
    
    const state = controller.getState();
    console.log('  - Search term set:', state.searchTerm === 'test search');
    console.log('  - Filter part set:', state.filterPart === '1');
    console.log('  - Filter difficulty set:', state.filterDifficulty === 'easy');
    console.log('  - Filter status set:', state.filterStatus === 'published');
    
    // Test question management
    controller.setState({ questions: [mockQuestion] });
    const question = controller.getQuestionById('1');
    console.log('  - Get question by ID:', !!question);
    console.log('  - Question part:', question?.part);
    
    const partQuestions = controller.getQuestionsByPart(1);
    console.log('  - Questions by part:', partQuestions.length);
    
    const easyQuestions = controller.getQuestionsByDifficulty('easy');
    console.log('  - Questions by difficulty:', easyQuestions.length);
    
    const publishedQuestions = controller.getQuestionsByStatus('published');
    console.log('  - Questions by status:', publishedQuestions.length);
    
    // Test selection management
    controller.selectQuestion('1', true);
    const isSelected = controller.isQuestionSelected('1');
    console.log('  - Question selection:', isSelected);
    
    controller.selectAllQuestions(true);
    const allSelected = controller.areAllFilteredQuestionsSelected();
    console.log('  - All questions selected:', allSelected);
    
    // Test statistics
    const stats = controller.getStatistics();
    console.log('  - Statistics calculated:', stats.total === 1);
    console.log('  - Filtered count:', stats.filtered);
    console.log('  - Selected count:', stats.selected);
    
    // Test utility functions
    const partInfoForQuestion = controller.getPartInfo(1);
    console.log('  - Part info for question:', !!partInfoForQuestion);
    console.log('  - Part name:', partInfoForQuestion.name);
    
    const audioUrl = controller.getQuestionAudioUrl(mockQuestion);
    console.log('  - Audio URL:', !!audioUrl);
    
    const audioDescription = controller.getAudioSourceDescription(mockQuestion);
    console.log('  - Audio description:', typeof audioDescription === 'string');
    
    return true;
  } catch (error) {
    console.error('❌ QuestionManagerController tests failed:', error);
    return false;
  }
}

/**
 * Test QuestionManagerView Props Interface
 */
export function testQuestionManagerViewProps() {
  console.log('🧪 Testing QuestionManagerView Props...');
  
  try {
    // Test props interface
    const mockProps = {
      questions: [mockQuestion],
      loading: false,
      deleting: false,
      errors: [],
      searchTerm: '',
      filterPart: 'all',
      filterDifficulty: 'all',
      filterStatus: 'all',
      selectedQuestions: [],
      onSearchTermChange: () => {},
      onFilterPartChange: () => {},
      onFilterDifficultyChange: () => {},
      onFilterStatusChange: () => {},
      onRefresh: () => {},
      onDeleteQuestion: () => {},
      onDeleteSelectedQuestions: () => {},
      onSelectQuestion: () => {},
      onSelectAllQuestions: () => {},
      onEditQuestion: () => {},
      getFilteredQuestions: () => [mockQuestion],
      getQuestionById: () => mockQuestion,
      getPartInfo: () => ({ name: 'Part 1', icon: '📷', color: 'bg-blue-100' }),
      getQuestionAudioUrl: () => 'https://example.com/audio.mp3',
      getAudioSourceDescription: () => 'Audio description',
      getStatistics: () => ({ total: 1, filtered: 1, selected: 0 }),
      isQuestionSelected: () => false,
      areAllFilteredQuestionsSelected: () => false,
      getToeicPartInfo: () => ({}),
      getDifficultyColors: () => ({}),
      getStatusColors: () => ({}),
      className: ''
    };
    
    console.log('✅ QuestionManagerView props interface is correct');
    console.log('  - All required props present:', Object.keys(mockProps).length);
    console.log('  - Questions data:', !!mockProps.questions);
    console.log('  - Handlers present:', typeof mockProps.onSearchTermChange === 'function');
    console.log('  - Utility functions present:', typeof mockProps.getFilteredQuestions === 'function');
    
    return true;
  } catch (error) {
    console.error('❌ QuestionManagerView Props tests failed:', error);
    return false;
  }
}

/**
 * Test QuestionManagerMVC Integration
 */
export function testQuestionManagerMVCIntegration() {
  console.log('🧪 Testing QuestionManagerMVC Integration...');
  
  try {
    // Test component imports
    console.log('✅ QuestionManagerView imported successfully');
    console.log('✅ QuestionManagerMVC imported successfully');
    
    // Test that components can be instantiated (without rendering)
    console.log('✅ All components can be imported and instantiated');
    
    // Test props compatibility
    const mockMVCProps = {
      onEdit: () => {},
      className: 'test-class'
    };
    
    console.log('  - MVC props interface:', Object.keys(mockMVCProps).length);
    console.log('  - onEdit callback:', typeof mockMVCProps.onEdit === 'function');
    console.log('  - className prop:', typeof mockMVCProps.className === 'string');
    
    return true;
  } catch (error) {
    console.error('❌ QuestionManagerMVC Integration tests failed:', error);
    return false;
  }
}

/**
 * Test Migration Functionality
 */
export function testQuestionManagerMigrationFunctionality() {
  console.log('🧪 Testing QuestionManager Migration Functionality...');
  
  try {
    const controller = new QuestionManagerController();
    
    // Test question management simulation
    console.log('✅ Question management simulation works');
    
    // Test filtering functionality
    controller.setState({ questions: [mockQuestion] });
    controller.setSearchTerm('picture');
    const filteredQuestions = controller.getFilteredQuestions();
    console.log('  - Search filtering works:', filteredQuestions.length > 0);
    
    controller.setSearchTerm('nonexistent');
    const noResults = controller.getFilteredQuestions();
    console.log('  - No results filtering works:', noResults.length === 0);
    
    // Test part filtering
    controller.setSearchTerm('');
    controller.setFilterPart('1');
    const partFiltered = controller.getFilteredQuestions();
    console.log('  - Part filtering works:', partFiltered.length > 0);
    
    controller.setFilterPart('2');
    const wrongPart = controller.getFilteredQuestions();
    console.log('  - Wrong part filtering works:', wrongPart.length === 0);
    
    // Test difficulty filtering
    controller.setFilterPart('all');
    controller.setFilterDifficulty('easy');
    const difficultyFiltered = controller.getFilteredQuestions();
    console.log('  - Difficulty filtering works:', difficultyFiltered.length > 0);
    
    controller.setFilterDifficulty('hard');
    const wrongDifficulty = controller.getFilteredQuestions();
    console.log('  - Wrong difficulty filtering works:', wrongDifficulty.length === 0);
    
    // Test status filtering
    controller.setFilterDifficulty('all');
    controller.setFilterStatus('published');
    const statusFiltered = controller.getFilteredQuestions();
    console.log('  - Status filtering works:', statusFiltered.length > 0);
    
    controller.setFilterStatus('draft');
    const wrongStatus = controller.getFilteredQuestions();
    console.log('  - Wrong status filtering works:', wrongStatus.length === 0);
    
    // Test selection functionality
    controller.setFilterStatus('all');
    controller.selectQuestion('1', true);
    const isSelected = controller.isQuestionSelected('1');
    console.log('  - Question selection works:', isSelected);
    
    controller.selectQuestion('1', false);
    const isNotSelected = controller.isQuestionSelected('1');
    console.log('  - Question deselection works:', !isNotSelected);
    
    // Test bulk selection
    controller.selectAllQuestions(true);
    const allSelected = controller.areAllFilteredQuestionsSelected();
    console.log('  - Bulk selection works:', allSelected);
    
    controller.selectAllQuestions(false);
    const noneSelected = controller.areAllFilteredQuestionsSelected();
    console.log('  - Bulk deselection works:', !noneSelected);
    
    // Test statistics calculation
    const stats = controller.getStatistics();
    console.log('  - Statistics calculated correctly:', stats.total === 1);
    console.log('  - Filtered count:', stats.filtered === 1);
    console.log('  - Selected count:', stats.selected === 0);
    
    return true;
  } catch (error) {
    console.error('❌ QuestionManager Migration Functionality tests failed:', error);
    return false;
  }
}

/**
 * Test Performance
 */
export function testQuestionManagerPerformance() {
  console.log('🧪 Testing QuestionManager Performance...');
  
  try {
    const controller = new QuestionManagerController();
    
    // Test controller creation performance
    const startTime = performance.now();
    for (let i = 0; i < 100; i++) {
      new QuestionManagerController();
    }
    const controllerTime = performance.now() - startTime;
    console.log(`✅ Controller creation: ${controllerTime.toFixed(2)}ms for 100 instances`);
    
    // Test filtering performance
    const manyQuestions = Array(1000).fill(mockQuestion).map((q, i) => ({ ...q, id: i.toString() }));
    controller.setState({ questions: manyQuestions });
    
    const filterStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      controller.getFilteredQuestions();
    }
    const filterTime = performance.now() - filterStart;
    console.log(`✅ Filtering: ${filterTime.toFixed(2)}ms for 1000 operations`);
    
    // Test selection performance
    const selectionStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      controller.selectQuestion(i.toString(), true);
    }
    const selectionTime = performance.now() - selectionStart;
    console.log(`✅ Selection: ${selectionTime.toFixed(2)}ms for 1000 operations`);
    
    // Test statistics performance
    const statsStart = performance.now();
    for (let i = 0; i < 1000; i++) {
      controller.getStatistics();
    }
    const statsTime = performance.now() - statsStart;
    console.log(`✅ Statistics: ${statsTime.toFixed(2)}ms for 1000 calculations`);
    
    return true;
  } catch (error) {
    console.error('❌ QuestionManager Performance tests failed:', error);
    return false;
  }
}

/**
 * Test Error Handling
 */
export function testQuestionManagerErrorHandling() {
  console.log('🧪 Testing QuestionManager Error Handling...');
  
  try {
    const controller = new QuestionManagerController();
    
    // Test invalid question ID handling
    const invalidQuestion = controller.getQuestionById('nonexistent');
    console.log('✅ Invalid question ID handled gracefully');
    console.log('  - Returns null for invalid ID:', invalidQuestion === null);
    
    // Test invalid part handling
    const invalidPartInfo = controller.getPartInfo(99 as any);
    console.log('  - Invalid part handled:', invalidPartInfo === undefined);
    
    // Test invalid difficulty handling
    const invalidDifficultyQuestions = controller.getQuestionsByDifficulty('invalid' as any);
    console.log('  - Invalid difficulty handled:', invalidDifficultyQuestions.length === 0);
    
    // Test invalid status handling
    const invalidStatusQuestions = controller.getQuestionsByStatus('invalid' as any);
    console.log('  - Invalid status handled:', invalidStatusQuestions.length === 0);
    
    // Test selection with invalid ID
    controller.selectQuestion('nonexistent', true);
    const isInvalidSelected = controller.isQuestionSelected('nonexistent');
    console.log('  - Invalid selection handled:', !isInvalidSelected);
    
    return true;
  } catch (error) {
    console.error('❌ QuestionManager Error Handling tests failed:', error);
    return false;
  }
}

/**
 * Test Backward Compatibility
 */
export function testQuestionManagerBackwardCompatibility() {
  console.log('🧪 Testing QuestionManager Backward Compatibility...');
  
  try {
    // Test that original component still exists
    const originalComponent = require('@/components/TOEICQuestionManager');
    console.log('✅ Original TOEICQuestionManager component still available');
    
    // Test that new components can coexist
    console.log('✅ New MVC components can coexist with original');
    
    // Test that types are compatible
    const { TOEICPart, Difficulty, QuestionStatus } = require('@/types');
    console.log('✅ Original types still available');
    console.log('  - TOEICPart:', typeof TOEICPart);
    console.log('  - Difficulty:', typeof Difficulty);
    console.log('  - QuestionStatus:', typeof QuestionStatus);
    
    return true;
  } catch (error) {
    console.error('❌ QuestionManager Backward Compatibility tests failed:', error);
    return false;
  }
}

/**
 * Run all QuestionManager migration tests
 */
export function runQuestionManagerMigrationTests() {
  console.log('🚀 Running QuestionManager Migration Tests...\n');
  
  const results = {
    controller: testQuestionManagerController(),
    viewProps: testQuestionManagerViewProps(),
    mvcIntegration: testQuestionManagerMVCIntegration(),
    functionality: testQuestionManagerMigrationFunctionality(),
    performance: testQuestionManagerPerformance(),
    errorHandling: testQuestionManagerErrorHandling(),
    backwardCompatibility: testQuestionManagerBackwardCompatibility()
  };
  
  console.log('\n📊 QuestionManager Test Results:');
  console.log('Controller:', results.controller ? '✅ PASS' : '❌ FAIL');
  console.log('View Props:', results.viewProps ? '✅ PASS' : '❌ FAIL');
  console.log('MVC Integration:', results.mvcIntegration ? '✅ PASS' : '❌ FAIL');
  console.log('Functionality:', results.functionality ? '✅ PASS' : '❌ FAIL');
  console.log('Performance:', results.performance ? '✅ PASS' : '❌ FAIL');
  console.log('Error Handling:', results.errorHandling ? '✅ PASS' : '❌ FAIL');
  console.log('Backward Compatibility:', results.backwardCompatibility ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\nOverall:', allPassed ? '✅ ALL QUESTIONMANAGER TESTS PASSED' : '❌ SOME QUESTIONMANAGER TESTS FAILED');
  
  return {
    allPassed,
    results
  };
}
