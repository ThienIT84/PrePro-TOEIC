/**
 * useBulkUploadController
 * React hook để integrate BulkUploadController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { BulkUploadController, BulkUploadState, TOEICQuestion } from './BulkUploadController';

export function useBulkUploadController() {
  const [controller] = useState(() => new BulkUploadController());
  const [state, setState] = useState<BulkUploadState>(controller.getState());

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // File processing handlers
  const processFile = useCallback(async (file: File) => {
    return await controller.processFile(file);
  }, [controller]);

  const downloadTemplate = useCallback(() => {
    controller.downloadTemplate();
  }, [controller]);

  // Import handlers
  const importQuestions = useCallback(async (userId: string) => {
    return await controller.importQuestions(userId);
  }, [controller]);

  // State management handlers
  const reset = useCallback(() => {
    controller.reset();
  }, [controller]);

  const clearQuestions = useCallback(() => {
    controller.clearQuestions();
  }, [controller]);

  const updateQuestionStatus = useCallback((index: number, status: 'pending' | 'valid' | 'invalid' | 'imported') => {
    controller.updateQuestionStatus(index, status);
  }, [controller]);

  // Utility functions
  const getStatistics = useCallback(() => {
    return controller.getStatistics();
  }, [controller]);

  const getPartIcon = useCallback((part: number) => {
    return controller.getPartIcon(part);
  }, [controller]);

  const getPartColor = useCallback((part: number) => {
    return controller.getPartColor(part);
  }, [controller]);

  const usesIndividualAudio = useCallback((part: number) => {
    return controller.usesIndividualAudio(part);
  }, [controller]);

  const usesPassageAudio = useCallback((part: number) => {
    return controller.usesPassageAudio(part);
  }, [controller]);

  const getToeicPartInfo = useCallback(() => {
    return controller.getToeicPartInfo();
  }, [controller]);

  const getQuestion = useCallback((index: number) => {
    return controller.getQuestion(index);
  }, [controller]);

  const getQuestionsByPart = useCallback((part: number) => {
    return controller.getQuestionsByPart(part);
  }, [controller]);

  const getQuestionsByStatus = useCallback((status: 'pending' | 'valid' | 'invalid' | 'imported') => {
    return controller.getQuestionsByStatus(status);
  }, [controller]);

  // Validation functions
  const validateQuestion = useCallback((question: TOEICQuestion) => {
    return controller.validateQuestion(question);
  }, [controller]);

  return {
    // State
    state,
    
    // Questions data
    questions: state.questions,
    passages: state.passages,
    loading: state.loading,
    importing: state.importing,
    progress: state.progress,
    errors: state.errors,

    // File processing handlers
    processFile,
    downloadTemplate,

    // Import handlers
    importQuestions,

    // State management handlers
    reset,
    clearQuestions,
    updateQuestionStatus,

    // Utility functions
    getStatistics,
    getPartIcon,
    getPartColor,
    usesIndividualAudio,
    usesPassageAudio,
    getToeicPartInfo,
    getQuestion,
    getQuestionsByPart,
    getQuestionsByStatus,

    // Validation functions
    validateQuestion,
  };
}
