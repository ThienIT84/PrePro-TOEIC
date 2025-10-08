import { useEffect, useCallback } from 'react';
import { useGlobalState } from './GlobalStateContext';
import { getStoreManager, StoreManager } from './StoreManager';
import { QuestionModel } from '@/models/entities';

/**
 * Hook để sử dụng Store Manager
 * Tích hợp controllers với global state
 */
export function useStoreManager() {
  const { state, dispatch } = useGlobalState();
  const storeManager = getStoreManager();

  // Initialize store manager với dispatch
  useEffect(() => {
    storeManager.initialize(dispatch);
    
    // Cleanup on unmount
    return () => {
      storeManager.cleanup();
    };
  }, [dispatch]);

  // Questions methods
  const loadQuestions = useCallback(async (filters?: {
    part?: number;
    difficulty?: string;
    status?: string;
    search?: string;
  }) => {
    await storeManager.loadQuestions(filters);
  }, [storeManager]);

  const createQuestion = useCallback(async (questionData: unknown) => {
    return await storeManager.createQuestion(questionData);
  }, [storeManager]);

  const updateQuestion = useCallback(async (id: string, updates: unknown) => {
    return await storeManager.updateQuestion(id, updates);
  }, [storeManager]);

  const deleteQuestion = useCallback(async (id: string) => {
    return await storeManager.deleteQuestion(id);
  }, [storeManager]);

  const searchQuestions = useCallback((searchTerm: string) => {
    return storeManager.searchQuestions(searchTerm);
  }, [storeManager]);

  const getQuestionsByPart = useCallback((part: number) => {
    return storeManager.getQuestionsByPart(part);
  }, [storeManager]);

  const getQuestionsByDifficulty = useCallback((difficulty: string) => {
    return storeManager.getQuestionsByDifficulty(difficulty);
  }, [storeManager]);

  const getQuestionsStats = useCallback(() => {
    return storeManager.getQuestionsStats();
  }, [storeManager]);

  return {
    // State
    questions: state.questions,
    questionsLoading: state.questionsLoading,
    questionsError: state.questionsError,
    questionController: state.questionController,
    
    // Actions
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    getQuestionsByPart,
    getQuestionsByDifficulty,
    getQuestionsStats,
    
    // Store manager instance
    storeManager,
  };
}

/**
 * Hook để sử dụng Questions state với Store Manager
 */
export function useQuestionsStore() {
  const { 
    questions, 
    questionsLoading, 
    questionsError,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    getQuestionsByPart,
    getQuestionsByDifficulty,
    getQuestionsStats
  } = useStoreManager();

  return {
    // State
    questions,
    loading: questionsLoading,
    error: questionsError,
    
    // Actions
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    searchQuestions,
    getQuestionsByPart,
    getQuestionsByDifficulty,
    getQuestionsStats,
  };
}

/**
 * Hook để sử dụng User state
 */
export function useUserStore() {
  const { state, setUser, setAuthenticated } = useGlobalState();

  const login = useCallback((user: UserModel) => {
    setUser(user);
    setAuthenticated(true);
  }, [setUser, setAuthenticated]);

  const logout = useCallback(() => {
    setUser(null);
    setAuthenticated(false);
  }, [setUser, setAuthenticated]);

  return {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    
    // Actions
    login,
    logout,
    setUser,
    setAuthenticated,
  };
}

/**
 * Hook để sử dụng UI state
 */
export function useUIStore() {
  const { 
    theme, 
    language, 
    sidebarOpen, 
    setTheme, 
    setLanguage, 
    setSidebarOpen 
  } = useGlobalState();

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  }, [language, setLanguage]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen]);

  return {
    // State
    theme,
    language,
    sidebarOpen,
    
    // Actions
    setTheme,
    setLanguage,
    setSidebarOpen,
    toggleTheme,
    toggleLanguage,
    toggleSidebar,
  };
}

/**
 * Hook để sử dụng Exam Sets state
 */
export function useExamSetsStore() {
  const { 
    state, 
    setExamSets, 
    setExamSetsLoading, 
    setExamSetsError,
    addExamSet,
    updateExamSet,
    removeExamSet
  } = useGlobalState();

  return {
    // State
    examSets: state.examSets,
    loading: state.examSetsLoading,
    error: state.examSetsError,
    
    // Actions
    setExamSets,
    setLoading: setExamSetsLoading,
    setError: setExamSetsError,
    addExamSet,
    updateExamSet,
    removeExamSet,
  };
}
