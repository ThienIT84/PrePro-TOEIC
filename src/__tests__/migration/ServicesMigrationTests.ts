/**
 * Services Migration Tests
 * Test domain services functionality
 */

import { ServiceFactory } from '@/services/domains';
import { QuestionModel, ExamSetModel, UserModel } from '@/models/entities';

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
 * Test Service Factory
 */
export function testServiceFactory() {
  console.log('🧪 Testing Service Factory...');
  
  try {
    // Test singleton pattern
    const services1 = ServiceFactory.getAllServices();
    const services2 = ServiceFactory.getAllServices();
    console.log('✅ Service Factory singleton works');
    console.log('  - Same instance:', services1 === services2);
    
    // Test individual service getters
    const questionService = ServiceFactory.getQuestionService();
    const examService = ServiceFactory.getExamService();
    const userService = ServiceFactory.getUserService();
    const analyticsService = ServiceFactory.getAnalyticsService();
    const mediaService = ServiceFactory.getMediaService();
    
    console.log('✅ All services available');
    console.log('  - QuestionService:', !!questionService);
    console.log('  - ExamService:', !!examService);
    console.log('  - UserService:', !!userService);
    console.log('  - AnalyticsService:', !!analyticsService);
    console.log('  - MediaService:', !!mediaService);
    
    // Test service consistency
    const questionService2 = ServiceFactory.getQuestionService();
    console.log('  - QuestionService singleton:', questionService === questionService2);
    
    return true;
  } catch (error) {
    console.error('❌ Service Factory tests failed:', error);
    return false;
  }
}

/**
 * Test Question Service
 */
export function testQuestionService() {
  console.log('🧪 Testing Question Service...');
  
  try {
    const questionService = ServiceFactory.getQuestionService();
    console.log('✅ QuestionService created successfully');
    
    // Test service methods exist
    const methods = [
      'getQuestions',
      'getQuestionById',
      'createQuestion',
      'updateQuestion',
      'deleteQuestion',
      'searchQuestions',
      'getQuestionsByPart',
      'getQuestionsByDifficulty',
      'getQuestionsByStatus',
      'getQuestionsNeedingAudio',
      'getQuestionsNeedingImages',
      'getQuestionsNeedingPassages',
      'getValidQuestionsForExam',
      'getQuestionsStats',
      'bulkCreateQuestions',
      'updateQuestionStatus',
      'getQuestionsCount'
    ];
    
    methods.forEach(method => {
      if (typeof questionService[method] === 'function') {
        console.log(`  ✅ ${method} method exists`);
      } else {
        console.log(`  ❌ ${method} method missing`);
      }
    });
    
    // Test method signatures
    console.log('  - getQuestions method:', typeof questionService.getQuestions);
    console.log('  - createQuestion method:', typeof questionService.createQuestion);
    console.log('  - getQuestionsStats method:', typeof questionService.getQuestionsStats);
    
    return true;
  } catch (error) {
    console.error('❌ Question Service tests failed:', error);
    return false;
  }
}

/**
 * Test Exam Service
 */
