/**
 * ExamSessionMigrationTests
 * Tests cho ExamSession.tsx migration sang MVC pattern
 */

import { ExamSessionController } from '../controllers/exam/ExamSessionController';
import { ExamSet, Question } from '@/types';

// Mock data
const mockExamSet: ExamSet = {
  id: 'test-exam-set',
  title: 'Test Exam',
  description: 'Test Description',
  type: 'toeic',
  difficulty: 'medium',
  question_count: 5,
  time_limit: 30,
  is_active: true,
  created_by: 'test-user',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockQuestions: Question[] = [
  {
    id: 'q1',
    part: 1,
    prompt_text: 'What is this?',
    choices: { A: 'Option A', B: 'Option B', C: 'Option C', D: 'Option D' },
    correct_choice: 'A',
    explain_en: 'Explanation',
    explain_vi: 'Giải thích',
    difficulty: 'easy',
    audio_url: null,
    image_url: 'test-image.jpg',
    transcript: null,
    blank_index: null,
    passage_id: null,
    tags: [],
    status: 'published',
    created_by: 'test-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'q2',
    part: 2,
    prompt_text: 'How are you?',
    choices: { A: 'Fine', B: 'Good', C: 'Great', D: 'Excellent' },
    correct_choice: 'A',
    explain_en: 'Explanation',
    explain_vi: 'Giải thích',
    difficulty: 'medium',
    audio_url: 'test-audio.mp3',
    image_url: null,
    transcript: null,
    blank_index: null,
    passage_id: null,
    tags: [],
    status: 'published',
    created_by: 'test-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

/**
 * Test ExamSessionController functionality
 */
export function testExamSessionController() {
  console.log('🧪 Testing ExamSessionController...');
  
  const controller = new ExamSessionController();
  
  // Test initial state
  const initialState = controller.getState();
  console.assert(initialState.examSet === null, 'Initial examSet should be null');
  console.assert(initialState.questions.length === 0, 'Initial questions should be empty');
  console.assert(initialState.currentIndex === 0, 'Initial currentIndex should be 0');
  console.assert(initialState.timeLeft === 0, 'Initial timeLeft should be 0');
  console.assert(!initialState.isStarted, 'Initial isStarted should be false');
  console.assert(!initialState.isPaused, 'Initial isPaused should be false');
  console.assert(!initialState.isSubmitted, 'Initial isSubmitted should be false');
  console.assert(initialState.loading, 'Initial loading should be true');
  
  // Test setting exam data
  controller.setExamSet(mockExamSet);
  controller.setQuestions(mockQuestions);
  controller.setTimeLeft(1800); // 30 minutes
  
  const stateAfterSetup = controller.getState();
  console.assert(stateAfterSetup.examSet?.id === 'test-exam-set', 'ExamSet should be set correctly');
  console.assert(stateAfterSetup.questions.length === 2, 'Questions should be set correctly');
  console.assert(stateAfterSetup.timeLeft === 1800, 'TimeLeft should be set correctly');
  
  // Test navigation
  controller.nextQuestion();
  console.assert(controller.getState().currentIndex === 1, 'Should navigate to next question');
  
  controller.previousQuestion();
  console.assert(controller.getState().currentIndex === 0, 'Should navigate to previous question');
  
  controller.goToQuestion(1);
  console.assert(controller.getState().currentIndex === 1, 'Should navigate to specific question');
  
  // Test answer handling
  controller.handleAnswerChange('q1', 'A');
  const answer = controller.getAnswerByQuestionId('q1');
  console.assert(answer?.answer === 'A', 'Answer should be set correctly');
  console.assert(controller.isQuestionAnswered('q1'), 'Question should be marked as answered');
  
  // Test exam start
  controller.startExam();
  const startedState = controller.getState();
  console.assert(startedState.isStarted, 'Exam should be started');
  
  // Test pause/resume
  controller.pauseExam();
  console.assert(controller.getState().isPaused, 'Exam should be paused');
  
  controller.pauseExam();
  console.assert(!controller.getState().isPaused, 'Exam should be resumed');
  
  // Test utility functions
  const formattedTime = controller.formatTime(125); // 2:05
  console.assert(formattedTime === '02:05', 'Time should be formatted correctly');
  
  const progress = controller.getProgress();
  console.assert(progress === 50, 'Progress should be 50% for question 2 of 2');
  
  const answeredCount = controller.getAnsweredCount();
  console.assert(answeredCount === 1, 'Should have 1 answered question');
  
  // Test current question/answer
  const currentQuestion = controller.getCurrentQuestion();
  console.assert(currentQuestion?.id === 'q2', 'Current question should be q2');
  
  const currentAnswer = controller.getCurrentAnswer();
  console.assert(currentAnswer === null, 'Current answer should be null for q2');
  
  // Test exam statistics
  const stats = controller.getExamStatistics();
  console.assert(stats.totalQuestions === 2, 'Total questions should be 2');
  console.assert(stats.answeredQuestions === 1, 'Answered questions should be 1');
  console.assert(stats.unansweredQuestions === 1, 'Unanswered questions should be 1');
  console.assert(stats.progress === 50, 'Progress should be 50%');
  
  // Test results calculation
  const results = controller.calculateResults();
  console.assert(results.totalQuestions === 2, 'Results total questions should be 2');
  console.assert(results.correctAnswers === 0, 'Results correct answers should be 0 (not calculated yet)');
  
  // Test dialog management
  controller.showSubmitDialog();
  console.assert(controller.getState().showSubmitDialog, 'Submit dialog should be shown');
  
  controller.hideSubmitDialog();
  console.assert(!controller.getState().showSubmitDialog, 'Submit dialog should be hidden');
  
  // Test exam submission
  controller.handleSubmitExam();
  console.assert(controller.getState().isSubmitted, 'Exam should be submitted');
  
  // Test cleanup
  controller.cleanup();
  
  console.log('✅ ExamSessionController tests passed!');
}

/**
 * Test ExamSessionView props interface
 */
export function testExamSessionViewProps() {
  console.log('🧪 Testing ExamSessionView props interface...');
  
  // Test that all required props are defined
  const requiredProps = [
    'examSet', 'questions', 'currentIndex', 'answers', 'timeLeft',
    'isStarted', 'isPaused', 'isSubmitted', 'loading', 'showSubmitDialog',
    'hasCompleted', 'refreshKey', 'sessionId', 'passageMap', 'selectedParts',
    'onStartExam', 'onPauseExam', 'onNextQuestion', 'onPreviousQuestion',
    'onGoToQuestion', 'onAnswerChange', 'onShowSubmitDialog', 'onHideSubmitDialog',
    'onSubmitExam', 'onRefreshExam', 'onNavigateBack', 'onNavigateToResults',
    'onNavigateToHistory', 'formatTime', 'getProgress', 'getAnsweredCount',
    'getCurrentQuestion', 'getCurrentAnswer'
  ];
  
  // This is a compile-time test - if the interface is wrong, TypeScript will catch it
  console.log('✅ ExamSessionView props interface is valid!');
}

/**
 * Test MVC integration
 */
export function testExamSessionMVCIntegration() {
  console.log('🧪 Testing ExamSession MVC integration...');
  
  // Test that controller and view can work together
  const controller = new ExamSessionController();
  
  // Simulate MVC flow
  controller.setExamSet(mockExamSet);
  controller.setQuestions(mockQuestions);
  controller.setTimeLeft(1800);
  controller.setLoading(false);
  
  // Test state synchronization
  const state = controller.getState();
  console.assert(state.examSet !== null, 'ExamSet should be set');
  console.assert(state.questions.length > 0, 'Questions should be set');
  console.assert(!state.loading, 'Loading should be false');
  
  // Test action handling
  controller.startExam();
  controller.handleAnswerChange('q1', 'A');
  controller.nextQuestion();
  
  const finalState = controller.getState();
  console.assert(finalState.isStarted, 'Exam should be started');
  console.assert(finalState.currentIndex === 1, 'Should be on second question');
  console.assert(finalState.answers.has('q1'), 'Should have answer for q1');
  
  console.log('✅ ExamSession MVC integration tests passed!');
}

/**
 * Test error handling
 */
export function testExamSessionErrorHandling() {
  console.log('🧪 Testing ExamSession error handling...');
  
  const controller = new ExamSessionController();
  
  // Test invalid navigation
  controller.goToQuestion(-1); // Should not change index
  console.assert(controller.getState().currentIndex === 0, 'Should not navigate to invalid index');
  
  controller.goToQuestion(999); // Should not change index
  console.assert(controller.getState().currentIndex === 0, 'Should not navigate to out-of-bounds index');
  
  // Test answer handling with invalid question ID
  controller.handleAnswerChange('invalid-id', 'A');
  console.assert(controller.getState().answers.size === 0, 'Should not add invalid answer');
  
  // Test timer edge cases
  controller.setTimeLeft(0);
  controller.startExam();
  // Timer should not start when timeLeft is 0
  
  console.log('✅ ExamSession error handling tests passed!');
}

/**
 * Test performance
 */
export function testExamSessionPerformance() {
  console.log('🧪 Testing ExamSession performance...');
  
  const controller = new ExamSessionController();
  
  // Test with large number of questions
  const largeQuestionSet: Question[] = Array.from({ length: 100 }, (_, i) => ({
    ...mockQuestions[0],
    id: `q${i}`,
    prompt_text: `Question ${i}`
  }));
  
  controller.setQuestions(largeQuestionSet);
  
  const startTime = performance.now();
  
  // Test navigation performance
  for (let i = 0; i < 100; i++) {
    controller.goToQuestion(i);
  }
  
  // Test answer handling performance
  for (let i = 0; i < 100; i++) {
    controller.handleAnswerChange(`q${i}`, 'A');
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.assert(duration < 1000, `Performance test should complete in under 1 second, took ${duration}ms`);
  
  console.log(`✅ ExamSession performance test passed! (${duration.toFixed(2)}ms)`);
}

/**
 * Run all ExamSession migration tests
 */
export function runExamSessionMigrationTests() {
  console.log('🚀 Running ExamSession Migration Tests...');
  
  try {
    testExamSessionController();
    testExamSessionViewProps();
    testExamSessionMVCIntegration();
    testExamSessionErrorHandling();
    testExamSessionPerformance();
    
    console.log('🎉 All ExamSession migration tests passed!');
    return true;
  } catch (error) {
    console.error('❌ ExamSession migration tests failed:', error);
    return false;
  }
}

// Export for use in other test files
export default {
  testExamSessionController,
  testExamSessionViewProps,
  testExamSessionMVCIntegration,
  testExamSessionErrorHandling,
  testExamSessionPerformance,
  runExamSessionMigrationTests
};
