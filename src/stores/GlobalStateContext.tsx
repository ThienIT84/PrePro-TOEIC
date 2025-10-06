import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { QuestionModel, ExamSetModel, UserModel } from '@/models/entities';
import { QuestionController } from '@/controllers/question/QuestionController';

/**
 * Global State Types
 */
export interface GlobalState {
  // User state
  user: UserModel | null;
  isAuthenticated: boolean;
  
  // Questions state
  questions: QuestionModel[];
  questionsLoading: boolean;
  questionsError: string | null;
  
  // Exam sets state
  examSets: ExamSetModel[];
  examSetsLoading: boolean;
  examSetsError: string | null;
  
  // UI state
  theme: 'light' | 'dark';
  language: 'vi' | 'en';
  sidebarOpen: boolean;
  
  // Controllers
  questionController: QuestionController | null;
}

/**
 * Action Types
 */
export type GlobalAction =
  // User actions
  | { type: 'SET_USER'; payload: UserModel | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  
  // Questions actions
  | { type: 'SET_QUESTIONS'; payload: QuestionModel[] }
  | { type: 'SET_QUESTIONS_LOADING'; payload: boolean }
  | { type: 'SET_QUESTIONS_ERROR'; payload: string | null }
  | { type: 'ADD_QUESTION'; payload: QuestionModel }
  | { type: 'UPDATE_QUESTION'; payload: QuestionModel }
  | { type: 'REMOVE_QUESTION'; payload: string }
  
  // Exam sets actions
  | { type: 'SET_EXAM_SETS'; payload: ExamSetModel[] }
  | { type: 'SET_EXAM_SETS_LOADING'; payload: boolean }
  | { type: 'SET_EXAM_SETS_ERROR'; payload: string | null }
  | { type: 'ADD_EXAM_SET'; payload: ExamSetModel }
  | { type: 'UPDATE_EXAM_SET'; payload: ExamSetModel }
  | { type: 'REMOVE_EXAM_SET'; payload: string }
  
  // UI actions
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LANGUAGE'; payload: 'vi' | 'en' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  
  // Controller actions
  | { type: 'SET_QUESTION_CONTROLLER'; payload: QuestionController | null };

/**
 * Initial State
 */
const initialState: GlobalState = {
  // User state
  user: null,
  isAuthenticated: false,
  
  // Questions state
  questions: [],
  questionsLoading: false,
  questionsError: null,
  
  // Exam sets state
  examSets: [],
  examSetsLoading: false,
  examSetsError: null,
  
  // UI state
  theme: 'light',
  language: 'vi',
  sidebarOpen: true,
  
  // Controllers
  questionController: null,
};

/**
 * Reducer Function
 */
function globalReducer(state: GlobalState, action: GlobalAction): GlobalState {
  switch (action.type) {
    // User actions
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    
    // Questions actions
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    case 'SET_QUESTIONS_LOADING':
      return { ...state, questionsLoading: action.payload };
    case 'SET_QUESTIONS_ERROR':
      return { ...state, questionsError: action.payload };
    case 'ADD_QUESTION':
      return { ...state, questions: [action.payload, ...state.questions] };
    case 'UPDATE_QUESTION':
      return {
        ...state,
        questions: state.questions.map(q =>
          q.id === action.payload.id ? action.payload : q
        )
      };
    case 'REMOVE_QUESTION':
      return {
        ...state,
        questions: state.questions.filter(q => q.id !== action.payload)
      };
    
    // Exam sets actions
    case 'SET_EXAM_SETS':
      return { ...state, examSets: action.payload };
    case 'SET_EXAM_SETS_LOADING':
      return { ...state, examSetsLoading: action.payload };
    case 'SET_EXAM_SETS_ERROR':
      return { ...state, examSetsError: action.payload };
    case 'ADD_EXAM_SET':
      return { ...state, examSets: [action.payload, ...state.examSets] };
    case 'UPDATE_EXAM_SET':
      return {
        ...state,
        examSets: state.examSets.map(es =>
          es.id === action.payload.id ? action.payload : es
        )
      };
    case 'REMOVE_EXAM_SET':
      return {
        ...state,
        examSets: state.examSets.filter(es => es.id !== action.payload)
      };
    
    // UI actions
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload };
    case 'SET_SIDEBAR_OPEN':
      return { ...state, sidebarOpen: action.payload };
    
    // Controller actions
    case 'SET_QUESTION_CONTROLLER':
      return { ...state, questionController: action.payload };
    
    default:
      return state;
  }
}

/**
 * Context Type
 */
interface GlobalContextType {
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
  
  // User actions
  setUser: (user: UserModel | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  
  // Questions actions
  setQuestions: (questions: QuestionModel[]) => void;
  setQuestionsLoading: (loading: boolean) => void;
  setQuestionsError: (error: string | null) => void;
  addQuestion: (question: QuestionModel) => void;
  updateQuestion: (question: QuestionModel) => void;
  removeQuestion: (questionId: string) => void;
  
  // Exam sets actions
  setExamSets: (examSets: ExamSetModel[]) => void;
  setExamSetsLoading: (loading: boolean) => void;
  setExamSetsError: (error: string | null) => void;
  addExamSet: (examSet: ExamSetModel) => void;
  updateExamSet: (examSet: ExamSetModel) => void;
  removeExamSet: (examSetId: string) => void;
  
  // UI actions
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'vi' | 'en') => void;
  setSidebarOpen: (open: boolean) => void;
  
