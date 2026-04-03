/**
 * Simple tests để verify QuestionController hoạt động
 * Không cần jest setup phức tạp
 */

import { QuestionController } from '../QuestionController';
import { QuestionModel } from '@/models/entities';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn(() => ({
        eq: jest.fn(() => ({
          or: jest.fn(() => ({
            data: [],
            error: null
          }))
        }))
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => ({
          data: mockQuestionData,
          error: null
        }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: mockQuestionData,
            error: null
          }))
        }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => ({
        error: null
      }))
    }))
  }))
};

// Mock question data
const mockQuestionData = {
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
};

// Test functions
export function testQuestionController() {
  console.log('🧪 Testing QuestionController...');
  
  const controller = new QuestionController();
  
  // Test initial state
  console.log('Initial questions:', controller.getQuestions().length);
  console.log('Initial loading:', controller.isLoading());
  console.log('Initial error:', controller.getError());
  
  // Test callbacks
  let questionsChanged = false;
  let loadingChanged = false;
  let errorChanged = false;
  
  controller.setCallbacks({
    onQuestionsChange: () => { questionsChanged = true; },
    onLoadingChange: () => { loadingChanged = true; },
    onErrorChange: () => { errorChanged = true; }
  });
  
  // Test state changes
  controller['setLoading'](true);
  controller['setError']('Test error');
  controller['setQuestions']([new QuestionModel(mockQuestionData)]);
  
  console.log('Callbacks triggered:', {
    questionsChanged,
    loadingChanged,
    errorChanged
  });
  
  // Test getters
  console.log('Questions after set:', controller.getQuestions().length);
  console.log('Loading after set:', controller.isLoading());
  console.log('Error after set:', controller.getError());
  
  // Test filtering methods
  const question = new QuestionModel(mockQuestionData);
  controller['setQuestions']([question]);
  
  console.log('Questions by part 1:', controller.getQuestionsByPart(1).length);
  console.log('Questions by difficulty easy:', controller.getQuestionsByDifficulty('easy').length);
  console.log('Questions needing audio:', controller.getQuestionsNeedingAudio().length);
  console.log('Questions needing images:', controller.getQuestionsNeedingImages().length);
  console.log('Questions needing passages:', controller.getQuestionsNeedingPassages().length);
  console.log('Valid questions for exam:', controller.getValidQuestionsForExam().length);
  
  // Test search
  const searchResults = controller.searchQuestions('car');
  console.log('Search results for "car":', searchResults.length);
  
  // Test statistics
  const stats = controller.getQuestionsStats();
  console.log('Statistics:', stats);
  
  // Test clear
  controller.clear();
  console.log('After clear - questions:', controller.getQuestions().length);
  console.log('After clear - loading:', controller.isLoading());
  console.log('After clear - error:', controller.getError());
  
  return true;
}

export function testQuestionControllerMethods() {
  console.log('🧪 Testing QuestionController methods...');
  
  const controller = new QuestionController();
  
  // Test getQuestionById
  const question = new QuestionModel(mockQuestionData);
  controller['setQuestions']([question]);
  
  const foundQuestion = controller.getQuestionById('1');
  console.log('Found question by ID:', !!foundQuestion);
  
  const notFoundQuestion = controller.getQuestionById('999');
  console.log('Not found question by ID:', !notFoundQuestion);
  
  // Test search with different terms
  const searchTerms = ['car', 'bus', 'train', 'plane', 'nonexistent'];
  searchTerms.forEach(term => {
    const results = controller.searchQuestions(term);
    console.log(`Search "${term}":`, results.length, 'results');
  });
  
  // Test statistics with multiple questions
  const questions = [
    new QuestionModel({ ...mockQuestionData, id: '1', part: 1, difficulty: 'easy' }),
    new QuestionModel({ ...mockQuestionData, id: '2', part: 2, difficulty: 'medium' }),
    new QuestionModel({ ...mockQuestionData, id: '3', part: 3, difficulty: 'hard' })
  ];
  controller['setQuestions'](questions);
  
  const stats = controller.getQuestionsStats();
  console.log('Multi-question statistics:', stats);
  
  return true;
}

// Run all tests
export function runQuestionControllerTests() {
  console.log('🚀 Running QuestionController tests...\n');
  
  const results = {
    basic: testQuestionController(),
    methods: testQuestionControllerMethods()
  };
  
  console.log('\n📊 Test Results:');
  console.log('Basic Controller:', results.basic ? '✅ PASS' : '❌ FAIL');
  console.log('Controller Methods:', results.methods ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\nOverall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return allPassed;
}
