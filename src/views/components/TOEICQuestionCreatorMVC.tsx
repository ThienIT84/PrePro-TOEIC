import React from 'react';
import { TOEICQuestionCreatorView } from './TOEICQuestionCreatorView';
import { useTOEICQuestionCreatorController } from '@/controllers/question/useTOEICQuestionCreatorController';

export const TOEICQuestionCreatorMVC: React.FC = () => {
  const {
    // State
    questionData,
    passageData,
    passages,
    selectedPassageId,
    loading,
    error,
    activeTab,
    
    // Question Actions
    handleQuestionDataChange,
    handleQuestionSubmit,
    
    // Passage Actions
    handlePassageDataChange,
    handlePassageSubmit,
    
    // File Upload Actions
    handleAudioUpload,
    handleImageUpload,
    
    // Tag Actions
    handleTagAdd,
    handleTagRemove,
    
    // UI Actions
    handleActiveTabChange,
    handlePassageSelect,
    handleReset,
    clearError,
    
    // Controller Methods
    isAudioRequired,
    needsPassage,
    getPartInfo
  } = useTOEICQuestionCreatorController();

  return (
    <TOEICQuestionCreatorView
      controller={undefined} // Not needed in MVC wrapper
      state={{
        questionData,
        passageData,
        passages,
        selectedPassageId,
        loading,
        error,
        activeTab
      }}
      onQuestionDataChange={handleQuestionDataChange}
      onPassageDataChange={handlePassageDataChange}
      onActiveTabChange={handleActiveTabChange}
      onPassageSelect={handlePassageSelect}
      onQuestionSubmit={handleQuestionSubmit}
      onPassageSubmit={handlePassageSubmit}
      onAudioUpload={handleAudioUpload}
      onImageUpload={handleImageUpload}
      onTagAdd={handleTagAdd}
      onTagRemove={handleTagRemove}
      onReset={handleReset}
    />
  );
};
