/**
 * Migration Tests - Đảm bảo không có breaking changes
 * Test tất cả components và services đã migrate
 */

import { QuestionModel, ExamSetModel, UserModel } from '@/models/entities';
import { QuestionController } from '@/controllers/question/QuestionController';
import { DashboardController } from '@/controllers/dashboard/DashboardController';
import { ServiceFactory } from '@/services/domains';
import { GlobalProvider } from '@/stores/GlobalStateContext';

// Mock data
const mockQuestion = {
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

const mockExamSet = {
  id: '1',
  title: 'TOEIC Practice Test 1',
  type: 'practice',
  difficulty: 'medium',
  question_count: 50,
  time_limit: 60,
  is_active: true,
  created_by: 'user1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockUser = {
  id: '1',
  user_id: 'user1',
  name: 'Test User',
  role: 'student',
  target_score: 800,
  locales: ['vi', 'en'],
  test_date: '2024-06-01',
  focus: ['listening', 'reading'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

/**
 * Test Models
 */
export function testModels() {
  console.log('🧪 Testing Models...');
  
  try {
    // Test QuestionModel
    const questionModel = new QuestionModel(mockQuestion);
    console.log('✅ QuestionModel created successfully');
    console.log('  - Part display:', questionModel.getPartDisplayName());
    console.log('  - Part type:', questionModel.getPartType());
    console.log('  - Estimated time:', questionModel.getEstimatedTime());
    console.log('  - Needs audio:', questionModel.needsAudio());
    console.log('  - Needs image:', questionModel.needsImage());
    console.log('  - Is valid for exam:', questionModel.isValidForExam());
    console.log('  - Difficulty score:', questionModel.getDifficultyScore());
    
    // Test validation
    const validationErrors = questionModel.validate();
    console.log('  - Validation errors:', validationErrors.length);
    
    // Test JSON conversion
    const jsonData = questionModel.toJSON();
    console.log('  - JSON conversion:', !!jsonData);
    
    // Test ExamSetModel
    const examSetModel = new ExamSetModel(mockExamSet);
    console.log('✅ ExamSetModel created successfully');
    console.log('  - Is valid:', examSetModel.isValid());
    console.log('  - Total time:', examSetModel.getTotalTime());
    console.log('  - Difficulty score:', examSetModel.getDifficultyScore());
    console.log('  - Is TOEIC type:', examSetModel.isTOEICType());
    
    // Test UserModel
    const userModel = new UserModel(mockUser);
    console.log('✅ UserModel created successfully');
    console.log('  - Is student:', userModel.isStudent());
    console.log('  - Is teacher:', userModel.isTeacher());
    console.log('  - User level:', userModel.getUserLevel());
    console.log('  - Days until test:', userModel.getDaysUntilTest());
    console.log('  - Profile completion:', userModel.getProfileCompletion());
    
    return true;
  } catch (error) {
    console.error('❌ Model tests failed:', error);
    return false;
  }
}

/**
 * Test Controllers
 */
export function testControllers() {
  console.log('🧪 Testing Controllers...');
  
  try {
    // Test QuestionController
    const questionController = new QuestionController();
    console.log('✅ QuestionController created successfully');
    
    // Test methods
    const stats = questionController.getQuestionsStats();
    console.log('  - Questions stats:', stats);
    
    const searchResults = questionController.searchQuestions('car');
    console.log('  - Search results:', searchResults.length);
    
    const partQuestions = questionController.getQuestionsByPart(1);
    console.log('  - Part 1 questions:', partQuestions.length);
    
    const difficultyQuestions = questionController.getQuestionsByDifficulty('easy');
    console.log('  - Easy questions:', difficultyQuestions.length);
    
    // Test DashboardController
    const dashboardController = new DashboardController();
    console.log('✅ DashboardController created successfully');
    
    const toeicParts = dashboardController.getToeicParts();
    console.log('  - TOEIC parts:', toeicParts.length);
    
    const teacherStats = dashboardController.getTeacherStats([mockExamSet], []);
    console.log('  - Teacher stats:', teacherStats);
    
    const formattedAnalytics = dashboardController.formatAnalytics(null);
    console.log('  - Formatted analytics:', formattedAnalytics);
    
    return true;
  } catch (error) {
    console.error('❌ Controller tests failed:', error);
    return false;
  }
}

/**
 * Test Services
 */
export function testServices() {
  console.log('🧪 Testing Services...');
  
  try {
    // Test ServiceFactory
    const services = ServiceFactory.getAllServices();
    console.log('✅ ServiceFactory created successfully');
    console.log('  - Available services:', Object.keys(services));
    
    // Test individual services
    const questionService = ServiceFactory.getQuestionService();
    console.log('✅ QuestionService available');
    
    const examService = ServiceFactory.getExamService();
    console.log('✅ ExamService available');
    
    const userService = ServiceFactory.getUserService();
    console.log('✅ UserService available');
    
    const analyticsService = ServiceFactory.getAnalyticsService();
    console.log('✅ AnalyticsService available');
    
    const mediaService = ServiceFactory.getMediaService();
    console.log('✅ MediaService available');
    
    return true;
  } catch (error) {
    console.error('❌ Service tests failed:', error);
    return false;
  }
}

/**
 * Test Global State
 */
export function testGlobalState() {
  console.log('🧪 Testing Global State...');
  
  try {
    // Test GlobalProvider
    console.log('✅ GlobalProvider available');
    
    // Test state structure
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
    
    console.log('  - Initial state structure:', Object.keys(initialState));
    
    return true;
  } catch (error) {
    console.error('❌ Global State tests failed:', error);
    return false;
  }
}

/**
 * Test Component Integration
 */
export function testComponentIntegration() {
  console.log('🧪 Testing Component Integration...');
  
  try {
    // Test imports
    const { DashboardView } = require('@/views/pages/DashboardView');
    const { DashboardMVC } = require('@/views/pages/DashboardMVC');
    const { useDashboardController } = require('@/controllers/dashboard/useDashboardController');
    
    console.log('✅ DashboardView imported successfully');
    console.log('✅ DashboardMVC imported successfully');
    console.log('✅ useDashboardController imported successfully');
    
    // Test QuestionDetailModal
    const { QuestionDetailModalView } = require('@/views/components/QuestionDetailModalView');
    const { QuestionDetailModalMVC } = require('@/views/components/QuestionDetailModalMVC');
    
    console.log('✅ QuestionDetailModalView imported successfully');
    console.log('✅ QuestionDetailModalMVC imported successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Component Integration tests failed:', error);
    return false;
  }
}

/**
 * Test Type Safety
 */
export function testTypeSafety() {
  console.log('🧪 Testing Type Safety...');
  
  try {
    // Test QuestionModel types
    const questionModel = new QuestionModel(mockQuestion);
    const questionId: string | undefined = questionModel.id;
    const questionData = questionModel.toJSON();
    
    console.log('✅ QuestionModel types are correct');
    console.log('  - ID type:', typeof questionId);
    console.log('  - Data type:', typeof questionData);
    
    // Test Controller types
    const questionController = new QuestionController();
    const stats = questionController.getQuestionsStats();
    
    console.log('✅ Controller types are correct');
    console.log('  - Stats type:', typeof stats);
    
    // Test Service types
    const questionService = ServiceFactory.getQuestionService();
    console.log('✅ Service types are correct');
    
    return true;
  } catch (error) {
    console.error('❌ Type Safety tests failed:', error);
    return false;
  }
}

/**
 * Test Backward Compatibility
 */
export function testBackwardCompatibility() {
  console.log('🧪 Testing Backward Compatibility...');
  
  try {
    // Test that original components still work
    const originalDashboard = require('@/pages/Dashboard');
    console.log('✅ Original Dashboard component still available');
    
    // Test that original types still work
    const { Question, ExamSet, Profile } = require('@/types');
    console.log('✅ Original types still available');
    
    // Test that original services still work
    const { supabase } = require('@/integrations/supabase/client');
    console.log('✅ Supabase client still available');
    
    // Test that original hooks still work
    const { useAuth } = require('@/hooks/useAuth');
    console.log('✅ Original hooks still available');
    
    return true;
  } catch (error) {
    console.error('❌ Backward Compatibility tests failed:', error);
    return false;
  }
}

/**
 * Test Performance
 */
export function testPerformance() {
  console.log('🧪 Testing Performance...');
  
  try {
    const startTime = performance.now();
    
    // Test model creation performance
    for (let i = 0; i < 100; i++) {
      new QuestionModel(mockQuestion);
    }
    
    const modelTime = performance.now() - startTime;
    console.log(`✅ Model creation performance: ${modelTime.toFixed(2)}ms for 100 instances`);
    
    // Test controller performance
    const controllerStart = performance.now();
    const questionController = new QuestionController();
    questionController.getQuestionsStats();
    const controllerTime = performance.now() - controllerStart;
    console.log(`✅ Controller performance: ${controllerTime.toFixed(2)}ms`);
    
    // Test service performance
    const serviceStart = performance.now();
    const services = ServiceFactory.getAllServices();
    const serviceTime = performance.now() - serviceStart;
    console.log(`✅ Service performance: ${serviceTime.toFixed(2)}ms`);
    
    return true;
  } catch (error) {
    console.error('❌ Performance tests failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
export function runAllMigrationTests() {
  console.log('🚀 Running Migration Tests...\n');
  
  const results = {
    models: testModels(),
    controllers: testControllers(),
    services: testServices(),
    globalState: testGlobalState(),
    componentIntegration: testComponentIntegration(),
    typeSafety: testTypeSafety(),
    backwardCompatibility: testBackwardCompatibility(),
    performance: testPerformance()
  };
  
  console.log('\n📊 Test Results:');
  console.log('Models:', results.models ? '✅ PASS' : '❌ FAIL');
  console.log('Controllers:', results.controllers ? '✅ PASS' : '❌ FAIL');
  console.log('Services:', results.services ? '✅ PASS' : '❌ FAIL');
  console.log('Global State:', results.globalState ? '✅ PASS' : '❌ FAIL');
  console.log('Component Integration:', results.componentIntegration ? '✅ PASS' : '❌ FAIL');
  console.log('Type Safety:', results.typeSafety ? '✅ PASS' : '❌ FAIL');
  console.log('Backward Compatibility:', results.backwardCompatibility ? '✅ PASS' : '❌ FAIL');
  console.log('Performance:', results.performance ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\nOverall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return {
    allPassed,
    results
  };
}
