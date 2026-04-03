/**
 * QuestionCreatorMVC
 * MVC wrapper component cho TOEIC Question Creator
 * Integrates controller với view
 */

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useQuestionCreatorController } from '@/controllers/question/useQuestionCreatorController';
import { QuestionCreatorView } from '@/views/components/QuestionCreatorView';

interface QuestionCreatorMVCProps {
  onSuccess?: () => void;
}

export const QuestionCreatorMVC: React.FC<QuestionCreatorMVCProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const {
    // State
    questionData,
    passageData,
    loading,
    activeTab,
    passages,
    selectedPassageId,
    newTag,
    errors,

    // Handlers
    handleQuestionChange,
    handleChoiceChange,
    handlePassageChange,
    handlePassageTextChange,
    addTag,
    removeTag,
    setNewTag,
    setActiveTab,
    setSelectedPassageId,
    createQuestion,
    createPassage,

    // Utility functions
    getCurrentPartInfo,
    needsPassage,
    usesIndividualAudio,
    usesPassageAudio,
    isAudioRequired,
    getAvailableChoices,
    getBlankIndexOptions,
    getPassageTypeOptions,
    getDifficultyOptions,
    getToeicPartInfo,
  } = useQuestionCreatorController();

  // Handle question creation with toast notifications
  const handleCreateQuestion = async () => {
    if (!user?.id) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để tạo câu hỏi',
        variant: 'destructive',
      });
      return;
    }

    const result = await createQuestion(user.id);
    
    if (result.success) {
      toast({
        title: 'Thành công',
        description: 'Đã tạo câu hỏi thành công',
      });
      onSuccess?.();
    } else {
      toast({
        title: 'Lỗi',
        description: result.error || 'Không thể tạo câu hỏi',
        variant: 'destructive',
      });
    }
  };

  // Handle passage creation with toast notifications
  const handleCreatePassage = async () => {
    if (!user?.id) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng đăng nhập để tạo đoạn văn',
        variant: 'destructive',
      });
      return;
    }

    const result = await createPassage(user.id);
    
    if (result.success) {
      toast({
        title: 'Thành công',
        description: 'Đã tạo đoạn văn thành công',
      });
    } else {
      toast({
        title: 'Lỗi',
        description: result.error || 'Không thể tạo đoạn văn',
        variant: 'destructive',
      });
    }
  };

  return (
    <QuestionCreatorView
      // State
      questionData={questionData}
      passageData={passageData}
      loading={loading}
      activeTab={activeTab}
      passages={passages}
      selectedPassageId={selectedPassageId}
      newTag={newTag}
      errors={errors}

      // Handlers
      onQuestionChange={handleQuestionChange}
      onChoiceChange={handleChoiceChange}
      onPassageChange={handlePassageChange}
      onPassageTextChange={handlePassageTextChange}
      onAddTag={addTag}
      onRemoveTag={removeTag}
      onSetNewTag={setNewTag}
      onSetActiveTab={setActiveTab}
      onSetSelectedPassageId={setSelectedPassageId}
      onCreateQuestion={handleCreateQuestion}
      onCreatePassage={handleCreatePassage}

      // Utility functions
      getCurrentPartInfo={getCurrentPartInfo}
      needsPassage={needsPassage}
      usesIndividualAudio={usesIndividualAudio}
      usesPassageAudio={usesPassageAudio}
      isAudioRequired={isAudioRequired}
      getAvailableChoices={getAvailableChoices}
      getBlankIndexOptions={getBlankIndexOptions}
      getPassageTypeOptions={getPassageTypeOptions}
      getDifficultyOptions={getDifficultyOptions}
      getToeicPartInfo={getToeicPartInfo}
    />
  );
};

export default QuestionCreatorMVC;
