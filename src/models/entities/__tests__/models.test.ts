/**
 * Unit tests cho Model Entities (QuestionModel, PassageModel, ExamSetModel, UserModel)
 * Sử dụng cú pháp Jest chuẩn: describe, it, expect
 */

import { QuestionModel, PassageModel, ExamSetModel, UserModel } from '../index';
import type { Question, Passage, ExamSet, Profile } from '@/types';

// Mock test data với strict types
const mockQuestionData: Question = {
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

const mockPassageData: Passage = {
  id: '1',
  part: 3,
  passage_type: 'single',
  texts: {
    title: 'Conversation',
    content: 'This is a sample conversation for TOEIC Part 3. It contains multiple sentences and provides context for the questions.'
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

const mockExamSetData: ExamSet = {
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

const mockUserData: Profile = {
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

describe('QuestionModel', () => {
  it('should validate valid question data without errors', () => {
    const question = new QuestionModel(mockQuestionData);
    const errors = question.validate();
    expect(errors).toHaveLength(0);
  });

  it('should detect media requirements for Part 1', () => {
    const question = new QuestionModel(mockQuestionData);
    expect(question.needsAudio()).toBe(true);
    expect(question.needsImage()).toBe(true);
    expect(question.getPartDisplayName()).toBe('Part 1: Photos');
    expect(question.isValidForExam()).toBe(true);
  });

  it('should return error when required fields or media are missing', () => {
    const invalidData = { ...mockQuestionData, image_url: null };
    const question = new QuestionModel(invalidData);
    const errors = question.validate();
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('PassageModel', () => {
  it('should validate valid passage data without errors', () => {
    const passage = new PassageModel(mockPassageData);
    const errors = passage.validate();
    expect(errors).toHaveLength(0);
  });

  it('should calculate word count and reading time correctly', () => {
    const passage = new PassageModel(mockPassageData);
    expect(passage.calculateWordCount()).toBeGreaterThan(0);
    expect(passage.calculateReadingTime()).toBeGreaterThanOrEqual(1);
    expect(passage.isValidForExam()).toBe(true);
  });
});

describe('ExamSetModel', () => {
  it('should validate valid exam set data without errors', () => {
    const examSet = new ExamSetModel(mockExamSetData);
    const errors = examSet.validate();
    expect(errors).toHaveLength(0);
  });

  it('should provide correct display names and time calculation', () => {
    const examSet = new ExamSetModel(mockExamSetData);
    expect(examSet.getTypeDisplayName()).toBe('Mixed');
    expect(examSet.getDifficultyDisplayName()).toBe('Medium');
    expect(examSet.getTimePerQuestion()).toBe(1);
    expect(examSet.isValidForUse()).toBe(true);
  });
});

describe('UserModel', () => {
  it('should validate valid user profile without errors', () => {
    const user = new UserModel(mockUserData);
    const errors = user.validate();
    expect(errors).toHaveLength(0);
  });

  it('should evaluate role and target score level properly', () => {
    const user = new UserModel(mockUserData);
    expect(user.isStudent()).toBe(true);
    expect(user.isTeacher()).toBe(false);
    expect(user.getTargetScoreLevel()).toBe('Intermediate');
    expect(user.getProfileCompletionPercentage()).toBeGreaterThan(0);
  });
});

