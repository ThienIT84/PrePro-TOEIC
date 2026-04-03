/**
 * useExamHistoryController
 * React hook để integrate ExamHistoryController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  ExamHistoryController, 
  ExamHistoryState, 
  ExamHistoryItem,
  FetchExamHistoryParams
} from './ExamHistoryController';

export function useExamHistoryController() {
  const [controller] = useState(() => new ExamHistoryController());
  const [state, setState] = useState<ExamHistoryState>(controller.getState());

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controller.cleanup();
    };
  }, [controller]);

  // State management
  const setExams = useCallback((exams: ExamHistoryItem[]) => {
    controller.setExams(exams);
  }, [controller]);

  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setError = useCallback((error: string | null) => {
    controller.setError(error);
  }, [controller]);

  // Data operations
  const fetchExamHistory = useCallback(async (params: FetchExamHistoryParams) => {
    return controller.fetchExamHistory(params);
  }, [controller]);

  // Utility functions
  const formatTime = useCallback((seconds: number) => {
    return controller.formatTime(seconds);
  }, [controller]);

  const formatDate = useCallback((dateString: string) => {
    return controller.formatDate(dateString);
  }, [controller]);

  const getScoreColor = useCallback((score: number) => {
    return controller.getScoreColor(score);
  }, [controller]);

  const getExamStatistics = useCallback(() => {
    return controller.getExamStatistics();
  }, [controller]);

  const getExamsByScoreRange = useCallback((minScore: number, maxScore: number) => {
    return controller.getExamsByScoreRange(minScore, maxScore);
  }, [controller]);

  const getExamsByDateRange = useCallback((startDate: string, endDate: string) => {
    return controller.getExamsByDateRange(startDate, endDate);
  }, [controller]);

  const getRecentExams = useCallback((limit?: number) => {
    return controller.getRecentExams(limit);
  }, [controller]);

  const getBestPerformingExams = useCallback((limit?: number) => {
    return controller.getBestPerformingExams(limit);
  }, [controller]);

  const getExamById = useCallback((examId: string) => {
    return controller.getExamById(examId);
  }, [controller]);

  const getExamsByExamSet = useCallback((examSetId: string) => {
    return controller.getExamsByExamSet(examSetId);
  }, [controller]);

  // State getters
  const isLoading = useCallback(() => {
    return controller.isLoading();
  }, [controller]);

  const hasError = useCallback(() => {
    return controller.hasError();
  }, [controller]);

  const getError = useCallback(() => {
    return controller.getError();
  }, [controller]);

  const getExams = useCallback(() => {
    return controller.getExams();
  }, [controller]);

  const hasExams = useCallback(() => {
    return controller.hasExams();
  }, [controller]);

  const resetState = useCallback(() => {
    controller.resetState();
  }, [controller]);

  return {
    // State
    state,
    
    // State properties
    exams: state.exams,
    loading: state.loading,
    error: state.error,

    // State management
    setExams,
    setLoading,
    setError,

    // Data operations
    fetchExamHistory,

    // Utility functions
    formatTime,
    formatDate,
    getScoreColor,
    getExamStatistics,
    getExamsByScoreRange,
    getExamsByDateRange,
    getRecentExams,
    getBestPerformingExams,
    getExamById,
    getExamsByExamSet,

    // State getters
    isLoading,
    hasError,
    getError,
    getExams,
    hasExams,
    resetState,
  };
}
