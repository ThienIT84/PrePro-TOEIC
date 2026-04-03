/**
 * useExamQuestionManagementController
 * React hook để integrate ExamQuestionManagementController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  ExamQuestionManagementController, 
  ExamQuestionManagementState, 
  ExamSet, 
  ExamQuestion, 
  Question,
  AddQuestionToExamParams,
  RemoveQuestionFromExamParams,
  UpdateQuestionOrderParams,
  UpdateExamSetQuestionCountParams
} from './ExamQuestionManagementController';

export function useExamQuestionManagementController() {
  const [controller] = useState(() => new ExamQuestionManagementController());
  const [state, setState] = useState<ExamQuestionManagementState>(controller.getState());

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
  const setExamSet = useCallback((examSet: ExamSet | null) => {
    controller.setExamSet(examSet);
  }, [controller]);

  const setExamQuestions = useCallback((examQuestions: ExamQuestion[]) => {
    controller.setExamQuestions(examQuestions);
  }, [controller]);

  const setAllQuestions = useCallback((allQuestions: Question[]) => {
    controller.setAllQuestions(allQuestions);
  }, [controller]);

  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setAddDialogOpen = useCallback((isOpen: boolean) => {
    controller.setAddDialogOpen(isOpen);
  }, [controller]);

  const setExcelDialogOpen = useCallback((isOpen: boolean) => {
    controller.setExcelDialogOpen(isOpen);
  }, [controller]);

  const setSearchTerm = useCallback((searchTerm: string) => {
    controller.setSearchTerm(searchTerm);
  }, [controller]);

  const setSelectedType = useCallback((selectedType: string) => {
    controller.setSelectedType(selectedType);
  }, [controller]);

  const setEditingQuestion = useCallback((question: Question | null) => {
    controller.setEditingQuestion(question);
  }, [controller]);

  const setViewingQuestion = useCallback((question: Question | null) => {
    controller.setViewingQuestion(question);
  }, [controller]);

  // Data operations
  const fetchExamSet = useCallback(async (examSetId: string) => {
    return controller.fetchExamSet(examSetId);
  }, [controller]);

  const fetchExamQuestions = useCallback(async (examSetId: string) => {
    return controller.fetchExamQuestions(examSetId);
  }, [controller]);

  const fetchAllQuestions = useCallback(async () => {
    return controller.fetchAllQuestions();
  }, [controller]);

  const addQuestionToExam = useCallback(async (params: AddQuestionToExamParams) => {
    return controller.addQuestionToExam(params);
  }, [controller]);

  const removeQuestionFromExam = useCallback(async (params: RemoveQuestionFromExamParams) => {
    return controller.removeQuestionFromExam(params);
  }, [controller]);

  const updateQuestionOrder = useCallback(async (params: UpdateQuestionOrderParams) => {
    return controller.updateQuestionOrder(params);
  }, [controller]);

  const updateExamSetQuestionCount = useCallback(async (params: UpdateExamSetQuestionCountParams) => {
    return controller.updateExamSetQuestionCount(params);
  }, [controller]);

  // Utility functions
  const getFilteredQuestions = useCallback(() => {
    return controller.getFilteredQuestions();
  }, [controller]);

  const getTypeLabel = useCallback((type: string) => {
    return controller.getTypeLabel(type);
  }, [controller]);

  const getDifficultyLabel = useCallback((difficulty: string) => {
    return controller.getDifficultyLabel(difficulty);
  }, [controller]);

  const getQuestionPreview = useCallback((question: Question) => {
    return controller.getQuestionPreview(question);
  }, [controller]);

  const isQuestionCountSynced = useCallback(() => {
    return controller.isQuestionCountSynced();
  }, [controller]);

  const getQuestionCountDifference = useCallback(() => {
    return controller.getQuestionCountDifference();
  }, [controller]);

  const getExamSetStatistics = useCallback(() => {
    return controller.getExamSetStatistics();
  }, [controller]);

  const getQuestionsByType = useCallback((type: string) => {
    return controller.getQuestionsByType(type);
  }, [controller]);

  const getQuestionsByDifficulty = useCallback((difficulty: string) => {
    return controller.getQuestionsByDifficulty(difficulty);
  }, [controller]);

  const getAvailableQuestionTypes = useCallback(() => {
    return controller.getAvailableQuestionTypes();
  }, [controller]);

  const getAvailableDifficulties = useCallback(() => {
    return controller.getAvailableDifficulties();
  }, [controller]);

  // State getters
  const isLoading = useCallback(() => {
    return controller.isLoading();
  }, [controller]);

  const isAddDialogOpen = useCallback(() => {
    return controller.isAddDialogOpen();
  }, [controller]);

  const isExcelDialogOpen = useCallback(() => {
    return controller.isExcelDialogOpen();
  }, [controller]);

  const getExamSet = useCallback(() => {
    return controller.getExamSet();
  }, [controller]);

  const getExamQuestions = useCallback(() => {
    return controller.getExamQuestions();
  }, [controller]);

  const getAllQuestions = useCallback(() => {
    return controller.getAllQuestions();
  }, [controller]);

  const getSearchTerm = useCallback(() => {
    return controller.getSearchTerm();
  }, [controller]);

  const getSelectedType = useCallback(() => {
    return controller.getSelectedType();
  }, [controller]);

  const getEditingQuestion = useCallback(() => {
    return controller.getEditingQuestion();
  }, [controller]);

  const getViewingQuestion = useCallback(() => {
    return controller.getViewingQuestion();
  }, [controller]);

  const resetState = useCallback(() => {
    controller.resetState();
  }, [controller]);

  return {
    // State
    state,
    
    // State properties
    examSet: state.examSet,
    examQuestions: state.examQuestions,
    allQuestions: state.allQuestions,
    loading: state.loading,
    isAddDialogOpen: state.isAddDialogOpen,
    isExcelDialogOpen: state.isExcelDialogOpen,
    searchTerm: state.searchTerm,
    selectedType: state.selectedType,
    editingQuestion: state.editingQuestion,
    viewingQuestion: state.viewingQuestion,

    // State management
    setExamSet,
    setExamQuestions,
    setAllQuestions,
    setLoading,
    setAddDialogOpen,
    setExcelDialogOpen,
    setSearchTerm,
    setSelectedType,
    setEditingQuestion,
    setViewingQuestion,

    // Data operations
    fetchExamSet,
    fetchExamQuestions,
    fetchAllQuestions,
    addQuestionToExam,
    removeQuestionFromExam,
    updateQuestionOrder,
    updateExamSetQuestionCount,

    // Utility functions
    getFilteredQuestions,
    getTypeLabel,
    getDifficultyLabel,
    getQuestionPreview,
    isQuestionCountSynced,
    getQuestionCountDifference,
    getExamSetStatistics,
    getQuestionsByType,
    getQuestionsByDifficulty,
    getAvailableQuestionTypes,
    getAvailableDifficulties,

    // State getters
    isLoading,
    isAddDialogOpenGetter: isAddDialogOpen,
    isExcelDialogOpenGetter: isExcelDialogOpen,
    getExamSet,
    getExamQuestions,
    getAllQuestions,
    getSearchTerm,
    getSelectedType,
    getEditingQuestion,
    getViewingQuestion,
    resetState,
  };
}
