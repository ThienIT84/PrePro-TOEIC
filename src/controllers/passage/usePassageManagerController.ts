import { useState, useCallback, useEffect } from 'react';
import { PassageManagerController, Passage, PassageFormData, PassageFilters } from './PassageManagerController';

export const usePassageManagerController = () => {
  const [controller] = useState(() => new PassageManagerController());
  const [state, setState] = useState(controller.getState());

  // State Management
  const updateState = useCallback(() => {
    setState(controller.getState());
  }, [controller]);

  // Passage Management
  const handleLoadPassages = useCallback(async () => {
    try {
      await controller.loadPassages();
      updateState();
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  const handleCreatePassage = useCallback(async (data: PassageFormData) => {
    try {
      await controller.createPassage(data);
      updateState();
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  const handleUpdatePassage = useCallback(async (id: string, data: Partial<PassageFormData>) => {
    try {
      await controller.updatePassage(id, data);
      updateState();
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  const handleDeletePassage = useCallback(async (id: string) => {
    try {
      await controller.deletePassage(id);
      updateState();
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  const handleDeleteSelectedPassages = useCallback(async () => {
    try {
      await controller.deleteSelectedPassages();
      updateState();
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  // Selection Management
  const handleToggleSelection = useCallback((id: string) => {
    controller.togglePassageSelection(id);
    updateState();
  }, [controller, updateState]);

  const handleSelectAll = useCallback(() => {
    controller.selectAllPassages();
    updateState();
  }, [controller, updateState]);

  const handleClearSelection = useCallback(() => {
    controller.clearSelection();
    updateState();
  }, [controller, updateState]);

  // Form Management
  const handleSetEditingPassage = useCallback((passage: Passage | null) => {
    controller.setEditingPassage(passage);
    updateState();
  }, [controller, updateState]);

  const handleSetFormData = useCallback((data: Partial<PassageFormData>) => {
    controller.setFormData(data);
    updateState();
  }, [controller, updateState]);

  // Filtering
  const handleApplyFilters = useCallback((filters: PassageFilters) => {
    controller.applyFilters(filters);
    updateState();
  }, [controller, updateState]);

  // File Upload
  const handleUploadAudio = useCallback(async (file: File) => {
    try {
      await controller.uploadAudio(file);
      updateState();
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  const handleUploadImage = useCallback(async (file: File) => {
    try {
      await controller.uploadImage(file);
      updateState();
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  // Import/Export
  const handleImportFromExcel = useCallback(async (file: File) => {
    try {
      await controller.importFromExcel(file);
      updateState();
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  const handleExportToExcel = useCallback(() => {
    controller.exportToExcel();
  }, [controller]);

  // Tab Management
  const handleSetActiveTab = useCallback((tab: 'list' | 'create' | 'edit' | 'import') => {
    controller.setActiveTab(tab);
    updateState();
  }, [controller, updateState]);

  // Error Management
  const handleClearError = useCallback(() => {
    controller.clearError();
    updateState();
  }, [controller, updateState]);

  // Auto-load passages on mount
  useEffect(() => {
    handleLoadPassages();
  }, [handleLoadPassages]);

  return {
    // State
    ...state,
    
    // Actions
    handleLoadPassages,
    handleCreatePassage,
    handleUpdatePassage,
    handleDeletePassage,
    handleDeleteSelectedPassages,
    handleToggleSelection,
    handleSelectAll,
    handleClearSelection,
    handleSetEditingPassage,
    handleSetFormData,
    handleApplyFilters,
    handleUploadAudio,
    handleUploadImage,
    handleImportFromExcel,
    handleExportToExcel,
    handleSetActiveTab,
    handleClearError,
    
    // Controller Methods
    getPartInfo: controller.getPartInfo.bind(controller),
    calculateWordCount: controller.calculateWordCount.bind(controller),
    calculateReadingTime: controller.calculateReadingTime.bind(controller)
  };
};