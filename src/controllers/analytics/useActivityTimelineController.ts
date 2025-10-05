/**
 * useActivityTimelineController
 * React hook để integrate ActivityTimelineController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  ActivityTimelineController, 
  ActivityTimelineState, 
  ActivityEvent, 
  ActivityFilter,
  FetchActivitiesParams
} from './ActivityTimelineController';

export function useActivityTimelineController() {
  const [controller] = useState(() => new ActivityTimelineController());
  const [state, setState] = useState<ActivityTimelineState>(controller.getState());

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
  const setActivities = useCallback((activities: ActivityEvent[]) => {
    controller.setActivities(activities);
  }, [controller]);

  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setFilter = useCallback((filter: Partial<ActivityFilter>) => {
    controller.setFilter(filter);
  }, [controller]);

  const setSearchTerm = useCallback((searchTerm: string) => {
    controller.setSearchTerm(searchTerm);
  }, [controller]);

  const setAutoRefresh = useCallback((autoRefresh: boolean) => {
    controller.setAutoRefresh(autoRefresh);
  }, [controller]);

  const setLastRefresh = useCallback((lastRefresh: Date) => {
    controller.setLastRefresh(lastRefresh);
  }, [controller]);

  // Data operations
  const fetchActivities = useCallback(async (params: FetchActivitiesParams) => {
    return controller.fetchActivities(params);
  }, [controller]);

  // Utility functions
  const getActivityIcon = useCallback((type: string) => {
    return controller.getActivityIcon(type);
  }, [controller]);

  const getActivityColor = useCallback((type: string) => {
    return controller.getActivityColor(type);
  }, [controller]);

  const getScoreBadgeVariant = useCallback((score: number) => {
    return controller.getScoreBadgeVariant(score);
  }, [controller]);

  const formatTimestamp = useCallback((timestamp: string) => {
    return controller.formatTimestamp(timestamp);
  }, [controller]);

  const getTrendIndicator = useCallback((score: number) => {
    return controller.getTrendIndicator(score);
  }, [controller]);

  const getActivityTypeDisplayText = useCallback((type: string) => {
    return controller.getActivityTypeDisplayText(type);
  }, [controller]);

  const getTimeRangeDisplayText = useCallback((timeRange: string) => {
    return controller.getTimeRangeDisplayText(timeRange);
  }, [controller]);

  const getActivityStatistics = useCallback(() => {
    return controller.getActivityStatistics();
  }, [controller]);

  const getActivitiesByType = useCallback((type: string) => {
    return controller.getActivitiesByType(type);
  }, [controller]);

  const getActivitiesByStudent = useCallback((studentId: string) => {
    return controller.getActivitiesByStudent(studentId);
  }, [controller]);

  const getRecentActivities = useCallback((limit?: number) => {
    return controller.getRecentActivities(limit);
  }, [controller]);

  const getTopPerformingActivities = useCallback((limit?: number) => {
    return controller.getTopPerformingActivities(limit);
  }, [controller]);

  // State getters
  const isLoading = useCallback(() => {
    return controller.isLoading();
  }, [controller]);

  const isAutoRefreshEnabled = useCallback(() => {
    return controller.isAutoRefreshEnabled();
  }, [controller]);

  const getLastRefresh = useCallback(() => {
    return controller.getLastRefresh();
  }, [controller]);

  const getActivities = useCallback(() => {
    return controller.getActivities();
  }, [controller]);

  const getFilter = useCallback(() => {
    return controller.getFilter();
  }, [controller]);

  const getSearchTerm = useCallback(() => {
    return controller.getSearchTerm();
  }, [controller]);

  const resetState = useCallback(() => {
    controller.resetState();
  }, [controller]);

  return {
    // State
    state,
    
    // State properties
    activities: state.activities,
    loading: state.loading,
    filter: state.filter,
    searchTerm: state.searchTerm,
    autoRefresh: state.autoRefresh,
    lastRefresh: state.lastRefresh,

    // State management
    setActivities,
    setLoading,
    setFilter,
    setSearchTerm,
    setAutoRefresh,
    setLastRefresh,

    // Data operations
    fetchActivities,

    // Utility functions
    getActivityIcon,
    getActivityColor,
    getScoreBadgeVariant,
    formatTimestamp,
    getTrendIndicator,
    getActivityTypeDisplayText,
    getTimeRangeDisplayText,
    getActivityStatistics,
    getActivitiesByType,
    getActivitiesByStudent,
    getRecentActivities,
    getTopPerformingActivities,

    // State getters
    isLoading,
    isAutoRefreshEnabled,
    getLastRefresh,
    getActivities,
    getFilter,
    getSearchTerm,
    resetState,
  };
}
