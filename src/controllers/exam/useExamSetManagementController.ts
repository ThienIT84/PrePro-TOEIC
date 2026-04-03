/**
 * useExamSetManagementController
 * React hook để integrate ExamSetManagementController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  ExamSetManagementController, 
  ExamSetManagementState, 
  ExamSet, 
  ExamSetFormData,
  CreateExamSetParams,
  UpdateExamSetParams
} from './ExamSetManagementController';

export function useExamSetManagementController() {
  const [controller] = useState(() => new ExamSetManagementController());
  const [state, setState] = useState<ExamSetManagementState>(controller.getState());

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
  const setExamSets = useCallback((examSets: ExamSet[]) => {
    controller.setExamSets(examSets);
  }, [controller]);

  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setCreateDialogOpen = useCallback((isOpen: boolean) => {
    controller.setCreateDialogOpen(isOpen);
  }, [controller]);

  const setEditDialogOpen = useCallback((isOpen: boolean) => {
    controller.setEditDialogOpen(isOpen);
  }, [controller]);

  const setEditingExamSet = useCallback((examSet: ExamSet | null) => {
    controller.setEditingExamSet(examSet);
  }, [controller]);

  const setFormData = useCallback((formData: Partial<ExamSetFormData>) => {
    controller.setFormData(formData);
  }, [controller]);

  const resetFormData = useCallback(() => {
    controller.resetFormData();
  }, [controller]);

  // Data operations
  const fetchExamSets = useCallback(async () => {
    return controller.fetchExamSets();
  }, [controller]);

  const createExamSet = useCallback(async (params: CreateExamSetParams) => {
    return controller.createExamSet(params);
  }, [controller]);

  const updateExamSet = useCallback(async (params: UpdateExamSetParams) => {
    return controller.updateExamSet(params);
  }, [controller]);

  const deleteExamSet = useCallback(async (examSetId: string) => {
    return controller.deleteExamSet(examSetId);
  }, [controller]);

  // Dialog management
  const openCreateDialog = useCallback(() => {
    controller.openCreateDialog();
  }, [controller]);

  const closeCreateDialog = useCallback(() => {
    controller.closeCreateDialog();
  }, [controller]);

  const openEditDialog = useCallback((examSet: ExamSet) => {
    controller.openEditDialog(examSet);
  }, [controller]);

  const closeEditDialog = useCallback(() => {
    controller.closeEditDialog();
  }, [controller]);

  // Utility functions
  const getDifficultyColor = useCallback((difficulty: string) => {
    return controller.getDifficultyColor(difficulty);
  }, [controller]);

  const getStatusColor = useCallback((isActive: boolean) => {
    return controller.getStatusColor(isActive);
  }, [controller]);

  const getDifficultyDisplayText = useCallback((difficulty: string) => {
    return controller.getDifficultyDisplayText(difficulty);
  }, [controller]);

  const getStatusDisplayText = useCallback((isActive: boolean) => {
    return controller.getStatusDisplayText(isActive);
  }, [controller]);

  const validateFormData = useCallback(() => {
    return controller.validateFormData();
  }, [controller]);

  const getExamSetById = useCallback((id: string) => {
    return controller.getExamSetById(id);
  }, [controller]);

  const getExamSetsByStatus = useCallback((isActive: boolean) => {
    return controller.getExamSetsByStatus(isActive);
  }, [controller]);

  const getExamSetsByDifficulty = useCallback((difficulty: string) => {
    return controller.getExamSetsByDifficulty(difficulty);
  }, [controller]);

  const getExamSetStatistics = useCallback(() => {
    return controller.getExamSetStatistics();
  }, [controller]);

  // State getters
  const isLoading = useCallback(() => {
    return controller.isLoading();
  }, [controller]);

  const isCreateDialogOpen = useCallback(() => {
    return controller.isCreateDialogOpen();
  }, [controller]);

  const isEditDialogOpen = useCallback(() => {
    return controller.isEditDialogOpen();
  }, [controller]);

  const getEditingExamSet = useCallback(() => {
    return controller.getEditingExamSet();
  }, [controller]);

  const getFormData = useCallback(() => {
    return controller.getFormData();
  }, [controller]);

  const getExamSets = useCallback(() => {
    return controller.getExamSets();
  }, [controller]);

  const resetState = useCallback(() => {
    controller.resetState();
  }, [controller]);

  return {
    // State
    state,
    
    // State properties
    examSets: state.examSets,
    loading: state.loading,
    isCreateDialogOpen: state.isCreateDialogOpen,
    isEditDialogOpen: state.isEditDialogOpen,
    editingExamSet: state.editingExamSet,
    formData: state.formData,

    // State management
    setExamSets,
    setLoading,
    setCreateDialogOpen,
    setEditDialogOpen,
    setEditingExamSet,
    setFormData,
    resetFormData,

    // Data operations
    fetchExamSets,
    createExamSet,
    updateExamSet,
    deleteExamSet,

    // Dialog management
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,

    // Utility functions
    getDifficultyColor,
    getStatusColor,
    getDifficultyDisplayText,
    getStatusDisplayText,
    validateFormData,
    getExamSetById,
    getExamSetsByStatus,
    getExamSetsByDifficulty,
    getExamSetStatistics,

    // State getters
    isLoading,
    getEditingExamSet,
    getFormData,
    getExamSets,
    resetState,
  };
}
