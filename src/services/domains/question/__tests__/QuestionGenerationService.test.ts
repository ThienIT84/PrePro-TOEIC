/**
 * Unit tests cho QuestionGenerationService
 */

import { QuestionGenerationService, PART_CONFIGS } from '../QuestionGenerationService';

// Mock Supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        in: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        order: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('QuestionGenerationService', () => {
  let service: QuestionGenerationService;

  beforeEach(() => {
    service = new QuestionGenerationService();
    jest.clearAllMocks();
  });

  describe('Part Configurations', () => {
    it('should return correct part config for Part 1 to Part 7', () => {
      for (let part = 1; part <= 7; part++) {
        const config = service.getPartConfig(part);
        expect(config).toBeDefined();
        expect(config?.part).toBe(part);
        expect(config?.questionCount).toBeGreaterThan(0);
        expect(config?.timeLimit).toBeGreaterThan(0);
        expect(config?.description).toBeTruthy();
      }
    });

    it('should return null for invalid part numbers', () => {
      expect(service.getPartConfig(0)).toBeNull();
      expect(service.getPartConfig(8)).toBeNull();
      expect(service.getPartConfig(-1)).toBeNull();
    });

    it('should return all 7 part configurations', () => {
      const allConfigs = service.getAllPartConfigs();
      expect(allConfigs).toHaveLength(7);
      expect(allConfigs.map(c => c.part)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('Question Generation (Fallback / Mock)', () => {
    it('should generate mini test questions when DB has no questions', async () => {
      const questions = await service.generateQuestions({
        type: 'mini',
        questionCount: 10
      });

      expect(questions.length).toBe(10);
      questions.forEach(q => {
        expect(q.id).toBeDefined();
        expect(q.part).toBeGreaterThanOrEqual(1);
        expect(q.part).toBeLessThanOrEqual(7);
        if (q.part === 2) {
          expect(q.choices).toHaveLength(3);
          expect(['A', 'B', 'C']).toContain(q.correct_answer);
        } else {
          expect(q.choices).toHaveLength(4);
          expect(['A', 'B', 'C', 'D']).toContain(q.correct_answer);
        }
      });
    });

    it('should generate custom test questions for specified parts', async () => {
      const questions = await service.generateQuestions({
        type: 'custom',
        parts: [5],
        questionCount: 5
      });

      expect(questions.length).toBe(5);
      questions.forEach(q => {
        expect(q.part).toBe(5);
        expect(q.type).toBe('reading');
        expect(q.question).toBeTruthy();
        expect(q.choices).toHaveLength(4);
      });
    });

    it('should generate full test questions (200 questions)', async () => {
      const questions = await service.generateQuestions({
        type: 'full'
      });

      expect(questions.length).toBe(200);
      const part1Questions = questions.filter(q => q.part === 1);
      const part2Questions = questions.filter(q => q.part === 2);
      expect(part1Questions.length).toBe(PART_CONFIGS[1].questionCount);
      expect(part2Questions.length).toBe(PART_CONFIGS[2].questionCount);
    });

    it('should return empty array for unknown test type', async () => {
      const questions = await service.generateQuestions({
        type: 'unknown' as any
      });

      expect(questions).toEqual([]);
    });
  });
});
