/**
 * ExamManagementDashboardMVC
 * MVC wrapper component cho ExamManagementDashboard
 * Integrates ExamManagementDashboardController với ExamManagementDashboardView
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useExamManagementDashboardController } from '../controllers/exam/useExamManagementDashboardController';
import ExamManagementDashboardView from './ExamManagementDashboardView';

const ExamManagementDashboardMVC: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use exam management dashboard controller
  const {
    state,
    activeTab,
    examSets,
    statistics,
    loading,
    searchTerm,
    filterStatus,
    filterType,
    setActiveTab,
    setSearchTerm,
    setFilterStatus,
    setFilterType,
    clearFilters,
    fetchExamSets,
    fetchStatistics,
    deleteExamSet,
    toggleExamStatus,
    getFilteredExamSets,
    getStatusColor,
    getTypeIconName,
    getRecentExamSets,
  } = useExamManagementDashboardController();

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      fetchExamSets();
      fetchStatistics();
    }
  }, [user, fetchExamSets, fetchStatistics]);

  // Handle delete exam set
  const handleDeleteExamSet = async (id: string) => {
    try {
      const result = await deleteExamSet(id);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Exam set deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to delete exam set',
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle toggle exam status
  const handleToggleExamStatus = async (id: string, currentStatus: string) => {
    try {
      const result = await toggleExamStatus(id, currentStatus);
      
      if (result.success) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        toast({
          title: "Success",
          description: `Exam set ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to toggle exam status',
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle create exam set
  const handleCreateExamSet = () => {
    // Navigate to create exam page
    window.location.href = '/exam-sets';
  };

  // Handle preview exam set
  const handlePreviewExamSet = (examSet: unknown) => {
    // Preview exam set
    console.log('Preview exam set:', examSet);
    toast({
      title: "Preview",
      description: `Previewing exam set: ${examSet.title}`,
    });
  };

  // Handle edit exam set
  const handleEditExamSet = (id: string) => {
    // Edit exam set
    window.location.href = `/exam-sets/${id}/edit`;
  };

  return (
    <ExamManagementDashboardView
      // State
      activeTab={activeTab}
      examSets={examSets}
      statistics={statistics}
      loading={loading}
      searchTerm={searchTerm}
      filterStatus={filterStatus}
      filterType={filterType}

      // Actions
      onSetActiveTab={setActiveTab}
      onSetSearchTerm={setSearchTerm}
      onSetFilterStatus={setFilterStatus}
      onSetFilterType={setFilterType}
      onClearFilters={clearFilters}
      onDeleteExamSet={handleDeleteExamSet}
      onToggleExamStatus={handleToggleExamStatus}
      onCreateExamSet={handleCreateExamSet}
      onPreviewExamSet={handlePreviewExamSet}
      onEditExamSet={handleEditExamSet}

      // Utility functions
      getFilteredExamSets={getFilteredExamSets}
      getStatusColor={getStatusColor}
      getTypeIconName={getTypeIconName}
      getRecentExamSets={getRecentExamSets}
    />
  );
};

export default ExamManagementDashboardMVC;
