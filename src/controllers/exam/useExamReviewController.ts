import { useState, useCallback, useEffect } from 'react';
import { ExamReviewController, ExamSession, QuestionReview, ExamStatistics } from './ExamReviewController';
import { Question } from '@/types';

export const useExamReviewController = (sessionId: string) => {
  const [controller] = useState(() => new ExamReviewController());
  const [state, setState] = useState(controller.getState());

  // State Management
  const updateState = useCallback(() => {
    setState(controller.getState());
  }, [controller]);

  // Data Loading
  const handleLoadExamData = useCallback(async (sessionId: string) => {
    try {
      await controller.loadExamData(sessionId);
      updateState();
    } catch (error) {
      updateState();
      throw error;
    }
  }, [controller, updateState]);

  // Question Navigation
  const handleSetCurrentQuestionIndex = useCallback((index: number) => {
    controller.setCurrentQuestionIndex(index);
    updateState();
  }, [controller, updateState]);

  const handleGoToNextQuestion = useCallback(() => {
    controller.goToNextQuestion();
    updateState();
  }, [controller, updateState]);

  const handleGoToPreviousQuestion = useCallback(() => {
    controller.goToPreviousQuestion();
    updateState();
  }, [controller, updateState]);

  const handleGoToQuestion = useCallback((index: number) => {
    controller.goToQuestion(index);
    updateState();
  }, [controller, updateState]);

  // Error Management
  const handleClearError = useCallback(() => {
    controller.clearError();
    updateState();
  }, [controller, updateState]);

  // Auto-load exam data on mount
  useEffect(() => {
    if (sessionId) {
      handleLoadExamData(sessionId);
    }
  }, [sessionId, handleLoadExamData]);

  return {
    // State
    ...state,
    
    // Actions
    handleLoadExamData,
    handleSetCurrentQuestionIndex,
    handleGoToNextQuestion,
    handleGoToPreviousQuestion,
    handleGoToQuestion,
    handleClearError,
    
    // Controller Methods
    getAudioUrl: controller.getAudioUrl.bind(controller),
    getQuestionAnalysis: controller.getQuestionAnalysis.bind(controller),
    getPerformanceAnalysis: controller.getPerformanceAnalysis.bind(controller),
    getCurrentQuestion: controller.getCurrentQuestion.bind(controller),
    getCurrentQuestionReview: controller.getCurrentQuestionReview.bind(controller),
    getQuestionByIndex: controller.getQuestionByIndex.bind(controller),
    getQuestionReviewByIndex: controller.getQuestionReviewByIndex.bind(controller)
  };
};