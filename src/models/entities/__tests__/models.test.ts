/**
 * Simple tests để verify models hoạt động
 * Không cần jest setup phức tạp
 */

import { QuestionModel, PassageModel, ExamSetModel, UserModel } from '../index';

// Test data
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

const mockPassageData = {
  id: '1',
  part: 3,
  passage_type: 'single',
  texts: {
    title: 'Conversation',
    content: 'This is a sample conversation for TOEIC Part 3. It contains multiple sentences and provides context for the questions.',
    additional: ''
  },
  audio_url: 'https://example.com/audio.mp3',
  assets: {
    images: [],
    charts: []
  },
  meta: {
    word_count: 20,
    reading_time: 1,
    topic: 'Business'
  },
  created_by: 'user1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockExamSetData = {
  id: '1',
  title: 'TOEIC Practice Test 1',
  description: 'A practice test for TOEIC',
  type: 'mix',
  difficulty: 'medium',
  question_count: 100,
  time_limit: 120,
  is_active: true,
  created_by: 'user1',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

const mockUserData = {
  id: '1',
  user_id: 'user1',
  name: 'John Doe',
  role: 'student',
  target_score: 800,
  test_date: '2024-06-01',
  locales: 'en-US',
  focus: ['listening', 'reading'],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

// Test functions
export function testQuestionModel() {
  console.log('🧪 Testing QuestionModel...');
  
  const question = new QuestionModel(mockQuestionData);
  
  // Test validation
  const errors = question.validate();
  console.log('Validation errors:', errors);
  
  // Test business logic
  console.log('Needs audio:', question.needsAudio());
  console.log('Needs image:', question.needsImage());
  console.log('Part display name:', question.getPartDisplayName());
  console.log('Estimated time:', question.getEstimatedTime());
  console.log('Is valid for exam:', question.isValidForExam());
  
  return errors.length === 0;
}

export function testPassageModel() {
  console.log('🧪 Testing PassageModel...');
  
  const passage = new PassageModel(mockPassageData);
  
  // Test validation
  const errors = passage.validate();
  console.log('Validation errors:', errors);
  
  // Test business logic
  console.log('Needs audio:', passage.needsAudio());
  console.log('Part display name:', passage.getPartDisplayName());
  console.log('Word count:', passage.calculateWordCount());
  console.log('Reading time:', passage.calculateReadingTime());
  console.log('Is valid for exam:', passage.isValidForExam());
  
  return errors.length === 0;
}

export function testExamSetModel() {
  console.log('🧪 Testing ExamSetModel...');
  
  const examSet = new ExamSetModel(mockExamSetData);
  
  // Test validation
  const errors = examSet.validate();
  console.log('Validation errors:', errors);
  
  // Test business logic
  console.log('Type display name:', examSet.getTypeDisplayName());
  console.log('Difficulty display name:', examSet.getDifficultyDisplayName());
  console.log('Time per question:', examSet.getTimePerQuestion());
  console.log('Is valid for use:', examSet.isValidForUse());
  console.log('Is TOEIC type:', examSet.isTOEICType());
  
  return errors.length === 0;
}

export function testUserModel() {
  console.log('🧪 Testing UserModel...');
  
  const user = new UserModel(mockUserData);
  
  // Test validation
  const errors = user.validate();
  console.log('Validation errors:', errors);
  
  // Test business logic
  console.log('Is student:', user.isStudent());
  console.log('Is teacher:', user.isTeacher());
  console.log('Target score level:', user.getTargetScoreLevel());
  console.log('Days until test:', user.getDaysUntilTest());
  console.log('Is test coming soon:', user.isTestComingSoon());
  console.log('Profile completion:', user.getProfileCompletionPercentage() + '%');
  
  return errors.length === 0;
}

// Run all tests
export function runAllTests() {
  console.log('🚀 Running all model tests...\n');
  
  const results = {
    question: testQuestionModel(),
    passage: testPassageModel(),
    examSet: testExamSetModel(),
    user: testUserModel()
  };
  
  console.log('\n📊 Test Results:');
  console.log('Question Model:', results.question ? '✅ PASS' : '❌ FAIL');
  console.log('Passage Model:', results.passage ? '✅ PASS' : '❌ FAIL');
  console.log('ExamSet Model:', results.examSet ? '✅ PASS' : '❌ FAIL');
  console.log('User Model:', results.user ? '✅ PASS' : '❌ FAIL');
  
  const allPassed = Object.values(results).every(result => result);
  console.log('\nOverall:', allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return allPassed;
}
