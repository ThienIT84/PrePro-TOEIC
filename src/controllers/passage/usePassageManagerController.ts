/**
 * usePassageManagerController
 * React hook để integrate PassageManagerController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { PassageManagerController, PassageManagerState, PassageFormData, Passage } from './PassageManagerController';

export function usePassageManagerController() {
  const [controller] = useState(() => new PassageManagerController());
  const [state, setState] = useState<PassageManagerState>(controller.getState());

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // State getters
  const getPassages = useCallback(() => {
    return state.passages;
  }, [state.passages]);

  const getFilteredPassages = useCallback(() => {
    return controller.getFilteredPassages();
  }, [controller, state.passages, state.searchTerm, state.filterPart]);

  const getStatistics = useCallback(() => {
    return controller.getStatistics();
  }, [controller, state.passages, state.searchTerm, state.filterPart, state.selectedPassages]);

  // Search and filter handlers
  const setSearchTerm = useCallback((searchTerm: string) => {
    controller.setSearchTerm(searchTerm);
  }, [controller]);

  const setFilterPart = useCallback((filterPart: string) => {
    controller.setFilterPart(filterPart);
  }, [controller]);

  // Tab navigation handlers
  const setActiveTab = useCallback((activeTab: string) => {
    controller.setActiveTab(activeTab);
  }, [controller]);

  // Form handlers
  const updateFormData = useCallback((field: string, value: any) => {
    controller.updateFormData(field, value);
  }, [controller]);

  const resetFormData = useCallback(() => {
    controller.resetFormData();
  }, [controller]);

  const handleContentChange = useCallback((content: string) => {
    controller.handleContentChange(content);
  }, [controller]);

  // Selection handlers
  const toggleSelectAll = useCallback(() => {
    controller.toggleSelectAll();
  }, [controller]);

  const toggleSelectPassage = useCallback((passageId: string) => {
    controller.toggleSelectPassage(passageId);
  }, [controller]);

  const clearSelection = useCallback(() => {
    controller.clearSelection();
  }, [controller]);

  // Passage management handlers
  const editPassage = useCallback((passage: Passage) => {
    controller.editPassage(passage);
  }, [controller]);

  const setEditingPassage = useCallback((passage: Passage | null) => {
    controller.setEditingPassage(passage);
  }, [controller]);

  // Loading state handlers
  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setSaving = useCallback((saving: boolean) => {
    controller.setSaving(saving);
  }, [controller]);

  const setImporting = useCallback((importing: boolean) => {
    controller.setImporting(importing);
  }, [controller]);

  const setImportProgress = useCallback((progress: number) => {
    controller.setImportProgress(progress);
  }, [controller]);

  const setDeleting = useCallback((deleting: boolean) => {
    controller.setDeleting(deleting);
  }, [controller]);

  // Utility functions
  const getPartName = useCallback((part: number) => {
    return controller.getPartName(part);
  }, [controller]);

  const getPartColor = useCallback((part: number) => {
    return controller.getPartColor(part);
  }, [controller]);

  const calculateWordCount = useCallback((text: string) => {
    return controller.calculateWordCount(text);
  }, [controller]);

  const calculateReadingTime = useCallback((wordCount: number) => {
    return controller.calculateReadingTime(wordCount);
  }, [controller]);

  const getTemplateData = useCallback(() => {
    return controller.getTemplateData();
  }, [controller]);

  const validatePassageData = useCallback((data: any) => {
    return controller.validatePassageData(data);
  }, [controller]);

  const processImportedData = useCallback((jsonData: any[]) => {
    return controller.processImportedData(jsonData);
  }, [controller]);

  // State management handlers
  const reset = useCallback(() => {
    controller.reset();
  }, [controller]);

  return {
    // State
    state,
    
    // Passages data
    passages: state.passages,
    loading: state.loading,
    searchTerm: state.searchTerm,
    filterPart: state.filterPart,
    activeTab: state.activeTab,
    editingPassage: state.editingPassage,
    saving: state.saving,
    importing: state.importing,
    importProgress: state.importProgress,
    selectedPassages: state.selectedPassages,
    deleting: state.deleting,
    formData: state.formData,

    // Data getters
    getPassages,
    getFilteredPassages,
    getStatistics,

    // Search and filter handlers
    setSearchTerm,
    setFilterPart,

    // Tab navigation handlers
    setActiveTab,

    // Form handlers
    updateFormData,
    resetFormData,
    handleContentChange,

    // Selection handlers
    toggleSelectAll,
    toggleSelectPassage,
    clearSelection,

    // Passage management handlers
    editPassage,
    setEditingPassage,

    // Loading state handlers
    setLoading,
    setSaving,
    setImporting,
    setImportProgress,
    setDeleting,

    // Utility functions
    getPartName,
    getPartColor,
    calculateWordCount,
    calculateReadingTime,
    getTemplateData,
    validatePassageData,
    processImportedData,

    // State management handlers
    reset,
  };
}
