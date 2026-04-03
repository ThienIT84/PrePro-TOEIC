/**
 * QuestionManagerController
 * Business logic cho TOEIC Question Management
 * Extracted từ TOEICQuestionManager.tsx
 */

import { QuestionService } from '@/services/domains/question/QuestionService';
import { getQuestionAudioUrl, getAudioSourceDescription } from '@/utils/audioUtils';
import { TOEICPart, Difficulty, QuestionStatus } from '@/types';

export interface Question {
  id: string;
  part: TOEICPart;
  prompt_text: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_choice: string;
  explain_vi: string;
  explain_en: string;
  tags: string[];
  difficulty: Difficulty;
  status: QuestionStatus;
  passage_id?: string;
  blank_index?: number;
  audio_url?: string;
  image_url?: string;
  created_at: string;
  passages?: {
    id: string;
    texts: {
      title?: string;
      content: string;
    };
    passage_type: string;
  };
}

export interface QuestionManagerState {
  questions: Question[];
  loading: boolean;
  searchTerm: string;
  filterPart: string;
  filterDifficulty: string;
  filterStatus: string;
  selectedQuestions: string[];
  deleting: boolean;
  errors: string[];
}

export interface FilterOptions {
  searchTerm: string;
  filterPart: string;
  filterDifficulty: string;
  filterStatus: string;
}

export class QuestionManagerController {
  private questionService: QuestionService;
  private state: QuestionManagerState;
  private listeners: Array<(state: QuestionManagerState) => void> = [];