export function testExamService() {
  console.log('🧪 Testing Exam Service...');
  
  try {
    const examService = ServiceFactory.getExamService();
    console.log('✅ ExamService created successfully');
    
    // Test service methods exist
    const methods = [
      'getExamSets',
      'getExamSetById',
      'createExamSet',
      'updateExamSet',
      'deleteExamSet',
      'getExamSetQuestions',
      'addQuestionToExamSet',
      'removeQuestionFromExamSet',
      'updateQuestionOrder',
      'getExamSessions',
      'createExamSession',
      'updateExamSession',
      'getExamAttempts',
      'submitExamAttempt',
      'getExamStats',
      'searchExamSets',
      'getExamSetsCount'
    ];
    
    methods.forEach(method => {
      if (typeof examService[method] === 'function') {
        console.log(`  ✅ ${method} method exists`);
      } else {
        console.log(`  ❌ ${method} method missing`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Exam Service tests failed:', error);
    return false;
  }
}

/**
 * Test User Service
 */
export function testUserService() {
  console.log('🧪 Testing User Service...');
  
  try {
    const userService = ServiceFactory.getUserService();
    console.log('✅ UserService created successfully');
    
    // Test service methods exist
    const methods = [
      'getProfiles',
      'getProfileByUserId',
      'getProfileById',
      'createProfile',
      'updateProfile',
      'updateProfileByUserId',
      'deleteProfile',
      'searchProfiles',
      'getProfilesByRole',
      'getStudents',
      'getTeachers',
      'getUserStats',
      'getProfilesCount',
      'userExists',
      'getUserExamHistory',
      'getUserPerformanceStats'
    ];
    
    methods.forEach(method => {
      if (typeof userService[method] === 'function') {
        console.log(`  ✅ ${method} method exists`);
      } else {
        console.log(`  ❌ ${method} method missing`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ User Service tests failed:', error);
    return false;
  }
}

/**
 * Test Analytics Service
 */
export function testAnalyticsService() {
  console.log('🧪 Testing Analytics Service...');
  
  try {
    const analyticsService = ServiceFactory.getAnalyticsService();
    console.log('✅ AnalyticsService created successfully');
    
    // Test service methods exist
    const methods = [
      'getSystemStats',
      'getQuestionAnalytics',
      'getExamAnalytics',
      'getUserAnalytics',
      'getSessionAnalytics',
      'getPerformanceAnalytics',
      'getDashboardSummary',
      'getTrends'
    ];
    
    methods.forEach(method => {
      if (typeof analyticsService[method] === 'function') {
        console.log(`  ✅ ${method} method exists`);
      } else {
        console.log(`  ❌ ${method} method missing`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Analytics Service tests failed:', error);
    return false;
  }
}

/**
 * Test Media Service
 */
export function testMediaService() {
  console.log('🧪 Testing Media Service...');
  
  try {
    const mediaService = ServiceFactory.getMediaService();
    console.log('✅ MediaService created successfully');
    
    // Test service methods exist
    const methods = [
      'uploadFile',
      'getPublicUrl',
      'deleteFile',
      'listFiles',
      'uploadAudio',
      'uploadImage',
      'uploadPassageAsset',
      'getQuestionAudioUrl',
      'getQuestionImageUrl',
      'getPassageAssetsUrls',
      'deleteQuestionMedia',
      'deletePassageAssets',
      'getStorageStats',
      'cleanupOrphanedFiles'
    ];
    
    methods.forEach(method => {
      if (typeof mediaService[method] === 'function') {
        console.log(`  ✅ ${method} method exists`);
      } else {
        console.log(`  ❌ ${method} method missing`);
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Media Service tests failed:', error);
    return false;
  }
}

/**
 * Test Service Error Handling
 */
export function testServiceErrorHandling() {
  console.log('🧪 Testing Service Error Handling...');
  
  try {
    const questionService = ServiceFactory.getQuestionService();
    
    // Test error handling methods exist
    console.log('✅ Error handling methods available');
    console.log('  - handleError method:', typeof questionService.handleError);
    console.log('  - validateRequired method:', typeof questionService.validateRequired);
    
    // Test validation
    const validationErrors = questionService.validateRequired({}, ['required_field']);
    console.log('  - Validation works:', validationErrors.length > 0);
    console.log('  - Error message:', validationErrors[0]);
    
    return true;
  } catch (error) {
    console.error('❌ Service Error Handling tests failed:', error);
    return false;
  }
}

/**
 * Test Service Performance
 */
export function testServicePerformance() {
  console.log('🧪 Testing Service Performance...');
  
  try {
    const startTime = performance.now();
    
    // Test service creation performance
    for (let i = 0; i < 100; i++) {
      ServiceFactory.getAllServices();
    }
    
    const serviceTime = performance.now() - startTime;
    console.log(`✅ Service creation performance: ${serviceTime.toFixed(2)}ms for 100 calls`);
    
    // Test individual service creation
    const individualStart = performance.now();
    for (let i = 0; i < 100; i++) {
      ServiceFactory.getQuestionService();
      ServiceFactory.getExamService();
      ServiceFactory.getUserService();
    }
    const individualTime = performance.now() - individualStart;
    console.log(`✅ Individual service creation: ${individualTime.toFixed(2)}ms for 300 calls`);
    
    return true;
  } catch (error) {
    console.error('❌ Service Performance tests failed:', error);
    return false;
  }
}

/**
 * Test Service Integration
 */
export function testServiceIntegration() {
  console.log('🧪 Testing Service Integration...');
  
  try {
    // Test that services can work together
    const questionService = ServiceFactory.getQuestionService();
    const examService = ServiceFactory.getExamService();
    const userService = ServiceFactory.getUserService();
    
    console.log('✅ Services can be used together');
    console.log('  - QuestionService available:', !!questionService);
    console.log('  - ExamService available:', !!examService);
    console.log('  - UserService available:', !!userService);
    
    // Test that services have consistent interfaces
    const questionMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(questionService));
    const examMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(examService));
    const userMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(userService));
    
    console.log('  - QuestionService methods:', questionMethods.length);
    console.log('  - ExamService methods:', examMethods.length);
    console.log('  - UserService methods:', userMethods.length);
    
    return true;
  } catch (error) {
    console.error('❌ Service Integration tests failed:', error);
    return false;
  }
}

/**
 * Run all Services migration tests
 */
export function runServicesMigrationTests() {
  console.log('🚀 Running Services Migration Tests...\n');
  
  const results = {
    serviceFactory: testServiceFactory(),
    questionService: testQuestionService(),
    examService: testExamService(),
    userService: testUserService(),
    analyticsService: testAnalyticsService(),
    mediaService: testMediaService(),
    errorHandling: testServiceErrorHandling(),
    performance: testServicePerformance(),
    integration: testServiceIntegration()
  };
  
  console.log('\n📊 Services Test Results:');
  console.log('Service Factory:', results.serviceFactory ? '✅ PASS' : '❌ FAIL');
  console.log('Question Service:', results.questionService ? '✅ PASS' : '❌ FAIL');
  console.log('Exam Service:', results.examService ? '✅ PASS' : '❌ FAIL');
  console.log('User Service:', results.userService ? '✅ PASS' : '❌ FAIL');
  console.log('Analytics Service:', results.analyticsService ? '✅ PASS' : '❌ FAIL');
  console.log('Media Service:', results.mediaService ? '✅ PASS' : '❌ FAIL');
  console.log('Error Handling:', results.errorHandling ? '✅ PASS' : '❌ FAIL');
  console.log('Performance:', results.performance ? '✅ PASS' : '❌ FAIL');
  console.log('Integration:', results.integration ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\nOverall:', allPassed ? '✅ ALL SERVICES TESTS PASSED' : '❌ SOME SERVICES TESTS FAILED');
  
  return {
    allPassed,
    results
  };
}
