import { useState, useCallback } from 'react';
import { TOEICBulkUploadController, TOEICQuestion, TOEICPassage, ImportResult } from './TOEICBulkUploadController';

export const useTOEICBulkUploadController = () => {
  const [controller] = useState(() => new TOEICBulkUploadController());
  const [state, setState] = useState(controller.getState());

  // State Management
  const updateState = useCallback(() => {
    setState(controller.getState());
  }, [controller]);

  // File Processing
  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const result = await controller.processExcelFile(file);
      updateState();
      return result;
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  // Import Questions
  const handleImportQuestions = useCallback(async (questions: TOEICQuestion[]) => {
    try {
      const result = await controller.importQuestions(questions);
      updateState();
      return result;
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  // Import Passages
  const handleImportPassages = useCallback(async (passages: TOEICPassage[]) => {
    try {
      const result = await controller.importPassages(passages);
      updateState();
      return result;
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  // Download Template
  const handleDownloadTemplate = useCallback(() => {
    controller.generateTemplate();
  }, [controller]);

  // Reset
  const handleReset = useCallback(() => {
    controller.resetState();
    updateState();
  }, [controller, updateState]);

  // Clear Error
  const clearError = useCallback(() => {
    controller.clearError();
    updateState();
  }, [controller, updateState]);

  return {
    // State
    ...state,
    
    // Actions
    handleFileSelect,
    handleImportQuestions,
    handleImportPassages,
    handleDownloadTemplate,
    handleReset,
    clearError,
    
    // Controller Methods
    getPartInfo: controller.getPartInfo.bind(controller)
  };
};
