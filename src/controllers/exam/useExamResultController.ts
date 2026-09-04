/**
 * useExamResultController
 * React hook để integrate ExamResultController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  ExamResultController, 
  ExamResultState, 
  ExamResultData, 
  QuestionResult 
} from './ExamResultController';

export function useExamResultController() {
  const [controller] = useState(() => new ExamResultController());
  const [state, setState] = useState<ExamResultState>(controller.getState());

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  useEffect(() => {
    return () => {
      controller.cleanup();
    };
  }, [controller]);

  const fetchExamResult = useCallback(async (sessionId: string) => {
    return controller.fetchExamResult(sessionId);
  }, [controller]);

  const setRetryMode = useCallback((enabled: boolean) => {
    controller.setRetryMode(enabled);
  }, [controller]);

  const formatTime = useCallback((seconds: number) => {
    return controller.formatTime(seconds);
  }, [controller]);

  const getScoreColor = useCallback((score: number) => {
    return controller.getScoreColor(score);
  }, [controller]);

  return {
    state,
    result: state.result,
    loading: state.loading,
    error: state.error,
    retryMode: state.retryMode,
    questions: state.questions,
    attempts: state.attempts,
    fetchExamResult,
    setRetryMode,
    formatTime,
    getScoreColor,
  };
}
