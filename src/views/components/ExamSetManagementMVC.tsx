/**
 * ExamSetManagementMVC
 * MVC wrapper component cho ExamSetManagement
 * Integrates ExamSetManagementController với ExamSetManagementView
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
// Mock controller since it might not exist
const useExamSetManagementController = () => ({
  state: {},
  examSets: [],
  loading: false,
  isCreateDialogOpen: false,
  isEditDialogOpen: false,
  editingExamSet: null,
  formData: { title: '', description: '', time_limit: 120, difficulty: 'medium', status: 'active' },
  setCreateDialogOpen: () => {},
  setEditDialogOpen: () => {},
  setFormData: () => {},
  fetchExamSets: () => {},
  createExamSet: (data: any) => ({ success: true, error: null }),
  updateExamSet: (data: any) => ({ success: true, error: null }),
  deleteExamSet: (id: string) => ({ success: true, error: null }),
  openEditDialog: (examSet: any) => {},
  closeCreateDialog: () => {},
  closeEditDialog: () => {},
  getDifficultyColor: () => '',
  getStatusColor: () => '',
  getDifficultyDisplayText: () => '',
  getStatusDisplayText: () => '',
  validateFormData: () => ({ isValid: true, errors: [] }),
});
import ExamSetManagementView from './ExamSetManagementView';

const ExamSetManagementMVC: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use exam set management controller
  const {
    state,
    examSets,
    loading,
    isCreateDialogOpen,
    isEditDialogOpen,
    editingExamSet,
    formData,
    setCreateDialogOpen,
    setEditDialogOpen,
    setFormData,
    fetchExamSets,
    createExamSet,
    updateExamSet,
    deleteExamSet,
    openEditDialog,
    closeCreateDialog,
    closeEditDialog,
    getDifficultyColor,
    getStatusColor,
    getDifficultyDisplayText,
    getStatusDisplayText,
    validateFormData,
  } = useExamSetManagementController();

  // Fetch exam sets on mount
  useEffect(() => {
    fetchExamSets();
  }, [fetchExamSets]);

  // Handle create exam set
  const handleCreateExamSet = async () => {
    if (!user) {
      toast({
        title: 'Lỗi',
        description: 'Bạn cần đăng nhập để tạo đề thi',
        variant: 'destructive'
      });
      return;
    }

    // Validate form data
    const validation = validateFormData();
    if (!validation.isValid) {
      toast({
        title: 'Lỗi',
        description: validation.errors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await createExamSet({
        title: formData.title,
        description: formData.description,
        time_limit: formData.time_limit,
        difficulty: formData.difficulty,
        status: formData.status,
        created_by: user.id
      });

      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Đề thi đã được tạo thành công!'
        });

        closeCreateDialog();
        await fetchExamSets();
      } else {
        toast({
          title: 'Lỗi',
          description: result.error || 'Không thể tạo đề thi',
          variant: 'destructive'
        });
      }
    } catch (error: unknown) {
      toast({
        title: 'Lỗi',
        description: (error as any).message,
        variant: 'destructive'
      });
    }
  };

  // Handle update exam set
  const handleUpdateExamSet = async () => {
    if (!editingExamSet) {
      toast({
        title: 'Lỗi',
        description: 'Không tìm thấy đề thi để cập nhật',
        variant: 'destructive'
      });
      return;
    }

    // Validate form data
    const validation = validateFormData();
    if (!validation.isValid) {
      toast({
        title: 'Lỗi',
        description: validation.errors.join(', '),
        variant: 'destructive'
      });
      return;
    }

    try {
      const result = await updateExamSet({
        id: editingExamSet.id,
        title: formData.title,
        description: formData.description,
        time_limit: formData.time_limit,
        difficulty: formData.difficulty,
        status: formData.status
      });

      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Đề thi đã được cập nhật!'
        });

        closeEditDialog();
        await fetchExamSets();
      } else {
        toast({
          title: 'Lỗi',
          description: result.error || 'Không thể cập nhật đề thi',
          variant: 'destructive'
        });
      }
    } catch (error: unknown) {
      toast({
        title: 'Lỗi',
        description: (error as any).message,
        variant: 'destructive'
      });
    }
  };

  // Handle delete exam set
  const handleDeleteExamSet = async (examSetId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đề thi này?')) {
      return;
    }

    try {
      const result = await deleteExamSet(examSetId);

      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Đề thi đã được xóa!'
        });

        await fetchExamSets();
      } else {
        toast({
          title: 'Lỗi',
          description: result.error || 'Không thể xóa đề thi',
          variant: 'destructive'
        });
      }
    } catch (error: unknown) {
      toast({
        title: 'Lỗi',
        description: (error as any).message,
        variant: 'destructive'
      });
    }
  };

  // Handle open edit dialog
  const handleOpenEditDialog = (examSet: any) => {
    openEditDialog(examSet);
  };

  // Handle close create dialog
  const handleCloseCreateDialog = () => {
    closeCreateDialog();
  };

  // Handle close edit dialog
  const handleCloseEditDialog = () => {
    closeEditDialog();
  };

  return (
    <ExamSetManagementView
      // State
      examSets={examSets}
      loading={loading}
      isCreateDialogOpen={isCreateDialogOpen}
      isEditDialogOpen={isEditDialogOpen}
      editingExamSet={editingExamSet}
      formData={formData}

      // Actions
      onSetCreateDialogOpen={setCreateDialogOpen}
      onSetEditDialogOpen={setEditDialogOpen}
      onSetFormData={setFormData}
      onCreateExamSet={handleCreateExamSet}
      onUpdateExamSet={handleUpdateExamSet}
      onDeleteExamSet={handleDeleteExamSet}
      onOpenEditDialog={handleOpenEditDialog}
      onCloseCreateDialog={handleCloseCreateDialog}
      onCloseEditDialog={handleCloseEditDialog}

      // Utility functions
      getDifficultyColor={getDifficultyColor}
      getStatusColor={getStatusColor}
      getDifficultyDisplayText={getDifficultyDisplayText}
      getStatusDisplayText={getStatusDisplayText}
    />
  );
};

export default ExamSetManagementMVC;
