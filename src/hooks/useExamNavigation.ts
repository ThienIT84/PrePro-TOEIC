/**
 * useExamNavigation Hook
 * Quản lý navigation và calculations với memoization
 * Tối ưu performance cho exam session
 */

import { useMemo, useCallback, useState } from 'react';
import { Question } from '@/types';

interface ExamAnswer {
  questionId: string;
  answer: string;
  isCorrect?: boolean;
  timeSpent?: number;
}

interface UseExamNavigationOptions {
  questions: Question[];
  answers: Map<string, ExamAnswer>;
  initialIndex?: number;
}

interface UseExamNavigationReturn {
  currentIndex: number;
  currentQuestion: Question | null;
  goToNext: () => void;
  goToPrevious: () => void;
  goToQuestion: (index: number) => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  progress: number;
  answeredCount: number;
  unansweredCount: number;
  getTOEICQuestionNumber: (index: number) => number;
  isAnswered: (index: number) => boolean;
  getQuestionStatus: (index: number) => 'answered' | 'current' | 'unanswered';
}

/**
 * TOEIC Part Start Numbers
 */
const TOEIC_PART_START: Record<number, number> = {
  1: 1,   // Part 1: 1-6
  2: 7,   // Part 2: 7-31
  3: 32,  // Part 3: 32-70
  4: 71,  // Part 4: 71-100
  5: 101, // Part 5: 101-130
  6: 131, // Part 6: 131-146
  7: 147, // Part 7: 147-200
};

/**
 * Hook quản lý navigation tối ưu
 */
export const useExamNavigation = ({
  questions,
  answers,
  initialIndex = 0,
}: UseExamNavigationOptions): UseExamNavigationReturn => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  /**
   * Current question (memoized)
   */
  const currentQuestion = useMemo(
    () => questions[currentIndex] || null,
    [questions, currentIndex]
  );

  /**
   * Calculate TOEIC question number
   * Memoized với index và questions
   */
  const getTOEICQuestionNumber = useCallback(
    (index: number): number => {
      const question = questions[index];
      if (!question) return index + 1;

      const part = question.part;
      const startNumber = TOEIC_PART_START[part] || 1;

      // Count questions in same part before this index
      const questionsInSamePart = questions
        .slice(0, index + 1)
        .filter((q) => q.part === part);
      
      const questionInPartIndex = questionsInSamePart.length - 1;

      return startNumber + questionInPartIndex;
    },
    [questions]
  );

  /**
   * Calculate progress percentage
   * Memoized
   */
  const progress = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round(((currentIndex + 1) / questions.length) * 100);
  }, [currentIndex, questions.length]);

  /**
   * Count answered questions
   * Memoized
   */
  const answeredCount = useMemo(() => {
    return questions.filter((q) => {
      const answer = answers.get(q.id);
      return answer && answer.answer;
    }).length;
  }, [questions, answers]);

  /**
   * Count unanswered questions
   * Memoized
   */
  const unansweredCount = useMemo(() => {
    return questions.length - answeredCount;
  }, [questions.length, answeredCount]);

  /**
   * Check if question is answered
   * Memoized callback
   */
  const isAnswered = useCallback(
    (index: number): boolean => {
      const question = questions[index];
      if (!question) return false;

      const answer = answers.get(question.id);
      return !!(answer && answer.answer);
    },
    [questions, answers]
  );

  /**
   * Get question status
   * Memoized callback
   */
  const getQuestionStatus = useCallback(
    (index: number): 'answered' | 'current' | 'unanswered' => {
      if (index === currentIndex) return 'current';
      if (isAnswered(index)) return 'answered';
      return 'unanswered';
    },
    [currentIndex, isAnswered]
  );

  /**
   * Navigate to next question
   */
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1));
  }, [questions.length]);

  /**
   * Navigate to previous question
   */
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  /**
   * Navigate to specific question
   */
  const goToQuestion = useCallback(
    (index: number) => {
      if (index >= 0 && index < questions.length) {
        setCurrentIndex(index);
      }
    },
    [questions.length]
  );

  /**
   * Can navigate flags
   */
  const canGoNext = useMemo(
    () => currentIndex < questions.length - 1,
    [currentIndex, questions.length]
  );

  const canGoPrevious = useMemo(
    () => currentIndex > 0,
    [currentIndex]
  );

  return {
    currentIndex,
    currentQuestion,
    goToNext,
    goToPrevious,
    goToQuestion,
    canGoNext,
    canGoPrevious,
    progress,
    answeredCount,
    unansweredCount,
    getTOEICQuestionNumber,
    isAnswered,
    getQuestionStatus,
  };
};

/**
 * Helper: Get part color
 */
export const getPartColor = (part: number): string => {
  if (part <= 4) return 'blue'; // Listening
  return 'green'; // Reading
};

/**
 * Helper: Get part label
 */
export const getPartLabel = (part: number): string => {
  const labels: Record<number, string> = {
    1: 'Photographs',
    2: 'Question-Response',
    3: 'Conversations',
    4: 'Short Talks',
    5: 'Incomplete Sentences',
    6: 'Text Completion',
    7: 'Reading Comprehension',
  };
  return labels[part] || `Part ${part}`;
};

/**
 * Helper: Get question range for part
 */
export const getPartQuestionRange = (part: number): [number, number] => {
  const ranges: Record<number, [number, number]> = {
    1: [1, 6],
    2: [7, 31],
    3: [32, 70],
    4: [71, 100],
    5: [101, 130],
    6: [131, 146],
    7: [147, 200],
  };
  return ranges[part] || [1, 1];
};
