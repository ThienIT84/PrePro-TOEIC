import { useState, useEffect, useCallback } from 'react';
import { QuestionController } from './QuestionController';
import { QuestionModel } from '@/models/entities';
import { Question, TOEICPart, Difficulty } from '@/types';

/**
 * React hook để sử dụng QuestionController
 * Cung cấp state management và methods cho components
 */
export function useQuestionController() {
  const [controller] = useState(() => new QuestionController());
  const [questions, setQuestions] = useState<QuestionModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set up controller callbacks
  useEffect(() => {
    controller.setCallbacks({
      onQuestionsChange: setQuestions,
      onLoadingChange: setLoading,
      onErrorChange: setError
    });
  }, [controller]);

  // Load questions
  const loadQuestions = useCallback(async (filters?: {
    part?: TOEICPart;
    difficulty?: Difficulty;
    status?: string;
    search?: string;
  }) => {
    await controller.loadQuestions(filters);
  }, [controller]);

  // Create question
  const createQuestion = useCallback(async (questionData: Partial<Question>) => {
    return await controller.createQuestion(questionData);
  }, [controller]);

  // Update question
  const updateQuestion = useCallback(async (id: string, updates: Partial<Question>) => {
    return await controller.updateQuestion(id, updates);
  }, [controller]);

  // Delete question
  const deleteQuestion = useCallback(async (id: string) => {
    return await controller.deleteQuestion(id);
  }, [controller]);

  // Get question by ID
  const getQuestionById = useCallback((id: string) => {
    return controller.getQuestionById(id);
  }, [controller]);

  // Filter methods
  const getQuestionsByPart = useCallback((part: TOEICPart) => {
    return controller.getQuestionsByPart(part);
  }, [controller]);

  const getQuestionsByDifficulty = useCallback((difficulty: Difficulty) => {
    return controller.getQuestionsByDifficulty(difficulty);
  }, [controller]);

  const getQuestionsNeedingAudio = useCallback(() => {
    return controller.getQuestionsNeedingAudio();
  }, [controller]);

  const getQuestionsNeedingImages = useCallback(() => {
    return controller.getQuestionsNeedingImages();
  }, [controller]);

  const getQuestionsNeedingPassages = useCallback(() => {
    return controller.getQuestionsNeedingPassages();
  }, [controller]);

  const getValidQuestionsForExam = useCallback(() => {
    return controller.getValidQuestionsForExam();
  }, [controller]);

  const searchQuestions = useCallback((searchTerm: string) => {
    return controller.searchQuestions(searchTerm);
  }, [controller]);

  // Get statistics
  const getQuestionsStats = useCallback(() => {
    return controller.getQuestionsStats();
  }, [controller]);

  // Clear data
  const clear = useCallback(() => {
    controller.clear();
  }, [controller]);

  return {
    // State
    questions,
    loading,
    error,
    
    // Actions
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    
    // Getters
    getQuestionById,
    getQuestionsByPart,
    getQuestionsByDifficulty,
    getQuestionsNeedingAudio,
    getQuestionsNeedingImages,
    getQuestionsNeedingPassages,
    getValidQuestionsForExam,
    searchQuestions,
    getQuestionsStats,
    
    // Utilities
    clear
  };
}
