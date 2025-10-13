/**
 * useExamManagementDashboardController
 * React hook để integrate ExamManagementDashboardController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  ExamManagementDashboardController, 
  ExamManagementDashboardState, 
  ExamSet, 
  ExamStatistics 
} from './ExamManagementDashboardController';

export function useExamManagementDashboardController() {
  const [controller] = useState(() => new ExamManagementDashboardController());
  const [state, setState] = useState<ExamManagementDashboardState>(controller.getState());

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

  const setExamSets = useCallback((examSets: ExamSet[]) => {
    controller.setExamSets(examSets);
  }, [controller]);

  const setStatistics = useCallback((statistics: ExamStatistics) => {
    controller.setStatistics(statistics);
  }, [controller]);

  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setSearchTerm = useCallback((searchTerm: string) => {
    controller.setSearchTerm(searchTerm);
  }, [controller]);

  const setFilterStatus = useCallback((filterStatus: string) => {
    controller.setFilterStatus(filterStatus);
  }, [controller]);

  const setFilterType = useCallback((filterType: string) => {
    controller.setFilterType(filterType);
  }, [controller]);

  // Data operations
  const fetchExamSets = useCallback(async () => {
    return controller.fetchExamSets();
  }, [controller]);

  const fetchStatistics = useCallback(async () => {
    return controller.fetchStatistics();
  }, [controller]);

  const deleteExamSet = useCallback(async (id: string) => {
    return controller.deleteExamSet(id);
  }, [controller]);

  const toggleExamStatus = useCallback(async (id: string, currentStatus: boolean) => {
    return controller.toggleExamStatus(id, currentStatus);
  }, [controller]);

  // Utility functions
  const getFilteredExamSets = useCallback(() => {
    return controller.getFilteredExamSets();
  }, [controller]);

  const getStatusColor = useCallback((isActive: boolean) => {
    return controller.getStatusColor(isActive);
  }, [controller]);

  const getTypeIconName = useCallback((type: string) => {
    return controller.getTypeIconName(type);
  }, [controller]);

  const clearFilters = useCallback(() => {
    controller.clearFilters();
  }, [controller]);

  const getRecentExamSets = useCallback((limit?: number) => {
    return controller.getRecentExamSets(limit);
  }, [controller]);

  const getExamSetById = useCallback((id: string) => {
    return controller.getExamSetById(id);
  }, [controller]);

  const getExamSetsByStatus = useCallback((isActive: boolean) => {
    return controller.getExamSetsByStatus(isActive);
  }, [controller]);

  const getExamSetsByType = useCallback((type: string) => {
    return controller.getExamSetsByType(type);
  }, [controller]);

  const getExamSetStatisticsSummary = useCallback(() => {
    return controller.getExamSetStatisticsSummary();
  }, [controller]);

  const getPerformanceMetrics = useCallback(() => {
    return controller.getPerformanceMetrics();
  }, [controller]);

  // State getters
  const isLoading = useCallback(() => {
    return controller.isLoading();
  }, [controller]);

  const getActiveTab = useCallback(() => {
    return controller.getActiveTab();
  }, [controller]);

  const getExamSets = useCallback(() => {
    return controller.getExamSets();
  }, [controller]);

  const getStatistics = useCallback(() => {
    return controller.getStatistics();
  }, [controller]);

  const getSearchTerm = useCallback(() => {
    return controller.getSearchTerm();
  }, [controller]);

  const getFilterStatus = useCallback(() => {
    return controller.getFilterStatus();
  }, [controller]);

  const getFilterType = useCallback(() => {
    return controller.getFilterType();
  }, [controller]);

  const resetState = useCallback(() => {
    controller.resetState();
  }, [controller]);

  return {
    // State
    state,
    
    // State properties
    activeTab: state.activeTab,
    examSets: state.examSets,
    statistics: state.statistics,
    loading: state.loading,
    searchTerm: state.searchTerm,
    filterStatus: state.filterStatus,
    filterType: state.filterType,

    // State management
    setActiveTab,
    setExamSets,
    setStatistics,
    setLoading,
    setSearchTerm,
    setFilterStatus,
    setFilterType,

    // Data operations
    fetchExamSets,
    fetchStatistics,
    deleteExamSet,
    toggleExamStatus,

    // Utility functions
    getFilteredExamSets,
    getStatusColor,
    getTypeIconName,
    clearFilters,
    getRecentExamSets,
    getExamSetById,
    getExamSetsByStatus,
    getExamSetsByType,
    getExamSetStatisticsSummary,
    getPerformanceMetrics,

    // State getters
    isLoading,
    getActiveTab,
    getExamSets,
    getStatistics,
    getSearchTerm,
    getFilterStatus,
    getFilterType,
    resetState,
  };
}
