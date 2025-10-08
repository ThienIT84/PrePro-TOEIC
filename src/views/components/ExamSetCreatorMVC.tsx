/**
 * ExamSetCreatorMVC
 * MVC wrapper component cho TOEIC Exam Set Creation
 * Integrates controller với view
 */

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useExamSetCreatorController } from '@/controllers/exam/useExamSetCreatorController';
import { ExamSetCreatorView } from '@/views/components/ExamSetCreatorView';

interface ExamSetCreatorMVCProps {
  className?: string;
}

export const ExamSetCreatorMVC: React.FC<ExamSetCreatorMVCProps> = ({ 
  className = '' 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    // State
    activeTab,
    loading,
    saving,
    errors,
    formData,
    examParts,
    questionBank,
    selectedQuestions,
    searchTerm,
    filterType,
    filterDifficulty,
    templates,

    // Handlers
    setActiveTab,
    updateFormData,
    updatePartConfig,
    addQuestionsToPart,
    removeQuestionFromPart,
    autoAssignQuestions,
    createExamSet,
    loadTemplate,
    setSearchTerm,
    setFilterType,
    setFilterDifficulty,
    setSelectedQuestions,

    // Utility functions
    getFilteredQuestions,
    getStatistics,
  } = useExamSetCreatorController();

  // Handle form data change
  const handleFormDataChange = (updates: Partial<typeof formData>) => {
    updateFormData(updates);
  };

  // Handle active tab change
  const handleActiveTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Handle part config update
  const handlePartConfigUpdate = (partNumber: number, field: string, value: unknown) => {
    updatePartConfig(partNumber, field as unknown, value);
  };

  // Handle add questions to part
  const handleAddQuestionsToPart = (partNumber: number, questionIds: string[]) => {
    addQuestionsToPart(partNumber, questionIds);
    toast({
      title: "Questions added",
      description: `${questionIds.length} questions added to Part ${partNumber}`,
    });
  };

  // Handle remove question from part
  const handleRemoveQuestionFromPart = (partNumber: number, questionId: string) => {
    removeQuestionFromPart(partNumber, questionId);
  };

  // Handle auto assign questions with toast notifications
  const handleAutoAssignQuestions = async () => {
    const result = await autoAssignQuestions();
    
    if (result.success) {
      toast({
        title: "Auto-assignment complete",
        description: `Assigned ${result.count} questions across all parts`,
      });
    } else {
      toast({
        title: "Auto-assignment failed",
        description: result.error || "Failed to auto-assign questions",
        variant: "destructive",
      });
    }
  };

  // Handle create exam set with toast notifications
  const handleCreateExamSet = async () => {
    if (!user?.id) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để tạo exam set',
        variant: 'destructive',
      });
      return;
    }

    const result = await createExamSet(user.id);
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Exam set created successfully",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to create exam set",
        variant: "destructive",
      });
    }
  };

  // Handle load template with toast notifications
  const handleLoadTemplate = (template: unknown) => {
    loadTemplate(template);
    toast({
      title: "Template loaded",
      description: `${template.name} template applied`,
    });
  };

  // Handle search term change
  const handleSearchTermChange = (searchTerm: string) => {
    setSearchTerm(searchTerm);
  };

  // Handle filter type change
  const handleFilterTypeChange = (filterType: string) => {
    setFilterType(filterType);
  };

  // Handle filter difficulty change
  const handleFilterDifficultyChange = (filterDifficulty: string) => {
    setFilterDifficulty(filterDifficulty);
  };

  // Handle selected questions change
  const handleSelectedQuestionsChange = (selectedQuestions: string[]) => {
    setSelectedQuestions(selectedQuestions);
  };

  return (
    <ExamSetCreatorView
      // State
      activeTab={activeTab}
      loading={loading}
      saving={saving}
      errors={errors}
      formData={formData}
      examParts={examParts}
      questionBank={questionBank}
      selectedQuestions={selectedQuestions}
      searchTerm={searchTerm}
      filterType={filterType}
      filterDifficulty={filterDifficulty}
      templates={templates}

      // Handlers
      onActiveTabChange={handleActiveTabChange}
      onFormDataChange={handleFormDataChange}
      onPartConfigUpdate={handlePartConfigUpdate}
      onAddQuestionsToPart={handleAddQuestionsToPart}
      onRemoveQuestionFromPart={handleRemoveQuestionFromPart}
      onAutoAssignQuestions={handleAutoAssignQuestions}
      onCreateExamSet={handleCreateExamSet}
      onLoadTemplate={handleLoadTemplate}
      onSearchTermChange={handleSearchTermChange}
      onFilterTypeChange={handleFilterTypeChange}
      onFilterDifficultyChange={handleFilterDifficultyChange}
      onSelectedQuestionsChange={handleSelectedQuestionsChange}

      // Utility functions
      getFilteredQuestions={getFilteredQuestions}
      getStatistics={getStatistics}

      // Props
      className={className}
    />
  );
};

export default ExamSetCreatorMVC;