  constructor() {
    this.questionService = new QuestionService();
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): QuestionManagerState {
    return {
      questions: [],
      loading: false,
      searchTerm: '',
      filterPart: 'all',
      filterDifficulty: 'all',
      filterStatus: 'all',
      selectedQuestions: [],
      deleting: false,
      errors: [],
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: QuestionManagerState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  /**
   * Update state
   */
  private setState(updates: Partial<QuestionManagerState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): QuestionManagerState {
    return { ...this.state };
  }

  /**
   * Get TOEIC part information
   */
  public getToeicPartInfo() {
    return {
      1: { name: 'Part 1: Photos', icon: '📷', color: 'bg-blue-100 text-blue-800' },
      2: { name: 'Part 2: Question-Response', icon: '💬', color: 'bg-green-100 text-green-800' },
      3: { name: 'Part 3: Conversations', icon: '👥', color: 'bg-purple-100 text-purple-800' },
      4: { name: 'Part 4: Talks', icon: '🎤', color: 'bg-orange-100 text-orange-800' },
      5: { name: 'Part 5: Incomplete Sentences', icon: '✏️', color: 'bg-red-100 text-red-800' },
      6: { name: 'Part 6: Text Completion', icon: '📝', color: 'bg-yellow-100 text-yellow-800' },
      7: { name: 'Part 7: Reading Comprehension', icon: '📖', color: 'bg-indigo-100 text-indigo-800' },
    };
  }

  /**
   * Get difficulty colors
   */
  public getDifficultyColors() {
    return {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800',
    };
  }

  /**
   * Get status colors
   */
  public getStatusColors() {
    return {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    };
  }

  /**
   * Fetch questions from database
   */
  public async fetchQuestions(): Promise<{ success: boolean; error?: string }> {
    try {
      this.setState({ loading: true, errors: [] });

      const result = await this.questionService.getQuestions();
      const questions = result.data || [];
      this.setState({ questions });

      return { success: true };
    } catch (error: unknown) {
      console.error('Error fetching questions:', error);
      this.setState({ errors: ['Không thể tải danh sách câu hỏi'] });
      return {
        success: false,
        error: 'Không thể tải danh sách câu hỏi'
      };
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Delete a single question
   */
  public async deleteQuestion(questionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.setState({ deleting: true });

      await this.questionService.deleteQuestion(questionId);
      
      // Remove from local state
      this.setState({
        questions: this.state.questions.filter(q => q.id !== questionId),
        selectedQuestions: this.state.selectedQuestions.filter(id => id !== questionId)
      });

      return { success: true };
    } catch (error: unknown) {
      console.error('Error deleting question:', error);
      return {
        success: false,
        error: 'Không thể xóa câu hỏi'
      };
    } finally {
      this.setState({ deleting: false });
    }
  }

  /**
   * Delete selected questions
   */
  public async deleteSelectedQuestions(): Promise<{ success: boolean; error?: string; count?: number }> {
    if (this.state.selectedQuestions.length === 0) {
      return { success: false, error: 'Không có câu hỏi nào được chọn' };
    }

    try {
      this.setState({ deleting: true });

      const deletePromises = this.state.selectedQuestions.map(id => 
        this.questionService.deleteQuestion(id)
      );
      
      await Promise.all(deletePromises);

      // Remove from local state
      this.setState({
        questions: this.state.questions.filter(q => !this.state.selectedQuestions.includes(q.id)),
        selectedQuestions: []
      });

      return { 
        success: true, 
        count: this.state.selectedQuestions.length 
      };
    } catch (error: unknown) {
      console.error('Error deleting questions:', error);
      return {
        success: false,
        error: 'Không thể xóa các câu hỏi đã chọn'
      };
    } finally {
      this.setState({ deleting: false });
    }
  }

  /**
   * Update search term
   */
  public setSearchTerm(searchTerm: string): void {
    this.setState({ searchTerm });
  }

  /**
   * Update filter part
   */
  public setFilterPart(filterPart: string): void {
    this.setState({ filterPart });
  }

  /**
   * Update filter difficulty
   */
  public setFilterDifficulty(filterDifficulty: string): void {
    this.setState({ filterDifficulty });
  }

  /**
   * Update filter status
   */
  public setFilterStatus(filterStatus: string): void {
    this.setState({ filterStatus });
  }

  /**
   * Update all filters
   */
  public setFilters(filters: FilterOptions): void {
    this.setState({
      searchTerm: filters.searchTerm,
      filterPart: filters.filterPart,
      filterDifficulty: filters.filterDifficulty,
      filterStatus: filters.filterStatus,
    });
  }

  /**
   * Clear all filters
   */
  public clearFilters(): void {
    this.setState({
      searchTerm: '',
      filterPart: 'all',
      filterDifficulty: 'all',
      filterStatus: 'all',
    });
  }

  /**
   * Select a question
   */
  public selectQuestion(questionId: string, checked: boolean): void {
    if (checked) {
      this.setState({
        selectedQuestions: [...this.state.selectedQuestions, questionId]
      });
    } else {
      this.setState({
        selectedQuestions: this.state.selectedQuestions.filter(id => id !== questionId)
      });
    }
  }

  /**
   * Select all questions
   */
  public selectAllQuestions(checked: boolean): void {
    if (checked) {
      const filteredQuestions = this.getFilteredQuestions();
      this.setState({
        selectedQuestions: filteredQuestions.map(q => q.id)
      });
    } else {
      this.setState({ selectedQuestions: [] });
    }
  }

  /**
   * Clear selection
   */
  public clearSelection(): void {
    this.setState({ selectedQuestions: [] });
  }

  /**
   * Get filtered questions based on current filters
   */
  public getFilteredQuestions(): Question[] {
    return this.state.questions.filter(question => {
      const matchesSearch = question.prompt_text.toLowerCase().includes(this.state.searchTerm.toLowerCase()) ||
                           question.explain_vi.toLowerCase().includes(this.state.searchTerm.toLowerCase());
      const matchesPart = this.state.filterPart === 'all' || question.part.toString() === this.state.filterPart;
      const matchesDifficulty = this.state.filterDifficulty === 'all' || question.difficulty === this.state.filterDifficulty;
      const matchesStatus = this.state.filterStatus === 'all' || question.status === this.state.filterStatus;

      return matchesSearch && matchesPart && matchesDifficulty && matchesStatus;
    });
  }

  /**
   * Get question by ID
   */
  public getQuestionById(questionId: string): Question | null {
    return this.state.questions.find(q => q.id === questionId) || null;
  }

  /**
   * Get questions by part
   */
  public getQuestionsByPart(part: TOEICPart): Question[] {
    return this.state.questions.filter(q => q.part === part);
  }

  /**
   * Get questions by difficulty
   */
  public getQuestionsByDifficulty(difficulty: Difficulty): Question[] {
    return this.state.questions.filter(q => q.difficulty === difficulty);
  }

  /**
   * Get questions by status
   */
  public getQuestionsByStatus(status: QuestionStatus): Question[] {
    return this.state.questions.filter(q => q.status === status);
  }

  /**
   * Get part information for a question
   */
  public getPartInfo(part: TOEICPart) {
    const partInfo = this.getToeicPartInfo();
    return partInfo[part];
  }

  /**
   * Get audio URL for a question
   */
  public getQuestionAudioUrl(question: Question): string | null {
    return getQuestionAudioUrl(question);
  }

  /**
   * Get audio source description for a question
   */
  public getAudioSourceDescription(question: Question): string {
    return getAudioSourceDescription(question);
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    const filteredQuestions = this.getFilteredQuestions();
    return {
      total: this.state.questions.length,
      filtered: filteredQuestions.length,
      selected: this.state.selectedQuestions.length,
      byPart: this.getQuestionsByPartCount(),
      byDifficulty: this.getQuestionsByDifficultyCount(),
      byStatus: this.getQuestionsByStatusCount(),
    };
  }

  /**
   * Get questions count by part
   */
  private getQuestionsByPartCount() {
    const counts: Record<string, number> = {};
    for (let part = 1; part <= 7; part++) {
      counts[part.toString()] = this.getQuestionsByPart(part as TOEICPart).length;
    }
    return counts;
  }

  /**
   * Get questions count by difficulty
   */
  private getQuestionsByDifficultyCount() {
    const counts: Record<string, number> = {};
    ['easy', 'medium', 'hard'].forEach(difficulty => {
      counts[difficulty] = this.getQuestionsByDifficulty(difficulty as Difficulty).length;
    });
    return counts;
  }

  /**
   * Get questions count by status
   */
  private getQuestionsByStatusCount() {
    const counts: Record<string, number> = {};
    ['draft', 'published', 'archived'].forEach(status => {
      counts[status] = this.getQuestionsByStatus(status as QuestionStatus).length;
    });
    return counts;
  }

  /**
   * Check if question is selected
   */
  public isQuestionSelected(questionId: string): boolean {
    return this.state.selectedQuestions.includes(questionId);
  }

  /**
   * Check if all filtered questions are selected
   */
  public areAllFilteredQuestionsSelected(): boolean {
    const filteredQuestions = this.getFilteredQuestions();
    return filteredQuestions.length > 0 && 
           filteredQuestions.every(q => this.state.selectedQuestions.includes(q.id));
  }

  /**
   * Get selected questions
   */
  public getSelectedQuestions(): Question[] {
    return this.state.questions.filter(q => this.state.selectedQuestions.includes(q.id));
  }

  /**
   * Reset state
   */
  public reset(): void {
    this.setState(this.getInitialState());
  }

  /**
   * Refresh questions
   */
  public async refresh(): Promise<{ success: boolean; error?: string }> {
    return await this.fetchQuestions();
  }

  /**
   * Update question in local state
   */
  public updateQuestion(questionId: string, updates: Partial<Question>): void {
    this.setState({
      questions: this.state.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    });
  }

  /**
   * Add question to local state
   */
  public addQuestion(question: Question): void {
    this.setState({
      questions: [question, ...this.state.questions]
    });
  }

  /**
   * Remove question from local state
   */
  public removeQuestion(questionId: string): void {
    this.setState({
      questions: this.state.questions.filter(q => q.id !== questionId),
      selectedQuestions: this.state.selectedQuestions.filter(id => id !== questionId)
    });
  }
}