  // Controller actions
  setQuestionController: (controller: QuestionController | null) => void;
}

/**
 * Create Context
 */
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

/**
 * Provider Component
 */
interface GlobalProviderProps {
  children: ReactNode;
}

export function GlobalProvider({ children }: GlobalProviderProps) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  // User actions
  const setUser = (user: UserModel | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const setAuthenticated = (isAuthenticated: boolean) => {
    dispatch({ type: 'SET_AUTHENTICATED', payload: isAuthenticated });
  };

  // Questions actions
  const setQuestions = (questions: QuestionModel[]) => {
    dispatch({ type: 'SET_QUESTIONS', payload: questions });
  };

  const setQuestionsLoading = (loading: boolean) => {
    dispatch({ type: 'SET_QUESTIONS_LOADING', payload: loading });
  };

  const setQuestionsError = (error: string | null) => {
    dispatch({ type: 'SET_QUESTIONS_ERROR', payload: error });
  };

  const addQuestion = (question: QuestionModel) => {
    dispatch({ type: 'ADD_QUESTION', payload: question });
  };

  const updateQuestion = (question: QuestionModel) => {
    dispatch({ type: 'UPDATE_QUESTION', payload: question });
  };

  const removeQuestion = (questionId: string) => {
    dispatch({ type: 'REMOVE_QUESTION', payload: questionId });
  };

  // Exam sets actions
  const setExamSets = (examSets: ExamSetModel[]) => {
    dispatch({ type: 'SET_EXAM_SETS', payload: examSets });
  };

  const setExamSetsLoading = (loading: boolean) => {
    dispatch({ type: 'SET_EXAM_SETS_LOADING', payload: loading });
  };

  const setExamSetsError = (error: string | null) => {
    dispatch({ type: 'SET_EXAM_SETS_ERROR', payload: error });
  };

  const addExamSet = (examSet: ExamSetModel) => {
    dispatch({ type: 'ADD_EXAM_SET', payload: examSet });
  };

  const updateExamSet = (examSet: ExamSetModel) => {
    dispatch({ type: 'UPDATE_EXAM_SET', payload: examSet });
  };

  const removeExamSet = (examSetId: string) => {
    dispatch({ type: 'REMOVE_EXAM_SET', payload: examSetId });
  };

  // UI actions
  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const setLanguage = (language: 'vi' | 'en') => {
    dispatch({ type: 'SET_LANGUAGE', payload: language });
  };

  const setSidebarOpen = (open: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  };

  // Controller actions
  const setQuestionController = (controller: QuestionController | null) => {
    dispatch({ type: 'SET_QUESTION_CONTROLLER', payload: controller });
  };

  const value: GlobalContextType = {
    state,
    dispatch,
    
    // User actions
    setUser,
    setAuthenticated,
    
    // Questions actions
    setQuestions,
    setQuestionsLoading,
    setQuestionsError,
    addQuestion,
    updateQuestion,
    removeQuestion,
    
    // Exam sets actions
    setExamSets,
    setExamSetsLoading,
    setExamSetsError,
    addExamSet,
    updateExamSet,
    removeExamSet,
    
    // UI actions
    setTheme,
    setLanguage,
    setSidebarOpen,
    
    // Controller actions
    setQuestionController,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

/**
 * Hook to use Global Context
 */
export function useGlobalState() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalProvider');
  }
  return context;
}

/**
 * Hook to use specific state slices
 */
export function useUserState() {
  const { state, setUser, setAuthenticated } = useGlobalState();
  return {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    setUser,
    setAuthenticated,
  };
}

export function useQuestionsState() {
  const { 
    state, 
    setQuestions, 
    setQuestionsLoading, 
    setQuestionsError,
    addQuestion,
    updateQuestion,
    removeQuestion
  } = useGlobalState();
  
  return {
    questions: state.questions,
    loading: state.questionsLoading,
    error: state.questionsError,
    setQuestions,
    setLoading: setQuestionsLoading,
    setError: setQuestionsError,
    addQuestion,
    updateQuestion,
    removeQuestion,
  };
}

export function useExamSetsState() {
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
    examSets: state.examSets,
    loading: state.examSetsLoading,
    error: state.examSetsError,
    setExamSets,
    setLoading: setExamSetsLoading,
    setError: setExamSetsError,
    addExamSet,
    updateExamSet,
    removeExamSet,
  };
}

export function useUIState() {
  const { 
    state, 
    setTheme, 
    setLanguage, 
    setSidebarOpen 
  } = useGlobalState();
  
  return {
    theme: state.theme,
    language: state.language,
    sidebarOpen: state.sidebarOpen,
    setTheme,
    setLanguage,
    setSidebarOpen,
  };
}

export function useControllersState() {
  const { state, setQuestionController } = useGlobalState();
  
  return {
    questionController: state.questionController,
    setQuestionController,
  };
}
