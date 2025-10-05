/**
 * useExamReviewController
 * React hook để integrate ExamReviewController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { ExamReviewController, ExamReviewState } from './ExamReviewController';

export function useExamReviewController(sessionId: string) {
  const [controller] = useState(() => new ExamReviewController());
  const [state, setState] = useState<ExamReviewState>(controller.getState());

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // Initialize data on mount
  useEffect(() => {
    if (sessionId) {
      controller.fetchExamData(sessionId);
    }
  }, [controller, sessionId]);

  // Navigation handlers
  const setCurrentQuestionIndex = useCallback((index: number) => {
    controller.setCurrentQuestionIndex(index);
  }, [controller]);

  const goToNextQuestion = useCallback(() => {
    controller.goToNextQuestion();
  }, [controller]);

  const goToPreviousQuestion = useCallback(() => {
    controller.goToPreviousQuestion();
  }, [controller]);

  // Data fetching handlers
  const fetchExamData = useCallback(async () => {
    return await controller.fetchExamData(sessionId);
  }, [controller, sessionId]);

  // Utility functions
  const getCurrentQuestion = useCallback(() => {
    return controller.getCurrentQuestion();
  }, [controller]);

  const getCurrentAnswer = useCallback(() => {
    return controller.getCurrentAnswer();
  }, [controller]);

  const isCurrentAnswerCorrect = useCallback(() => {
    return controller.isCurrentAnswerCorrect();
  }, [controller]);

  const getScoreColor = useCallback((score: number) => {
    return controller.getScoreColor(score);
  }, [controller]);

  const getScoreBadgeVariant = useCallback((score: number) => {
    return controller.getScoreBadgeVariant(score);
  }, [controller]);

  const getPartColor = useCallback((part: number) => {
    return controller.getPartColor(part);
  }, [controller]);

  const getPartIcon = useCallback((part: number) => {
    return controller.getPartIcon(part);
  }, [controller]);

  const getTotalQuestions = useCallback(() => {
    return controller.getTotalQuestions();
  }, [controller]);

  const getCorrectAnswersCount = useCallback(() => {
    return controller.getCorrectAnswersCount();
  }, [controller]);

  const getIncorrectAnswersCount = useCallback(() => {
    return controller.getIncorrectAnswersCount();
  }, [controller]);

  const getQuestionsByPart = useCallback(() => {
    return controller.getQuestionsByPart();
  }, [controller]);

  const getCurrentPassageQuestions = useCallback(() => {
    return controller.getCurrentPassageQuestions();
  }, [controller]);

  const isQuestionCorrect = useCallback((questionId: string) => {
    return controller.isQuestionCorrect(questionId);
  }, [controller]);

  const getUserAnswer = useCallback((questionId: string) => {
    return controller.getUserAnswer(questionId);
  }, [controller]);

  const getProgressPercentage = useCallback(() => {
    return controller.getProgressPercentage();
  }, [controller]);

  const getStatistics = useCallback(() => {
    return controller.getStatistics();
  }, [controller]);

  const hasCurrentQuestionPassage = useCallback(() => {
    return controller.hasCurrentQuestionPassage();
  }, [controller]);

  const hasCurrentQuestionAudio = useCallback(() => {
    return controller.hasCurrentQuestionAudio();
  }, [controller]);

  const hasCurrentQuestionImage = useCallback(() => {
    return controller.hasCurrentQuestionImage();
  }, [controller]);

  const getCurrentQuestionPassage = useCallback(() => {
    return controller.getCurrentQuestionPassage();
  }, [controller]);

  const getPassageImages = useCallback((passage: any) => {
    return controller.getPassageImages(passage);
  }, [controller]);

  const canGoToNext = useCallback(() => {
    return controller.canGoToNext();
  }, [controller]);

  const canGoToPrevious = useCallback(() => {
    return controller.canGoToPrevious();
  }, [controller]);

  // State management handlers
  const reset = useCallback(() => {
    controller.reset();
  }, [controller]);

  const setError = useCallback((error: string | null) => {
    controller.setError(error);
  }, [controller]);

  const clearError = useCallback(() => {
    controller.clearError();
  }, [controller]);

  return {
    // State
    state,
    
    // Exam data
    examSession: state.examSession,
    questions: state.questions,
    examSet: state.examSet,
    userAnswers: state.userAnswers,
    loading: state.loading,
    currentQuestionIndex: state.currentQuestionIndex,
    error: state.error,

    // Navigation handlers
    setCurrentQuestionIndex,
    goToNextQuestion,
    goToPreviousQuestion,

    // Data fetching handlers
    fetchExamData,

    // Utility functions
    getCurrentQuestion,
    getCurrentAnswer,
    isCurrentAnswerCorrect,
    getScoreColor,
    getScoreBadgeVariant,
    getPartColor,
    getPartIcon,
    getTotalQuestions,
    getCorrectAnswersCount,
    getIncorrectAnswersCount,
    getQuestionsByPart,
    getCurrentPassageQuestions,
    isQuestionCorrect,
    getUserAnswer,
    getProgressPercentage,
    getStatistics,
    hasCurrentQuestionPassage,
    hasCurrentQuestionAudio,
    hasCurrentQuestionImage,
    getCurrentQuestionPassage,
    getPassageImages,
    canGoToNext,
    canGoToPrevious,

    // State management handlers
    reset,
    setError,
    clearError,
  };
}
