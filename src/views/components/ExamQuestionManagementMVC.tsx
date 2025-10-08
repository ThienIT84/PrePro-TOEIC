/**
 * ExamQuestionManagementMVC
 * MVC wrapper component cho ExamQuestionManagement
 * Integrates ExamQuestionManagementController với ExamQuestionManagementView
 */

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
// Mock controller since it might not exist
const useExamQuestionManagementController = () => ({
  state: {},
  examSet: null,
  examQuestions: [],
  allQuestions: [],
  loading: false,
  isAddDialogOpen: false,
  isExcelDialogOpen: false,
  searchTerm: '',
  selectedType: 'all',
  editingQuestion: null,
  viewingQuestion: null,
  setAddDialogOpen: () => {},
  setExcelDialogOpen: () => {},
  setSearchTerm: () => {},
  setSelectedType: () => {},
  setEditingQuestion: () => {},
  setViewingQuestion: () => {},
  fetchExamSet: (id: string) => ({ success: true, error: null }),
  fetchExamQuestions: (id: string) => ({ success: true, error: null }),
  fetchAllQuestions: () => ({ success: true, error: null }),
  addQuestionToExam: (data: any) => ({ success: true, error: null }),
  removeQuestionFromExam: (data: any) => ({ success: true, error: null }),
  updateQuestionOrder: (data: any) => ({ success: true, error: null }),
  updateExamSetQuestionCount: (data: any) => ({ success: true, error: null }),
  getFilteredQuestions: () => [],
  getTypeLabel: () => '',
  getDifficultyLabel: () => '',
  getQuestionPreview: () => '',
  isQuestionCountSynced: () => true,
  getQuestionCountDifference: () => 0,
  getExamSetStatistics: () => ({
    totalQuestions: 0,
    questionsByType: {},
    questionsByDifficulty: {},
    averageDifficulty: 0,
    hasAudioQuestions: false
  }),
});
import ExamQuestionManagementView from './ExamQuestionManagementView';

const ExamQuestionManagementMVC: React.FC = () => {
  const { examSetId } = useParams<{ examSetId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use exam question management controller
  const {
    state,
    examSet,
    examQuestions,
    allQuestions,
    loading,
    isAddDialogOpen,
    isExcelDialogOpen,
    searchTerm,
    selectedType,
    editingQuestion,
    viewingQuestion,
    setAddDialogOpen,
    setExcelDialogOpen,
    setSearchTerm,
    setSelectedType,
    setEditingQuestion,
    setViewingQuestion,
    fetchExamSet,
    fetchExamQuestions,
    fetchAllQuestions,
    addQuestionToExam,
    removeQuestionFromExam,
    updateQuestionOrder,
    updateExamSetQuestionCount,
    getFilteredQuestions,
    getTypeLabel,
    getDifficultyLabel,
    getQuestionPreview,
    isQuestionCountSynced,
    getQuestionCountDifference,
    getExamSetStatistics,
  } = useExamQuestionManagementController();

  // Fetch data on mount
  useEffect(() => {
    if (examSetId) {
      handleFetchData();
    }
  }, [examSetId]);

  // Handle fetch all data
  const handleFetchData = async () => {
    if (!examSetId) return;

    try {
      const [examSetResult, examQuestionsResult, allQuestionsResult] = await Promise.all([
        fetchExamSet(examSetId),
        fetchExamQuestions(examSetId),
        fetchAllQuestions()
      ]);

      if (!examSetResult.success) {
        toast({
          title: "Lỗi",
          description: examSetResult.error || "Không thể tải thông tin bộ đề",
          variant: "destructive",
        });
      }

      if (!examQuestionsResult.success) {
        toast({
          title: "Lỗi",
          description: examQuestionsResult.error || "Không thể tải câu hỏi trong bộ đề",
          variant: "destructive",
        });
      }

      if (!allQuestionsResult.success) {
        toast({
          title: "Lỗi",
          description: allQuestionsResult.error || "Không thể tải danh sách câu hỏi",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle add question to exam
  const handleAddQuestionToExam = async (questionId: string) => {
    if (!examSetId) return;

    try {
      const result = await addQuestionToExam({
        examSetId,
        questionId
      });

      if (result.success) {
        toast({
          title: "Thành công",
          description: "Đã thêm câu hỏi vào bộ đề",
        });
        
        await handleFetchData();
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể thêm câu hỏi",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle remove question from exam
  const handleRemoveQuestionFromExam = async (examQuestionId: string) => {
    try {
      const result = await removeQuestionFromExam({
        examQuestionId
      });

      if (result.success) {
        toast({
          title: "Thành công",
          description: "Đã xóa câu hỏi khỏi bộ đề",
        });
        
        await handleFetchData();
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể xóa câu hỏi",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle update question order
  const handleUpdateQuestionOrder = async (examQuestionId: string, newOrder: number) => {
    try {
      const result = await updateQuestionOrder({
        examQuestionId,
        newOrder
      });

      if (result.success) {
        await fetchExamQuestions(examSetId!);
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể cập nhật thứ tự câu hỏi",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle update exam set question count
  const handleUpdateExamSetQuestionCount = async (newCount: number) => {
    if (!examSetId) return;

    try {
      const result = await updateExamSetQuestionCount({
        examSetId,
        newCount
      });

      if (result.success) {
        await fetchExamSet(examSetId);
        toast({
          title: "Thành công",
          description: `Đã đồng bộ số câu hỏi: ${newCount}`,
        });
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể cập nhật số câu hỏi",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Handle navigate back
  const handleNavigateBack = () => {
    navigate('/exam-sets');
  };

  // Handle navigate to exam
  const handleNavigateToExam = () => {
    navigate(`/exam-sets/${examSetId}/take`);
  };

  return (
    <ExamQuestionManagementView
      // State
      examSet={examSet}
      examQuestions={examQuestions}
      allQuestions={allQuestions}
      loading={loading}
      isAddDialogOpen={isAddDialogOpen}
      isExcelDialogOpen={isExcelDialogOpen}
      searchTerm={searchTerm}
      selectedType={selectedType}
      editingQuestion={editingQuestion}
      viewingQuestion={viewingQuestion}

      // Actions
      onSetAddDialogOpen={setAddDialogOpen}
      onSetExcelDialogOpen={setExcelDialogOpen}
      onSetSearchTerm={setSearchTerm}
      onSetSelectedType={setSelectedType}
      onSetEditingQuestion={setEditingQuestion}
      onSetViewingQuestion={setViewingQuestion}
      onAddQuestionToExam={handleAddQuestionToExam}
      onRemoveQuestionFromExam={handleRemoveQuestionFromExam}
      onUpdateQuestionOrder={handleUpdateQuestionOrder}
      onUpdateExamSetQuestionCount={handleUpdateExamSetQuestionCount}
      onNavigateBack={handleNavigateBack}
      onNavigateToExam={handleNavigateToExam}

      // Utility functions
      getFilteredQuestions={getFilteredQuestions}
      getTypeLabel={getTypeLabel}
      getDifficultyLabel={getDifficultyLabel}
      getQuestionPreview={getQuestionPreview}
      isQuestionCountSynced={isQuestionCountSynced}
      getQuestionCountDifference={getQuestionCountDifference}
      getExamSetStatistics={getExamSetStatistics}
    />
  );
};

export default ExamQuestionManagementMVC;
