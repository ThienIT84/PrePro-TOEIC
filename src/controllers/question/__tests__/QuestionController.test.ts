/**
 * Unit tests cho QuestionController
 * Sử dụng cú pháp Jest chuẩn: describe, it, expect
 */

import { QuestionController } from '../QuestionController';
import { QuestionModel } from '@/models/entities';
import type { Question } from '@/types';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            or: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          error: null,
        })),
      })),
    })),
  },
}));

// Mock question data with strict types
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

describe('QuestionController - State & Callbacks', () => {
  let controller: QuestionController;

  beforeEach(() => {
    controller = new QuestionController();
  });

  it('should initialize with default state', () => {
    expect(controller.getQuestions()).toEqual([]);
    expect(controller.isLoading()).toBe(false);
    expect(controller.getError()).toBeNull();
  });

  it('should trigger registered callbacks on state updates', () => {
    let questionsChanged = false;
    let loadingChanged = false;
    let errorChanged = false;

    controller.setCallbacks({
      onQuestionsChange: () => { questionsChanged = true; },
      onLoadingChange: () => { loadingChanged = true; },
      onErrorChange: () => { errorChanged = true; }
    });

    controller['setLoading'](true);
    controller['setError']('Test error');
    controller['setQuestions']([new QuestionModel(mockQuestionData)]);

    expect(questionsChanged).toBe(true);
    expect(loadingChanged).toBe(true);
    expect(errorChanged).toBe(true);
    expect(controller.getQuestions()).toHaveLength(1);
    expect(controller.isLoading()).toBe(true);
    expect(controller.getError()).toBe('Test error');
  });

  it('should clear all data on clear()', () => {
    controller['setLoading'](true);
    controller['setError']('Test error');
    controller['setQuestions']([new QuestionModel(mockQuestionData)]);

    controller.clear();

    expect(controller.getQuestions()).toHaveLength(0);
    expect(controller.isLoading()).toBe(false);
    expect(controller.getError()).toBeNull();
  });
});

describe('QuestionController - Queries & Filters', () => {
  let controller: QuestionController;

  beforeEach(() => {
    controller = new QuestionController();
    const questions = [
      new QuestionModel({ ...mockQuestionData, id: '1', part: 1, difficulty: 'easy' }),
      new QuestionModel({ ...mockQuestionData, id: '2', part: 2, difficulty: 'medium', correct_choice: 'B' }),
      new QuestionModel({ ...mockQuestionData, id: '3', part: 5, difficulty: 'hard', correct_choice: 'C', audio_url: null, image_url: null })
    ];
    controller['setQuestions'](questions);
  });

  it('should filter questions by part', () => {
    expect(controller.getQuestionsByPart(1)).toHaveLength(1);
    expect(controller.getQuestionsByPart(5)).toHaveLength(1);
    expect(controller.getQuestionsByPart(7)).toHaveLength(0);
  });

  it('should filter questions by difficulty', () => {
    expect(controller.getQuestionsByDifficulty('easy')).toHaveLength(1);
    expect(controller.getQuestionsByDifficulty('medium')).toHaveLength(1);
    expect(controller.getQuestionsByDifficulty('hard')).toHaveLength(1);
  });

  it('should find question by ID', () => {
    const found = controller.getQuestionById('1');
    expect(found).toBeDefined();
    expect(found?.id).toBe('1');

    const notFound = controller.getQuestionById('999');
    expect(notFound).toBeUndefined();
  });

  it('should search questions by prompt_text and tags', () => {
    const carResults = controller.searchQuestions('car');
    expect(carResults.length).toBeGreaterThan(0);

    const tagResults = controller.searchQuestions('listening');
    expect(tagResults.length).toBe(3);

    const emptyResults = controller.searchQuestions('nonexistent-term-xyz');
    expect(emptyResults).toHaveLength(0);
  });

  it('should compute questions statistics correctly', () => {
    const stats = controller.getQuestionsStats();
    expect(stats.total).toBe(3);
    expect(stats.byPart[1]).toBe(1);
    expect(stats.byPart[2]).toBe(1);
    expect(stats.byPart[5]).toBe(1);
    expect(stats.byDifficulty.easy).toBe(1);
    expect(stats.byDifficulty.medium).toBe(1);
    expect(stats.byDifficulty.hard).toBe(1);
  });
});
