/**
 * useExamSetCreatorController
 * React hook để integrate ExamSetCreatorController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { ExamSetCreatorController, ExamSetCreatorState, ExamTemplate } from './ExamSetCreatorController';

export function useExamSetCreatorController() {
  const [controller] = useState(() => new ExamSetCreatorController());
  const [state, setState] = useState<ExamSetCreatorState>(controller.getState());

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // Initialize data on mount
  useEffect(() => {
    controller.loadQuestionBank();
  }, [controller]);

  // Data loading handlers
  const loadQuestionBank = useCallback(async () => {
    return await controller.loadQuestionBank();
  }, [controller]);

  // Template handlers
  const loadTemplate = useCallback((template: ExamTemplate) => {
    controller.loadTemplate(template);
  }, [controller]);

  // Form handlers
  const updateFormData = useCallback((updates: Partial<ExamSetCreatorState['formData']>) => {
    controller.updateFormData(updates);
  }, [controller]);

  const setActiveTab = useCallback((tab: string) => {
    controller.setActiveTab(tab);
  }, [controller]);

  // Exam parts handlers
  const updatePartConfig = useCallback((partNumber: number, field: keyof any, value: any) => {
    controller.updatePartConfig(partNumber, field, value);
  }, [controller]);

  const addQuestionsToPart = useCallback((partNumber: number, questionIds: string[]) => {
    controller.addQuestionsToPart(partNumber, questionIds);
  }, [controller]);

  const removeQuestionFromPart = useCallback((partNumber: number, questionId: string) => {
    controller.removeQuestionFromPart(partNumber, questionId);
  }, [controller]);

  // Auto-assignment handlers
  const autoAssignQuestions = useCallback(async () => {
    return await controller.autoAssignQuestions();
  }, [controller]);

  // Validation handlers
  const validateExam = useCallback(() => {
    return controller.validateExam();
  }, [controller]);

  // Exam creation handlers
  const createExamSet = useCallback(async (userId: string) => {
    return await controller.createExamSet(userId);
  }, [controller]);

  // Filter handlers
  const setSearchTerm = useCallback((searchTerm: string) => {
    controller.setSearchTerm(searchTerm);
  }, [controller]);

  const setFilterType = useCallback((filterType: string) => {
    controller.setFilterType(filterType);
  }, [controller]);

  const setFilterDifficulty = useCallback((filterDifficulty: string) => {
    controller.setFilterDifficulty(filterDifficulty);
  }, [controller]);

  const setSelectedQuestions = useCallback((selectedQuestions: string[]) => {
    controller.setSelectedQuestions(selectedQuestions);
  }, [controller]);

  // Utility functions
  const getFilteredQuestions = useCallback(() => {
    return controller.getFilteredQuestions();
  }, [controller]);

  const getStatistics = useCallback(() => {
    return controller.getStatistics();
  }, [controller]);

  // State management handlers
  const reset = useCallback(() => {
    controller.reset();
  }, [controller]);

  return {
    // State
    state,
    
    // Form data
    formData: state.formData,
    activeTab: state.activeTab,
    loading: state.loading,
    saving: state.saving,
    errors: state.errors,

    // Exam parts
    examParts: state.examParts,

    // Question bank
    questionBank: state.questionBank,
    selectedQuestions: state.selectedQuestions,
    searchTerm: state.searchTerm,
    filterType: state.filterType,
    filterDifficulty: state.filterDifficulty,

    // Templates
    templates: state.templates,

    // Data loading handlers
    loadQuestionBank,

    // Template handlers
    loadTemplate,

    // Form handlers
    updateFormData,
    setActiveTab,

    // Exam parts handlers
    updatePartConfig,
    addQuestionsToPart,
    removeQuestionFromPart,

    // Auto-assignment handlers
    autoAssignQuestions,

    // Validation handlers
    validateExam,

    // Exam creation handlers
    createExamSet,

    // Filter handlers
    setSearchTerm,
    setFilterType,
    setFilterDifficulty,
    setSelectedQuestions,

    // Utility functions
    getFilteredQuestions,
    getStatistics,

    // State management handlers
    reset,
  };
}
