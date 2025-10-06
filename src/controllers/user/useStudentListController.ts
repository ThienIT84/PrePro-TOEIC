/**
 * useStudentListController
 * React hook để integrate StudentListController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { StudentListController, StudentListState, FilterState, BulkAction } from './StudentListController';

export function useStudentListController() {
  const [controller] = useState(() => new StudentListController());
  const [state, setState] = useState<StudentListState>(controller.getState());

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // Initialize data on mount
  useEffect(() => {
    controller.loadStudents();
  }, [controller]);

  // Data loading handlers
  const loadStudents = useCallback(() => {
    controller.loadStudents();
  }, [controller]);

  // Filter handlers
  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    controller.updateFilters(updates);
  }, [controller]);

  const clearFilters = useCallback(() => {
    controller.clearFilters();
  }, [controller]);

  const toggleFilters = useCallback(() => {
    controller.toggleFilters();
  }, [controller]);

  // Selection handlers
  const handleSelectAll = useCallback(() => {
    controller.handleSelectAll();
  }, [controller]);

  const handleSelectStudent = useCallback((studentId: string) => {
    controller.handleSelectStudent(studentId);
  }, [controller]);

  // Bulk action handlers
  const getBulkActions = useCallback(() => {
    return controller.getBulkActions();
  }, [controller]);

  const setBulkMessage = useCallback((message: string) => {
    controller.setBulkMessage(message);
  }, [controller]);

  const sendBulkMessage = useCallback(() => {
    controller.sendBulkMessage();
  }, [controller]);

  const closeBulkActionDialog = useCallback(() => {
    controller.closeBulkActionDialog();
  }, [controller]);

  // Utility functions
  const getFilteredStudents = useCallback(() => {
    return controller.getFilteredStudents();
  }, [controller]);

  const getStatusIcon = useCallback((status: string) => {
    return controller.getStatusIcon(status);
  }, [controller]);

  const getStatusBadge = useCallback((status: string) => {
    return controller.getStatusBadge(status);
  }, [controller]);

  const getLevelBadge = useCallback((level: string) => {
    return controller.getLevelBadge(level);
  }, [controller]);

  const getActiveFiltersCount = useCallback(() => {
    return controller.getActiveFiltersCount();
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
    
    // Students data
    students: state.students,
    loading: state.loading,
    selectedStudents: state.selectedStudents,
    filters: state.filters,
    showFilters: state.showFilters,
    isBulkActionOpen: state.isBulkActionOpen,
    bulkMessage: state.bulkMessage,

    // Data loading handlers
    loadStudents,

    // Filter handlers
    updateFilters,
    clearFilters,
    toggleFilters,

    // Selection handlers
    handleSelectAll,
    handleSelectStudent,

    // Bulk action handlers
    getBulkActions,
    setBulkMessage,
    sendBulkMessage,
    closeBulkActionDialog,

    // Utility functions
    getFilteredStudents,
    getStatusIcon,
    getStatusBadge,
    getLevelBadge,
    getActiveFiltersCount,
    getStatistics,

    // State management handlers
    reset,
  };
}
