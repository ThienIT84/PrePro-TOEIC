/**
 * useStudentExamResultsController
 * React hook để integrate StudentExamResultsController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  StudentExamResultsController, 
  StudentExamResultsState, 
  StudentExamResult, 
  StudentStats,
  FetchStudentExamResultsParams
} from './StudentExamResultsController';

export function useStudentExamResultsController() {
  const [controller] = useState(() => new StudentExamResultsController());
  const [state, setState] = useState<StudentExamResultsState>(controller.getState());

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
  const setExamResults = useCallback((examResults: StudentExamResult[]) => {
    controller.setExamResults(examResults);
  }, [controller]);

  const setStudentStats = useCallback((studentStats: StudentStats[]) => {
    controller.setStudentStats(studentStats);
  }, [controller]);

  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setError = useCallback((error: string | null) => {
    controller.setError(error);
  }, [controller]);

  const setSelectedStudent = useCallback((selectedStudent: string | null) => {
    controller.setSelectedStudent(selectedStudent);
  }, [controller]);

  const setViewingExamId = useCallback((viewingExamId: string | null) => {
    controller.setViewingExamId(viewingExamId);
  }, [controller]);

  // Data operations
  const fetchStudentExamResults = useCallback(async (params: FetchStudentExamResultsParams) => {
    return controller.fetchStudentExamResults(params);
  }, [controller]);

  // Utility functions
  const getFilteredResults = useCallback(() => {
    return controller.getFilteredResults();
  }, [controller]);

  const formatTime = useCallback((seconds: number) => {
    return controller.formatTime(seconds);
  }, [controller]);

  const formatDate = useCallback((dateString: string) => {
    return controller.formatDate(dateString);
  }, [controller]);

  const getScoreColor = useCallback((score: number) => {
    return controller.getScoreColor(score);
  }, [controller]);

  const getScoreBadgeVariant = useCallback((score: number) => {
    return controller.getScoreBadgeVariant(score);
  }, [controller]);

  const getOverviewStatistics = useCallback(() => {
    return controller.getOverviewStatistics();
  }, [controller]);

  const getStudentStatistics = useCallback((studentId: string) => {
    return controller.getStudentStatistics(studentId);
  }, [controller]);

  const getExamResultsByStudent = useCallback((studentId: string) => {
    return controller.getExamResultsByStudent(studentId);
  }, [controller]);

  const getExamResultsByExamSet = useCallback((examSetId: string) => {
    return controller.getExamResultsByExamSet(examSetId);
  }, [controller]);

  const getRecentExamResults = useCallback((limit?: number) => {
    return controller.getRecentExamResults(limit);
  }, [controller]);

  const getTopPerformingStudents = useCallback((limit?: number) => {
    return controller.getTopPerformingStudents(limit);
  }, [controller]);

  const getExamResultsByScoreRange = useCallback((minScore: number, maxScore: number) => {
    return controller.getExamResultsByScoreRange(minScore, maxScore);
  }, [controller]);

  const getExamResultsByDateRange = useCallback((startDate: string, endDate: string) => {
    return controller.getExamResultsByDateRange(startDate, endDate);
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

  const getSelectedStudent = useCallback(() => {
    return controller.getSelectedStudent();
  }, [controller]);

  const getViewingExamId = useCallback(() => {
    return controller.getViewingExamId();
  }, [controller]);

  const getExamResults = useCallback(() => {
    return controller.getExamResults();
  }, [controller]);

  const getStudentStats = useCallback(() => {
    return controller.getStudentStats();
  }, [controller]);

  const resetState = useCallback(() => {
    controller.resetState();
  }, [controller]);

  return {
    // State
    state,
    
    // State properties
    examResults: state.examResults,
    studentStats: state.studentStats,
    loading: state.loading,
    error: state.error,
    selectedStudent: state.selectedStudent,
    viewingExamId: state.viewingExamId,

    // State management
    setExamResults,
    setStudentStats,
    setLoading,
    setError,
    setSelectedStudent,
    setViewingExamId,

    // Data operations
    fetchStudentExamResults,

    // Utility functions
    getFilteredResults,
    formatTime,
    formatDate,
    getScoreColor,
    getScoreBadgeVariant,
    getOverviewStatistics,
    getStudentStatistics,
    getExamResultsByStudent,
    getExamResultsByExamSet,
    getRecentExamResults,
    getTopPerformingStudents,
    getExamResultsByScoreRange,
    getExamResultsByDateRange,

    // State getters
    isLoading,
    hasError,
    getError,
    getSelectedStudent,
    getViewingExamId,
    getExamResults,
    getStudentStats,
    resetState,
  };
}
