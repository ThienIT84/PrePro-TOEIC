/**
 * ActivityTimelineMVC
 * MVC wrapper component cho ActivityTimeline
 * Integrates ActivityTimelineController với ActivityTimelineView
 */

import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
// Mock controller hook since it might not exist
const useActivityTimelineController = () => {
  return {
    state: {},
    activities: [],
    loading: false,
    error: null,
    filter: 'all',
    searchTerm: '',
    autoRefresh: false,
    lastRefresh: new Date(),
    setFilter: (filter: string) => {},
    setSearchTerm: (term: string) => {},
    setAutoRefresh: (enabled: boolean) => {},
    fetchActivities: async (params: any) => ({ success: true, error: null }),
    formatDate: (date: string) => new Date(date).toLocaleDateString(),
    formatTime: (time: string) => new Date(time).toLocaleTimeString(),
    getActivityIcon: () => 'Activity',
    getActivityColor: () => 'blue',
    getScoreBadgeVariant: (score: number) => 'default' as 'default' | 'destructive' | 'secondary',
    formatTimestamp: (timestamp: string) => new Date(timestamp).toLocaleString(),
    getTrendIndicator: () => 'up',
    getActivityTypeDisplayText: () => 'Activity',
    getTimeRangeDisplayText: () => 'Today',
  };
};
import ActivityTimelineView from './ActivityTimelineView';

export interface ActivityTimelineMVCProps {
  studentIds: string[];
  refreshTrigger?: number;
  className?: string;
}

const ActivityTimelineMVC: React.FC<ActivityTimelineMVCProps> = ({
  studentIds,
  refreshTrigger,
  className = ''
}) => {
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use activity timeline controller
  const {
    state,
    activities,
    loading,
    filter,
    searchTerm,
    autoRefresh,
    lastRefresh,
    setFilter,
    setSearchTerm,
    setAutoRefresh,
    fetchActivities,
    getActivityIcon,
    getActivityColor,
    getScoreBadgeVariant,
    formatTimestamp,
    getTrendIndicator,
    getActivityTypeDisplayText,
    getTimeRangeDisplayText,
  } = useActivityTimelineController();

  // Fetch activities on mount and when dependencies change
  useEffect(() => {
    handleFetchActivities();
  }, [studentIds, filter, refreshTrigger]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        handleFetchActivities(true); // Silent refresh
      }, 30000); // Refresh every 30 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [autoRefresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle fetch activities
  const handleFetchActivities = async (silent = false) => {
    try {
      const result = await fetchActivities({
        studentIds,
        filter,
        searchTerm,
        silent
      });

      if (!result.success && !silent) {
        toast({
          title: 'Lỗi',
          description: result.error || 'Không thể tải hoạt động của học viên.',
          variant: 'destructive'
        });
      }
    } catch (error: unknown) {
      if (!silent) {
        toast({
          title: 'Lỗi',
          description: (error as any).message,
          variant: 'destructive'
        });
      }
    }
  };

  // Handle filter change
  const handleSetFilter = (newFilter: Partial<any>) => {
    setFilter(newFilter as any);
  };

  // Handle search term change
  const handleSetSearchTerm = (term: string) => {
    setSearchTerm(term);
  };

  // Handle auto refresh toggle
  const handleSetAutoRefresh = (enabled: boolean) => {
    setAutoRefresh(enabled);
  };

  return (
    <ActivityTimelineView
      // State
      activities={activities}
      loading={loading}
      filter={filter as any}
      searchTerm={searchTerm}
      autoRefresh={autoRefresh}
      lastRefresh={lastRefresh}

      // Actions
      onSetFilter={handleSetFilter}
      onSetSearchTerm={handleSetSearchTerm}
      onSetAutoRefresh={handleSetAutoRefresh}
      onFetchActivities={() => handleFetchActivities()}

      // Utility functions
      getActivityIcon={getActivityIcon}
      getActivityColor={getActivityColor}
      getScoreBadgeVariant={getScoreBadgeVariant}
      formatTimestamp={formatTimestamp}
      getTrendIndicator={getTrendIndicator}
      getActivityTypeDisplayText={getActivityTypeDisplayText}
      getTimeRangeDisplayText={getTimeRangeDisplayText}

      // Props
      className={className}
    />
  );
};

export default ActivityTimelineMVC;
