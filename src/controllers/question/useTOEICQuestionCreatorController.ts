import { useState, useCallback, useEffect } from 'react';
import { TOEICQuestionCreatorController, QuestionCreateData, PassageCreateData, TOEICQuestionCreatorState } from './TOEICQuestionCreatorController';
import { TOEICPart } from '@/types';

export const useTOEICQuestionCreatorController = () => {
  const [controller] = useState(() => new TOEICQuestionCreatorController());
  const [state, setState] = useState<TOEICQuestionCreatorState>(controller.getState());

  // State Management
  const updateState = useCallback((updates: Partial<TOEICQuestionCreatorState>) => {
    controller.updateState(updates);
    setState(controller.getState());
  }, [controller]);

  // Question Management
  const handleQuestionDataChange = useCallback((updates: Partial<QuestionCreateData>) => {
    const newQuestionData = { ...state.questionData, ...updates };
    updateState({ questionData: newQuestionData });

    // Reset choices when part changes
    if (updates.part && updates.part !== state.questionData.part) {
      const resetQuestionData = {
        ...newQuestionData,
        choices: { A: '', B: '', C: '', D: '' },
        correct_choice: 'A' as const
      };
      updateState({ questionData: resetQuestionData });
    }
  }, [state.questionData, updateState]);

  const handleQuestionSubmit = useCallback(async (data: QuestionCreateData) => {
    try {
      const question = await controller.createQuestion(data);
      
      // Reset form after successful creation
      updateState({
        questionData: controller.getInitialState().questionData,
        error: null
      });
      
      return question;
    } catch (error) {
      throw error;
    }
  }, [controller, updateState]);

  // Passage Management
  const handlePassageDataChange = useCallback((updates: Partial<PassageCreateData>) => {
    const newPassageData = { ...state.passageData, ...updates };
    updateState({ passageData: newPassageData });
  }, [state.passageData, updateState]);

  const handlePassageSubmit = useCallback(async (data: PassageCreateData) => {
    try {
      const passage = await controller.createPassage(data);
      
      // Reset form after successful creation
      updateState({
        passageData: controller.getInitialState().passageData,
        error: null
      });
      
      return passage;
    } catch (error) {
      throw error;
    }
  }, [controller, updateState]);

  // Load Passages
  const handleLoadPassages = useCallback(async (part: TOEICPart) => {
    try {
      const passages = await controller.loadPassages(part);
      return passages;
    } catch (error) {
      throw error;
    }
  }, [controller]);

  // File Upload
  const handleAudioUpload = useCallback(async (file: File) => {
    try {
      const audioUrl = await controller.uploadAudio(file);
      
      // Update question data with audio URL
      if (state.activeTab === 'question') {
        handleQuestionDataChange({ audio_url: audioUrl });
      } else {
        handlePassageDataChange({ audio_url: audioUrl });
      }
      
      return audioUrl;
    } catch (error) {
      throw error;
    }
  }, [controller, state.activeTab, handleQuestionDataChange, handlePassageDataChange]);

  const handleImageUpload = useCallback(async (file: File) => {
    try {
      const imageUrl = await controller.uploadImage(file);
      
      // Update question data with image URL
      handleQuestionDataChange({ image_url: imageUrl });
      
      return imageUrl;
    } catch (error) {
      throw error;
    }
  }, [controller, handleQuestionDataChange]);

  // Tag Management
  const handleTagAdd = useCallback((tag: string) => {
    if (tag && !state.questionData.tags.includes(tag)) {
      const newTags = [...state.questionData.tags, tag];
      handleQuestionDataChange({ tags: newTags });
    }
  }, [state.questionData.tags, handleQuestionDataChange]);

  const handleTagRemove = useCallback((tag: string) => {
    const newTags = state.questionData.tags.filter(t => t !== tag);
    handleQuestionDataChange({ tags: newTags });
  }, [state.questionData.tags, handleQuestionDataChange]);

  // Tab Management
  const handleActiveTabChange = useCallback((tab: 'question' | 'passage') => {
    controller.setActiveTab(tab);
    setState(controller.getState());
  }, [controller]);

  // Passage Selection
  const handlePassageSelect = useCallback((passageId: string | null) => {
    controller.setSelectedPassageId(passageId);
    setState(controller.getState());
    
    // Update question data with passage ID
    if (passageId) {
      handleQuestionDataChange({ passage_id: passageId });
    }
  }, [controller, handleQuestionDataChange]);

  // Reset
  const handleReset = useCallback(() => {
    controller.resetState();
    setState(controller.getState());
  }, [controller]);

  // Clear Error
  const clearError = useCallback(() => {
    controller.clearError();
    setState(controller.getState());
  }, [controller]);

  // Auto-load passages when part changes
  useEffect(() => {
    if (controller.needsPassage(state.questionData.part)) {
      handleLoadPassages(state.questionData.part).catch(console.error);
    }
  }, [state.questionData.part, handleLoadPassages]);

  return {
    // State
    ...state,
    
    // Question Actions
    handleQuestionDataChange,
    handleQuestionSubmit,
    
    // Passage Actions
    handlePassageDataChange,
    handlePassageSubmit,
    handleLoadPassages,
    
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
    isAudioRequired: controller.isAudioRequired.bind(controller),
    needsPassage: controller.needsPassage.bind(controller),
    getPartInfo: controller.getPartInfo.bind(controller)
  };
};
