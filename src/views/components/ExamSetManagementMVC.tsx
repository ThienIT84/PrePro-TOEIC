/**
 * ExamSetManagementMVC
 * MVC wrapper component cho ExamSetManagement
 * Integrates ExamSetManagementController với ExamSetManagementView
 */

import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useExamSetManagementController } from '@/controllers/exam/useExamSetManagementController';
import ExamSetManagementView, { ExamSet as ViewExamSet, ExamSetFormData as ViewFormData } from './ExamSetManagementView';

const ExamSetManagementMVC: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use real exam set management controller
  const {
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

  // Transform controller examSets to view format
  const viewExamSets: ViewExamSet[] = examSets.map(es => ({
    id: es.id,
    title: es.title,
    description: es.description || '',
    time_limit: es.time_limit,
    difficulty: es.difficulty,
    status: es.is_active ? 'active' : 'inactive',
    total_questions: es.question_count || 0,
    created_at: es.created_at,
    updated_at: es.updated_at
  }));

  // Transform controller formData to view format
  const viewFormData: ViewFormData = {
    title: formData.title,
    description: formData.description,
    time_limit: formData.time_limit,
    difficulty: formData.difficulty,
    status: formData.is_active ? 'active' : 'inactive'
  };

  const handleSetFormData = (updates: Partial<ViewFormData>) => {
    const { status, ...rest } = updates;
    setFormData({
      ...rest,
      ...(status !== undefined ? { is_active: status === 'active' } : {})
    });
  };

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
        is_active: formData.is_active,
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
        description: (error as any)?.message || 'Có lỗi xảy ra',
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
        is_active: formData.is_active
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
        description: (error as any)?.message || 'Có lỗi xảy ra',
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
          description: 'Đề thi đã được xóa thành công!'
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
        description: (error as any)?.message || 'Có lỗi xảy ra',
        variant: 'destructive'
      });
    }
  };

  // Handle open edit dialog
  const handleOpenEditDialog = (examSet: ViewExamSet) => {
    const matched = examSets.find(es => es.id === examSet.id);
    if (matched) {
      openEditDialog(matched);
    }
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
      examSets={viewExamSets}
      loading={loading}
      isCreateDialogOpen={isCreateDialogOpen}
      isEditDialogOpen={isEditDialogOpen}
      editingExamSet={editingExamSet ? {
        id: editingExamSet.id,
        title: editingExamSet.title,
        description: editingExamSet.description || '',
        time_limit: editingExamSet.time_limit,
        difficulty: editingExamSet.difficulty,
        status: editingExamSet.is_active ? 'active' : 'inactive',
        total_questions: editingExamSet.question_count || 0,
        created_at: editingExamSet.created_at,
        updated_at: editingExamSet.updated_at
      } : null}
      formData={viewFormData}

      // Actions
      onSetCreateDialogOpen={setCreateDialogOpen}
      onSetEditDialogOpen={setEditDialogOpen}
      onSetFormData={handleSetFormData}
      onCreateExamSet={handleCreateExamSet}
      onUpdateExamSet={handleUpdateExamSet}
      onDeleteExamSet={handleDeleteExamSet}
      onOpenEditDialog={handleOpenEditDialog}
      onCloseCreateDialog={handleCloseCreateDialog}
      onCloseEditDialog={handleCloseEditDialog}

      // Utility functions
      getDifficultyColor={getDifficultyColor}
      getStatusColor={(status: string) => getStatusColor(status === 'active')}
      getDifficultyDisplayText={getDifficultyDisplayText}
      getStatusDisplayText={(status: string) => getStatusDisplayText(status === 'active')}
    />
  );
};

export default ExamSetManagementMVC;
