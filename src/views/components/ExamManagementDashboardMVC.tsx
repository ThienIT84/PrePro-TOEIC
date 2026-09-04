/**
 * ExamManagementDashboardMVC
 * MVC wrapper component cho ExamManagementDashboard
 * Integrates ExamManagementDashboardController với ExamManagementDashboardView
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useExamManagementDashboardController } from '@/controllers/exam/useExamManagementDashboardController';
import ExamManagementDashboardView from './ExamManagementDashboardView';

const ExamManagementDashboardMVC: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use real exam management dashboard controller
  const {
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
          title: "Thành công",
          description: "Đã xóa đề thi thành công",
        });
      } else {
        toast({
          title: "Lỗi",
          description: result.error || 'Không thể xóa đề thi',
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Lỗi",
        description: (error as any)?.message || 'Có lỗi xảy ra',
        variant: "destructive",
      });
    }
  };

  // Handle toggle exam status
  const handleToggleExamStatus = async (id: string, currentStatus: string) => {
    try {
      const result = await toggleExamStatus(id, currentStatus === 'active');
      
      if (result.success) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        toast({
          title: "Thành công",
          description: `Đề thi đã được ${newStatus === 'active' ? 'kích hoạt' : 'tạm dừng'}`,
        });
      } else {
        toast({
          title: "Lỗi",
          description: result.error || 'Không thể thay đổi trạng thái đề thi',
          variant: "destructive",
        });
      }
    } catch (error: unknown) {
      toast({
        title: "Lỗi",
        description: (error as any)?.message || 'Có lỗi xảy ra',
        variant: "destructive",
      });
    }
  };

  // Handle create exam set
  const handleCreateExamSet = () => {
    window.location.href = '/exam-sets';
  };

  // Handle preview exam set
  const handlePreviewExamSet = (examSet: unknown) => {
    toast({
      title: "Xem trước",
      description: `Đang xem trước đề thi: ${(examSet as any)?.title || ''}`,
    });
  };

  // Handle edit exam set
  const handleEditExamSet = (id: string) => {
    window.location.href = `/exam-sets/${id}/edit`;
  };

  return (
    <ExamManagementDashboardView
      // State
      activeTab={activeTab}
      examSets={examSets as any}
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
      getFilteredExamSets={getFilteredExamSets as any}
      getStatusColor={(status: string) => getStatusColor(status === 'active')}
      getTypeIconName={getTypeIconName}
      getRecentExamSets={getRecentExamSets as any}
    />
  );
};

export default ExamManagementDashboardMVC;
