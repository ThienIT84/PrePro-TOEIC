/**
 * QuestionManagerMVC
 * MVC wrapper component cho TOEIC Question Management
 * Integrates controller với view
 */

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuestionManagerController } from '@/controllers/question/useQuestionManagerController';
import { QuestionManagerView } from '@/views/components/QuestionManagerView';

interface QuestionManagerMVCProps {
  onEdit?: (questionId: string) => void;
  className?: string;
}

export const QuestionManagerMVC: React.FC<QuestionManagerMVCProps> = ({ 
  onEdit,
  className = '' 
}) => {
  const { toast } = useToast();
  
  const {
    // State
    questions,
    loading,
    deleting,
    errors,
    searchTerm,
    filterPart,
    filterDifficulty,
    filterStatus,
    selectedQuestions,

    // Data fetching handlers
    fetchQuestions,
    refresh,

    // CRUD handlers
    deleteQuestion,
    deleteSelectedQuestions,

    // Filter handlers
    setSearchTerm,
    setFilterPart,
    setFilterDifficulty,
    setFilterStatus,

    // Selection handlers
    selectQuestion,
    selectAllQuestions,

    // Utility functions
    getFilteredQuestions,
    getQuestionById,
    getPartInfo,
    getQuestionAudioUrl,
    getAudioSourceDescription,
    getStatistics,
    isQuestionSelected,
    areAllFilteredQuestionsSelected,
    getToeicPartInfo,
    getDifficultyColors,
    getStatusColors,
  } = useQuestionManagerController();

  // Handle search term change
  const handleSearchTermChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  // Handle filter changes
  const handleFilterPartChange = (filterPart: string) => {
    setFilterPart(filterPart);
  };

  const handleFilterDifficultyChange = (filterDifficulty: string) => {
    setFilterDifficulty(filterDifficulty);
  };

  const handleFilterStatusChange = (filterStatus: string) => {
    setFilterStatus(filterStatus);
  };

  // Handle refresh with toast notifications
  const handleRefresh = async () => {
    const result = await refresh();
    
    if (result.success) {
      toast({
        title: "Làm mới thành công",
        description: "Danh sách câu hỏi đã được cập nhật",
      });
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Không thể làm mới danh sách câu hỏi",
        variant: "destructive",
      });
    }
  };

  // Handle delete single question with toast notifications
  const handleDeleteQuestion = async (questionId: string) => {
    const result = await deleteQuestion(questionId);
    
    if (result.success) {
      toast({
        title: "Thành công",
        description: "Đã xóa câu hỏi",
      });
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Không thể xóa câu hỏi",
        variant: "destructive",
      });
    }
  };

  // Handle delete selected questions with toast notifications
  const handleDeleteSelectedQuestions = async () => {
    const result = await deleteSelectedQuestions();
    
    if (result.success) {
      toast({
        title: "Thành công",
        description: `Đã xóa ${result.count} câu hỏi`,
      });
    } else {
      toast({
        title: "Lỗi",
        description: result.error || "Không thể xóa các câu hỏi đã chọn",
        variant: "destructive",
      });
    }
  };

  // Handle select question
  const handleSelectQuestion = (questionId: string, checked: boolean) => {
    selectQuestion(questionId, checked);
  };

  // Handle select all questions
  const handleSelectAllQuestions = (checked: boolean) => {
    selectAllQuestions(checked);
  };

  // Handle edit question
  const handleEditQuestion = (questionId: string) => {
    onEdit?.(questionId);
  };

  return (
    <QuestionManagerView
      // State
      questions={questions}
      loading={loading}
      deleting={deleting}
      errors={errors}
      searchTerm={searchTerm}
      filterPart={filterPart}
      filterDifficulty={filterDifficulty}
      filterStatus={filterStatus}
      selectedQuestions={selectedQuestions}

      // Handlers
      onSearchTermChange={handleSearchTermChange}
      onFilterPartChange={handleFilterPartChange}
      onFilterDifficultyChange={handleFilterDifficultyChange}
      onFilterStatusChange={handleFilterStatusChange}
      onRefresh={handleRefresh}
      onDeleteQuestion={handleDeleteQuestion}
      onDeleteSelectedQuestions={handleDeleteSelectedQuestions}
      onSelectQuestion={handleSelectQuestion}
      onSelectAllQuestions={handleSelectAllQuestions}
      onEditQuestion={handleEditQuestion}

      // Utility functions
      getFilteredQuestions={getFilteredQuestions}
      getQuestionById={getQuestionById}
      getPartInfo={getPartInfo}
      getQuestionAudioUrl={getQuestionAudioUrl}
      getAudioSourceDescription={getAudioSourceDescription}
      getStatistics={getStatistics}
      isQuestionSelected={isQuestionSelected}
      areAllFilteredQuestionsSelected={areAllFilteredQuestionsSelected}
      getToeicPartInfo={getToeicPartInfo}
      getDifficultyColors={getDifficultyColors}
      getStatusColors={getStatusColors}

      // Props
      className={className}
    />
  );
};

export default QuestionManagerMVC;
