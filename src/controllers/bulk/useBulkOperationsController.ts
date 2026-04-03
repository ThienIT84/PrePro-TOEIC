/**
 * useBulkOperationsController
 * React hook để integrate BulkOperationsController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { BulkOperationsController, BulkOperationsState, BulkQuestion, FileProcessingResult, ImportResult, ExportResult, QuestionValidationResult } from './BulkOperationsController';

export function useBulkOperationsController() {
  const [controller] = useState(() => new BulkOperationsController());
  const [state, setState] = useState<BulkOperationsState>(controller.getState());

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
  const setActiveTab = useCallback((activeTab: string) => {
    controller.setActiveTab(activeTab);
  }, [controller]);

  const setQuestions = useCallback((questions: BulkQuestion[]) => {
    controller.setQuestions(questions);
  }, [controller]);

  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setImporting = useCallback((importing: boolean) => {
    controller.setImporting(importing);
  }, [controller]);

  const setProgress = useCallback((progress: number) => {
    controller.setProgress(progress);
  }, [controller]);

  // Question operations
  const validateQuestion = useCallback((question: BulkQuestion) => {
    return controller.validateQuestion(question);
  }, [controller]);

  const fixQuestion = useCallback((index: number, field: keyof BulkQuestion, value: string) => {
    controller.fixQuestion(index, field, value);
  }, [controller]);

  const removeQuestion = useCallback((index: number) => {
    controller.removeQuestion(index);
  }, [controller]);

  // File operations
  const processExcelFile = useCallback(async (file: File): Promise<FileProcessingResult> => {
    return controller.processExcelFile(file);
  }, [controller]);

  const generateTemplate = useCallback(() => {
    controller.generateTemplate();
  }, [controller]);

  // Import/Export operations
  const importQuestions = useCallback(async (userId: string, batchSize: number = 10): Promise<ImportResult> => {
    return controller.importQuestions(userId, batchSize);
  }, [controller]);

  const exportQuestions = useCallback(async (): Promise<ExportResult> => {
    return controller.exportQuestions();
  }, [controller]);

  // Data getters
  const getQuestionCounts = useCallback(() => {
    return controller.getQuestionCounts();
  }, [controller]);

  const getValidQuestions = useCallback(() => {
    return controller.getValidQuestions();
  }, [controller]);

  const getInvalidQuestions = useCallback(() => {
    return controller.getInvalidQuestions();
  }, [controller]);

  const getImportedQuestions = useCallback(() => {
    return controller.getImportedQuestions();
  }, [controller]);

  // State checks
  const canImport = useCallback(() => {
    return controller.canImport();
  }, [controller]);

  const isImporting = useCallback(() => {
    return controller.isImporting();
  }, [controller]);

  const isLoading = useCallback(() => {
    return controller.isLoading();
  }, [controller]);

  const getProgress = useCallback(() => {
    return controller.getProgress();
  }, [controller]);

  const getActiveTab = useCallback(() => {
    return controller.getActiveTab();
  }, [controller]);

  const getQuestions = useCallback(() => {
    return controller.getQuestions();
  }, [controller]);

  // Utility functions
  const clearQuestions = useCallback(() => {
    controller.clearQuestions();
  }, [controller]);

  const resetState = useCallback(() => {
    controller.resetState();
  }, [controller]);

  return {
    // State
    state,
    
    // State properties
    activeTab: state.activeTab,
    questions: state.questions,
    loading: state.loading,
    importing: state.importing,
    progress: state.progress,

    // State management
    setActiveTab,
    setQuestions,
    setLoading,
    setImporting,
    setProgress,

    // Question operations
    validateQuestion,
    fixQuestion,
    removeQuestion,

    // File operations
    processExcelFile,
    generateTemplate,

    // Import/Export operations
    importQuestions,
    exportQuestions,

    // Data getters
    getQuestionCounts,
    getValidQuestions,
    getInvalidQuestions,
    getImportedQuestions,

    // State checks
    canImport,
    isImporting,
    isLoading,
    getProgress,
    getActiveTab,
    getQuestions,

    // Utility functions
    clearQuestions,
    resetState,
  };
}
