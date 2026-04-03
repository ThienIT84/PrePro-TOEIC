import { useState, useEffect, useCallback } from 'react';
import { QuestionDetailController } from './QuestionDetailController';
import { QuestionModel } from '@/models/entities';
import { TOEICPart, Difficulty } from '@/types';

/**
 * React hook để sử dụng QuestionDetailController
 * Cung cấp state management và methods cho QuestionDetailModal
 */
export function useQuestionDetailController() {
  const [controller] = useState(() => new QuestionDetailController());
  const [question, setQuestion] = useState<QuestionModel | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Set up controller callbacks
  useEffect(() => {
    controller.setCallbacks({
      onQuestionChange: setQuestion,
      onOpenChange: setIsOpen
    });
  }, [controller]);

  // Open modal with question
  const openModal = useCallback((question: QuestionModel) => {
    controller.openModal(question);
  }, [controller]);

  // Close modal
  const closeModal = useCallback(() => {
    controller.closeModal();
  }, [controller]);

  // Clear data
  const clear = useCallback(() => {
    controller.clear();
  }, [controller]);

  // Play audio
  const playAudio = useCallback((audioUrl: string) => {
    controller.playAudio(audioUrl);
  }, [controller]);

  // Get display labels
  const getTypeLabel = useCallback((type: string) => {
    return controller.getTypeLabel(type);
  }, [controller]);

  const getDifficultyLabel = useCallback((difficulty: Difficulty) => {
    return controller.getDifficultyLabel(difficulty);
  }, [controller]);

  const getDifficultyColor = useCallback((difficulty: Difficulty) => {
    return controller.getDifficultyColor(difficulty);
  }, [controller]);

  // Check question properties
  const hasAudio = useCallback(() => {
    return controller.hasAudio();
  }, [controller]);

  const hasTranscript = useCallback(() => {
    return controller.hasTranscript();
  }, [controller]);

  const hasExplanations = useCallback(() => {
    return controller.hasExplanations();
  }, [controller]);

  const hasTags = useCallback(() => {
    return controller.hasTags();
  }, [controller]);

  // Get question info
  const getQuestionSummary = useCallback(() => {
    return controller.getQuestionSummary();
  }, [controller]);

  const getQuestionRequirements = useCallback(() => {
    return controller.getQuestionRequirements();
  }, [controller]);

  const isQuestionValidForExam = useCallback(() => {
    return controller.isQuestionValidForExam();
  }, [controller]);

  const getQuestionDifficultyScore = useCallback(() => {
    return controller.getQuestionDifficultyScore();
  }, [controller]);

  const getQuestionPartType = useCallback(() => {
    return controller.getQuestionPartType();
  }, [controller]);

  const getQuestionPartNumber = useCallback(() => {
    return controller.getQuestionPartNumber();
  }, [controller]);

  const getQuestionStatus = useCallback(() => {
    return controller.getQuestionStatus();
  }, [controller]);

  const getQuestionCreatedDate = useCallback(() => {
    return controller.getQuestionCreatedDate();
  }, [controller]);

  const getQuestionUpdatedDate = useCallback(() => {
    return controller.getQuestionUpdatedDate();
  }, [controller]);

  return {
    // State
    question,
    isOpen,
    
    // Actions
    openModal,
    closeModal,
    clear,
    playAudio,
    
    // Display helpers
    getTypeLabel,
    getDifficultyLabel,
    getDifficultyColor,
    
    // Question properties
    hasAudio,
    hasTranscript,
    hasExplanations,
    hasTags,
    
    // Question info
    getQuestionSummary,
    getQuestionRequirements,
    isQuestionValidForExam,
    getQuestionDifficultyScore,
    getQuestionPartType,
    getQuestionPartNumber,
    getQuestionStatus,
    getQuestionCreatedDate,
    getQuestionUpdatedDate
  };
}
