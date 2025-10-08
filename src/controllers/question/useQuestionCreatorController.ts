/**
 * useQuestionCreatorController
 * React hook để integrate QuestionCreatorController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { QuestionCreatorController, QuestionCreatorState } from './QuestionCreatorController';
import { TOEICPart, Difficulty, CorrectChoice, PassageType } from '@/types';

export function useQuestionCreatorController() {
  const [controller] = useState(() => new QuestionCreatorController());
  const [state, setState] = useState<QuestionCreatorState>(controller.getState());

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // Question handlers
  const handleQuestionChange = useCallback((field: string, value: unknown) => {
    controller.handleQuestionChange(field, value);
  }, [controller]);

  const handleChoiceChange = useCallback((choice: string, value: string) => {
    controller.handleChoiceChange(choice, value);
  }, [controller]);

  const handlePassageChange = useCallback((field: string, value: unknown) => {
    controller.handlePassageChange(field, value);
  }, [controller]);

  const handlePassageTextChange = useCallback((field: string, value: string) => {
    controller.handlePassageTextChange(field, value);
  }, [controller]);

  // Tag handlers
  const addTag = useCallback(() => {
    controller.addTag();
  }, [controller]);

  const removeTag = useCallback((tagToRemove: string) => {
    controller.removeTag(tagToRemove);
  }, [controller]);

  const setNewTag = useCallback((value: string) => {
    controller.setNewTag(value);
  }, [controller]);

  // UI handlers
  const setActiveTab = useCallback((tab: 'question' | 'passage') => {
    controller.setActiveTab(tab);
  }, [controller]);

  const setSelectedPassageId = useCallback((passageId: string | null) => {
    controller.setSelectedPassageId(passageId);
  }, [controller]);

  // Action handlers
  const createQuestion = useCallback(async (userId: string) => {
    return await controller.createQuestion(userId);
  }, [controller]);

  const createPassage = useCallback(async (userId: string) => {
    return await controller.createPassage(userId);
  }, [controller]);

  const loadPassages = useCallback(async (part: TOEICPart) => {
    return await controller.loadPassages(part);
  }, [controller]);

  const resetForm = useCallback(() => {
    controller.resetForm();
  }, [controller]);

  // Utility functions
  const getCurrentPartInfo = useCallback(() => {
    return controller.getCurrentPartInfo();
  }, [controller]);

  const needsPassage = useCallback((part: TOEICPart) => {
    return controller.needsPassage(part);
  }, [controller]);

  const usesIndividualAudio = useCallback((part: TOEICPart) => {
    return controller.usesIndividualAudio(part);
  }, [controller]);

  const usesPassageAudio = useCallback((part: TOEICPart) => {
    return controller.usesPassageAudio(part);
  }, [controller]);

  const isAudioRequired = useCallback((part: TOEICPart) => {
    return controller.isAudioRequired(part);
  }, [controller]);

  const getAvailableChoices = useCallback((part: TOEICPart) => {
    return controller.getAvailableChoices(part);
  }, [controller]);

  const getBlankIndexOptions = useCallback(() => {
    return controller.getBlankIndexOptions();
  }, [controller]);

  const getPassageTypeOptions = useCallback(() => {
    return controller.getPassageTypeOptions();
  }, [controller]);

  const getDifficultyOptions = useCallback(() => {
    return controller.getDifficultyOptions();
  }, [controller]);

  const getToeicPartInfo = useCallback(() => {
    return controller.getToeicPartInfo();
  }, [controller]);

  // Validation functions
  const validateQuestion = useCallback(() => {
    return controller.validateQuestion();
  }, [controller]);

  const validatePassage = useCallback(() => {
    return controller.validatePassage();
  }, [controller]);

  return {
    // State
    state,
    
    // Question data
    questionData: state.questionData,
    passageData: state.passageData,
    loading: state.loading,
    activeTab: state.activeTab,
    passages: state.passages,
    selectedPassageId: state.selectedPassageId,
    newTag: state.newTag,
    errors: state.errors,

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
    loadPassages,
    resetForm,

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

    // Validation functions
    validateQuestion,
    validatePassage,
  };
}
