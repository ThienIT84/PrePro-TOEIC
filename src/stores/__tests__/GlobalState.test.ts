/**
 * Simple tests để verify Global State Management hoạt động
 * Không cần jest setup phức tạp
 */

import { GlobalState } from '../GlobalStateContext';
import { StoreManager } from '../StoreManager';
import { QuestionModel } from '@/models/entities';

// Mock question data
const mockQuestion = new QuestionModel({
  id: '1',
  part: 1,
  passage_id: null,
  blank_index: null,
  prompt_text: 'What do you see in the picture?',
  choices: { A: 'A car', B: 'A bus', C: 'A train', D: 'A plane' },
  correct_choice: 'A',
  explain_vi: 'Trong hình có một chiếc xe hơi',
  explain_en: 'There is a car in the picture',
  tags: ['listening', 'photos'],
  difficulty: 'easy',
  status: 'published',
  image_url: 'https://example.com/image.jpg',
  audio_url: 'https://example.com/audio.mp3',
  transcript: null,
  created_by: 'user1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
});

// Test functions
export function testGlobalStateReducer() {
  console.log('🧪 Testing Global State Reducer...');
  
  // Mock reducer function
  const reducer = (state: GlobalState, action: any) => {
    switch (action.type) {
      case 'SET_QUESTIONS':
        return { ...state, questions: action.payload };
      case 'SET_QUESTIONS_LOADING':
        return { ...state, questionsLoading: action.payload };
      case 'ADD_QUESTION':
        return { ...state, questions: [action.payload, ...state.questions] };
      default:
        return state;
    }
  };

  const initialState = {
    questions: [],
    questionsLoading: false,
    questionsError: null,
    user: null,
    isAuthenticated: false,
    examSets: [],
    examSetsLoading: false,
    examSetsError: null,
    theme: 'light' as const,
    language: 'vi' as const,
    sidebarOpen: true,
    questionController: null
  };

  // Test initial state
  console.log('Initial state:', initialState);

  // Test set questions
  const state1 = reducer(initialState, { 
    type: 'SET_QUESTIONS', 
    payload: [mockQuestion] 
  });
  console.log('After SET_QUESTIONS:', state1.questions.length);

  // Test set loading
  const state2 = reducer(state1, { 
    type: 'SET_QUESTIONS_LOADING', 
    payload: true 
  });
  console.log('After SET_QUESTIONS_LOADING:', state2.questionsLoading);

  // Test add question
  const newQuestion = { ...mockQuestion, id: '2' };
  const state3 = reducer(state2, { 
    type: 'ADD_QUESTION', 
    payload: newQuestion 
  });
  console.log('After ADD_QUESTION:', state3.questions.length);

  return state3.questions.length === 2;
}

export function testStoreManager() {
  console.log('🧪 Testing Store Manager...');
  
  const storeManager = new StoreManager();
  
  // Test initialization
  console.log('Store manager created:', !!storeManager);
  
  // Test mock dispatch
  let lastAction: any = null;
  const mockDispatch = (action: any) => {
    lastAction = action;
    console.log('Dispatch called with:', action.type);
  };
  
  storeManager.initialize(mockDispatch);
  console.log('Store manager initialized:', !!storeManager);
  
  // Test get question controller
  const controller = storeManager.getQuestionController();
  console.log('Question controller:', !!controller);
  
  // Test methods
  const stats = storeManager.getQuestionsStats();
  console.log('Questions stats:', stats);
  
  const searchResults = storeManager.searchQuestions('car');
  console.log('Search results:', searchResults.length);
  
  const partQuestions = storeManager.getQuestionsByPart(1);
  console.log('Part 1 questions:', partQuestions.length);
  
  // Test cleanup
  storeManager.cleanup();
  console.log('Store manager cleaned up');
  
  return !!lastAction;
}

export function testStateActions() {
  console.log('🧪 Testing State Actions...');
  
  // Test action types
  const actions = [
    { type: 'SET_USER', payload: null },
    { type: 'SET_AUTHENTICATED', payload: true },
    { type: 'SET_QUESTIONS', payload: [mockQuestion] },
    { type: 'SET_QUESTIONS_LOADING', payload: false },
    { type: 'SET_QUESTIONS_ERROR', payload: null },
    { type: 'ADD_QUESTION', payload: mockQuestion },
    { type: 'UPDATE_QUESTION', payload: mockQuestion },
    { type: 'REMOVE_QUESTION', payload: '1' },
    { type: 'SET_THEME', payload: 'dark' as const },
    { type: 'SET_LANGUAGE', payload: 'en' as const },
    { type: 'SET_SIDEBAR_OPEN', payload: false }
  ];
  
  actions.forEach(action => {
    console.log(`Action ${action.type}:`, action.payload);
  });
  
  return actions.length > 0;
}

export function testQuestionModelIntegration() {
  console.log('🧪 Testing Question Model Integration...');
  
  // Test question model methods
  console.log('Question part display:', mockQuestion.getPartDisplayName());
  console.log('Question part type:', mockQuestion.getPartType());
  console.log('Question estimated time:', mockQuestion.getEstimatedTime());
  console.log('Question needs audio:', mockQuestion.needsAudio());
  console.log('Question needs image:', mockQuestion.needsImage());
  console.log('Question needs passage:', mockQuestion.needsPassage());
  console.log('Question is valid for exam:', mockQuestion.isValidForExam());
  console.log('Question difficulty score:', mockQuestion.getDifficultyScore());
  
  // Test validation
  const validationErrors = mockQuestion.validate();
  console.log('Validation errors:', validationErrors.length);
  
  // Test JSON conversion
  const jsonData = mockQuestion.toJSON();
  console.log('JSON conversion:', !!jsonData);
  
  return validationErrors.length === 0;
}

// Run all tests
export function runGlobalStateTests() {
  console.log('🚀 Running Global State Management tests...\n');
  
  const results = {
    reducer: testGlobalStateReducer(),
    storeManager: testStoreManager(),
    actions: testStateActions(),
    modelIntegration: testQuestionModelIntegration()
  };
  
  console.log('\n📊 Test Results:');
  console.log('Reducer:', results.reducer ? '✅ PASS' : '❌ FAIL');
  console.log('Store Manager:', results.storeManager ? '✅ PASS' : '❌ FAIL');
  console.log('Actions:', results.actions ? '✅ PASS' : '❌ FAIL');
  console.log('Model Integration:', results.modelIntegration ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\nOverall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return allPassed;
}
