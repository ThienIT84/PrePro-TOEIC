/**
 * useExamSessionController
 * React hook để integrate ExamSessionController với React components
 */

import { useState, useEffect, useCallback } from 'react';
import { ExamSessionController, ExamSessionState, ExamAnswer, PassageLite } from './ExamSessionController';
import { ExamSet, Question } from '@/types';

export function useExamSessionController() {
  const [controller] = useState(() => new ExamSessionController());
  const [state, setState] = useState<ExamSessionState>(controller.getState());

  // Subscribe to controller state changes
  useEffect(() => {
    const unsubscribe = controller.subscribe(setState);
    return unsubscribe;
  }, [controller]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controller.cleanup();
    };
  }, [controller]);

  // Exam data management
  const setExamSet = useCallback((examSet: ExamSet | null) => {
    controller.setExamSet(examSet);
  }, [controller]);

  const setQuestions = useCallback((questions: Question[]) => {
    controller.setQuestions(questions);
  }, [controller]);

  const setSelectedParts = useCallback((parts: number[] | null) => {
    controller.setSelectedParts(parts);
  }, [controller]);

  const setLoading = useCallback((loading: boolean) => {
    controller.setLoading(loading);
  }, [controller]);

  const setHasCompleted = useCallback((hasCompleted: boolean) => {
    controller.setHasCompleted(hasCompleted);
  }, [controller]);

  const setPassageMap = useCallback((passageMap: Record<string, PassageLite>) => {
    controller.setPassageMap(passageMap);
  }, [controller]);

  const setSessionId = useCallback((sessionId: string | null) => {
    controller.setSessionId(sessionId);
  }, [controller]);

  // Timer management
  const startExam = useCallback(() => {
    controller.startExam();
  }, [controller]);

  const pauseExam = useCallback(() => {
    controller.pauseExam();
  }, [controller]);

  const setTimeLeft = useCallback((timeLeft: number) => {
    controller.setTimeLeft(timeLeft);
  }, [controller]);

  // Navigation
  const nextQuestion = useCallback(() => {
    controller.nextQuestion();
  }, [controller]);

  const previousQuestion = useCallback(() => {
    controller.previousQuestion();
  }, [controller]);

  const goToQuestion = useCallback((index: number) => {
    controller.goToQuestion(index);
  }, [controller]);

  // Answer management
  const handleAnswerChange = useCallback((questionId: string, answer: string) => {
    controller.handleAnswerChange(questionId, answer);
  }, [controller]);

  // Dialog management
  const showSubmitDialog = useCallback(() => {
    controller.showSubmitDialog();
  }, [controller]);

  const hideSubmitDialog = useCallback(() => {
    controller.hideSubmitDialog();
  }, [controller]);

  const handleSubmitExam = useCallback(() => {
    controller.handleSubmitExam();
  }, [controller]);

  // Utility functions
  const formatTime = useCallback((seconds: number) => {
    return controller.formatTime(seconds);
  }, [controller]);

  const getProgress = useCallback(() => {
    return controller.getProgress();
  }, [controller]);

  const getAnsweredCount = useCallback(() => {
    return controller.getAnsweredCount();
  }, [controller]);

  const getCurrentQuestion = useCallback(() => {
    return controller.getCurrentQuestion();
  }, [controller]);

  const getCurrentAnswer = useCallback(() => {
    return controller.getCurrentAnswer();
  }, [controller]);

  const calculateResults = useCallback(() => {
    return controller.calculateResults();
  }, [controller]);

  const getQuestionByIndex = useCallback((index: number) => {
    return controller.getQuestionByIndex(index);
  }, [controller]);

  const getAnswerByQuestionId = useCallback((questionId: string) => {
    return controller.getAnswerByQuestionId(questionId);
  }, [controller]);

  const getPassageById = useCallback((passageId: string) => {
    return controller.getPassageById(passageId);
  }, [controller]);

  const isQuestionAnswered = useCallback((questionId: string) => {
    return controller.isQuestionAnswered(questionId);
  }, [controller]);

  const isExamCompleted = useCallback(() => {
    return controller.isExamCompleted();
  }, [controller]);

  const isExamStarted = useCallback(() => {
    return controller.isExamStarted();
  }, [controller]);

  const isExamPaused = useCallback(() => {
    return controller.isExamPaused();
  }, [controller]);

  const isLoading = useCallback(() => {
    return controller.isLoading();
  }, [controller]);

  const hasCompleted = useCallback(() => {
    return controller.hasCompleted();
  }, [controller]);

  const getExamStatistics = useCallback(() => {
    return controller.getExamStatistics();
  }, [controller]);

  const resetExamSession = useCallback(() => {
    controller.resetExamSession();
  }, [controller]);

  return {
    // State
    state,
    
    // Exam data
    examSet: state.examSet,
    questions: state.questions,
    currentIndex: state.currentIndex,
    answers: state.answers,
    timeLeft: state.timeLeft,
    isStarted: state.isStarted,
    isPaused: state.isPaused,
    isSubmitted: state.isSubmitted,
    loading: state.loading,
    showSubmitDialog: state.showSubmitDialog,
    hasCompleted: state.hasCompleted,
    refreshKey: state.refreshKey,
    sessionId: state.sessionId,
    passageMap: state.passageMap,
    selectedParts: state.selectedParts,

    // Exam data management
    setExamSet,
    setQuestions,
    setSelectedParts,
    setLoading,
    setHasCompleted,
    setPassageMap,
    setSessionId,

    // Timer management
    startExam,
    pauseExam,
    setTimeLeft,

    // Navigation
    nextQuestion,
    previousQuestion,
    goToQuestion,

    // Answer management
    handleAnswerChange,

    // Dialog management
    showSubmitDialog,
    hideSubmitDialog,
    handleSubmitExam,

    // Utility functions
    formatTime,
    getProgress,
    getAnsweredCount,
    getCurrentQuestion,
    getCurrentAnswer,
    calculateResults,
    getQuestionByIndex,
    getAnswerByQuestionId,
    getPassageById,
    isQuestionAnswered,
    isExamCompleted,
    isExamStarted,
    isExamPaused,
    isLoading,
    hasCompleted,
    getExamStatistics,
    resetExamSession,
  };
}
