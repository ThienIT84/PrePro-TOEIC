import { QuestionController } from '@/controllers/question/QuestionController';
import { QuestionModel, ExamSetModel, UserModel } from '@/models/entities';
import { GlobalState, GlobalAction } from './GlobalStateContext';

/**
 * Store Manager - Tích hợp Controllers với Global State
 * Quản lý lifecycle của controllers và sync với global state
 */
export class StoreManager {
  private questionController: QuestionController | null = null;
  private dispatch: ((action: GlobalAction) => void) | null = null;

  constructor() {
    // Initialize store manager
  }

  /**
   * Initialize với dispatch function
   */
  initialize(dispatch: (action: GlobalAction) => void): void {
    this.dispatch = dispatch;
    this.initializeControllers();
  }

  /**
   * Initialize controllers
   */
  private initializeControllers(): void {
    this.initializeQuestionController();
    // Có thể thêm các controllers khác ở đây
  }

  /**
   * Initialize Question Controller
   */
  private initializeQuestionController(): void {
    this.questionController = new QuestionController();
    
    // Set up callbacks để sync với global state
    this.questionController.setCallbacks({
      onQuestionsChange: (questions) => {
        this.dispatch?.({ type: 'SET_QUESTIONS', payload: questions });
      },
      onLoadingChange: (loading) => {
        this.dispatch?.({ type: 'SET_QUESTIONS_LOADING', payload: loading });
      },
      onErrorChange: (error) => {
        this.dispatch?.({ type: 'SET_QUESTIONS_ERROR', payload: error });
      }
    });

    // Set controller trong global state
    this.dispatch?.({ type: 'SET_QUESTION_CONTROLLER', payload: this.questionController });
  }

  /**
   * Get Question Controller
   */
  getQuestionController(): QuestionController | null {
    return this.questionController;
  }

  /**
   * Load questions với filters
   */
  async loadQuestions(filters?: {
    part?: number;
    difficulty?: string;
    status?: string;
    search?: string;
  }): Promise<void> {
    if (this.questionController) {
      await this.questionController.loadQuestions(filters);
    }
  }

  /**
   * Create question
   */
  async createQuestion(questionData: unknown): Promise<QuestionModel | null> {
    if (this.questionController) {
      return await this.questionController.createQuestion(questionData);
    }
    return null;
  }

  /**
   * Update question
   */
  async updateQuestion(id: string, updates: unknown): Promise<QuestionModel | null> {
    if (this.questionController) {
      return await this.questionController.updateQuestion(id, updates);
    }
    return null;
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<boolean> {
    if (this.questionController) {
      return await this.questionController.deleteQuestion(id);
    }
    return false;
  }

  /**
   * Get questions statistics
   */
  getQuestionsStats(): unknown {
    if (this.questionController) {
      return this.questionController.getQuestionsStats();
    }
    return null;
  }

  /**
   * Search questions
   */
  searchQuestions(searchTerm: string): QuestionModel[] {
    if (this.questionController) {
      return this.questionController.searchQuestions(searchTerm);
    }
    return [];
  }

  /**
   * Get questions by part
   */
  getQuestionsByPart(part: number): QuestionModel[] {
    if (this.questionController) {
      return this.questionController.getQuestionsByPart(part);
    }
    return [];
  }

  /**
   * Get questions by difficulty
   */
  getQuestionsByDifficulty(difficulty: string): QuestionModel[] {
    if (this.questionController) {
      return this.questionController.getQuestionsByDifficulty(difficulty as unknown);
    }
    return [];
  }

  /**
   * Clear all data
   */
  clear(): void {
    if (this.questionController) {
      this.questionController.clear();
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.questionController = null;
    this.dispatch = null;
  }
}

/**
 * Singleton instance
 */
let storeManagerInstance: StoreManager | null = null;

/**
 * Get Store Manager instance
 */
export function getStoreManager(): StoreManager {
  if (!storeManagerInstance) {
    storeManagerInstance = new StoreManager();
  }
  return storeManagerInstance;
}

/**
 * Initialize Store Manager
 */
export function initializeStoreManager(dispatch: (action: GlobalAction) => void): StoreManager {
  const manager = getStoreManager();
  manager.initialize(dispatch);
  return manager;
}

/**
 * Cleanup Store Manager
 */
export function cleanupStoreManager(): void {
  if (storeManagerInstance) {
    storeManagerInstance.cleanup();
    storeManagerInstance = null;
  }
}
