/**
 * useQuestionManagerController
 * React hook để integrate QuestionManagerController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { QuestionManagerController, QuestionManagerState, Question, FilterOptions } from './QuestionManagerController';

export function useQuestionManagerController() {
  const [controller] = useState(() => new QuestionManagerController());
  const [state, setState] = useState<QuestionManagerState>(controller.getState());

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // Initialize data on mount
  useEffect(() => {
    controller.fetchQuestions();
  }, [controller]);

  // Data fetching handlers
  const fetchQuestions = useCallback(async () => {
    return await controller.fetchQuestions();
  }, [controller]);

  const refresh = useCallback(async () => {
    return await controller.refresh();
  }, [controller]);

  // CRUD handlers
  const deleteQuestion = useCallback(async (questionId: string) => {
    return await controller.deleteQuestion(questionId);
  }, [controller]);

  const deleteSelectedQuestions = useCallback(async () => {
    return await controller.deleteSelectedQuestions();
  }, [controller]);

  // Filter handlers
  const setSearchTerm = useCallback((searchTerm: string) => {
    controller.setSearchTerm(searchTerm);
  }, [controller]);

  const setFilterPart = useCallback((filterPart: string) => {
    controller.setFilterPart(filterPart);
  }, [controller]);

  const setFilterDifficulty = useCallback((filterDifficulty: string) => {
    controller.setFilterDifficulty(filterDifficulty);
  }, [controller]);

  const setFilterStatus = useCallback((filterStatus: string) => {
    controller.setFilterStatus(filterStatus);
  }, [controller]);

  const setFilters = useCallback((filters: FilterOptions) => {
    controller.setFilters(filters);
  }, [controller]);

  const clearFilters = useCallback(() => {
    controller.clearFilters();
  }, [controller]);

  // Selection handlers
  const selectQuestion = useCallback((questionId: string, checked: boolean) => {
    controller.selectQuestion(questionId, checked);
  }, [controller]);

  const selectAllQuestions = useCallback((checked: boolean) => {
    controller.selectAllQuestions(checked);
  }, [controller]);

  const clearSelection = useCallback(() => {
    controller.clearSelection();
  }, [controller]);

  // Utility functions
  const getFilteredQuestions = useCallback(() => {
    return controller.getFilteredQuestions();
  }, [controller]);

  const getQuestionById = useCallback((questionId: string) => {
    return controller.getQuestionById(questionId);
  }, [controller]);

  const getQuestionsByPart = useCallback((part: number) => {
    return controller.getQuestionsByPart(part as any);
  }, [controller]);

  const getQuestionsByDifficulty = useCallback((difficulty: string) => {
    return controller.getQuestionsByDifficulty(difficulty as any);
  }, [controller]);

  const getQuestionsByStatus = useCallback((status: string) => {
    return controller.getQuestionsByStatus(status as any);
  }, [controller]);

  const getPartInfo = useCallback((part: number) => {
    return controller.getPartInfo(part as any);
  }, [controller]);

  const getQuestionAudioUrl = useCallback((question: Question) => {
    return controller.getQuestionAudioUrl(question);
  }, [controller]);

  const getAudioSourceDescription = useCallback((question: Question) => {
    return controller.getAudioSourceDescription(question);
  }, [controller]);

  const getStatistics = useCallback(() => {
    return controller.getStatistics();
  }, [controller]);

  const isQuestionSelected = useCallback((questionId: string) => {
    return controller.isQuestionSelected(questionId);
  }, [controller]);

  const areAllFilteredQuestionsSelected = useCallback(() => {
    return controller.areAllFilteredQuestionsSelected();
  }, [controller]);

  const getSelectedQuestions = useCallback(() => {
    return controller.getSelectedQuestions();
  }, [controller]);

  // State management handlers
  const reset = useCallback(() => {
    controller.reset();
  }, [controller]);

  const updateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    controller.updateQuestion(questionId, updates);
  }, [controller]);

  const addQuestion = useCallback((question: Question) => {
    controller.addQuestion(question);
  }, [controller]);

  const removeQuestion = useCallback((questionId: string) => {
    controller.removeQuestion(questionId);
  }, [controller]);

  // Utility functions for UI
  const getToeicPartInfo = useCallback(() => {
    return controller.getToeicPartInfo();
  }, [controller]);

  const getDifficultyColors = useCallback(() => {
    return controller.getDifficultyColors();
  }, [controller]);

  const getStatusColors = useCallback(() => {
    return controller.getStatusColors();
  }, [controller]);

  return {
    // State
    state,
    
    // Questions data
    questions: state.questions,
    loading: state.loading,
    deleting: state.deleting,
    errors: state.errors,

    // Filter state
    searchTerm: state.searchTerm,
    filterPart: state.filterPart,
    filterDifficulty: state.filterDifficulty,
    filterStatus: state.filterStatus,

    // Selection state
    selectedQuestions: state.selectedQuestions,

    // Data fetching handlers
    fetchQuestions,
    refresh,

    // CRUD handlers
    deleteQuestion,
    deleteSelectedQuestions,

    // Filter handlers
    setSearchTerm,
    setFilterPart,
    setFilterDifficulty,
    setFilterStatus,
    setFilters,
    clearFilters,

    // Selection handlers
    selectQuestion,
    selectAllQuestions,
    clearSelection,

    // Utility functions
    getFilteredQuestions,
    getQuestionById,
    getQuestionsByPart,
    getQuestionsByDifficulty,
    getQuestionsByStatus,
    getPartInfo,
    getQuestionAudioUrl,
    getAudioSourceDescription,
    getStatistics,
    isQuestionSelected,
    areAllFilteredQuestionsSelected,
    getSelectedQuestions,

    // State management handlers
    reset,
    updateQuestion,
    addQuestion,
    removeQuestion,

    // UI utility functions
    getToeicPartInfo,
    getDifficultyColors,
    getStatusColors,
  };
}
