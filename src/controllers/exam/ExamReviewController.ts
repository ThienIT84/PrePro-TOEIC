/**
 * ExamReviewController
 * Business logic cho TOEIC Exam Review
 * Extracted từ ExamReview.tsx
 */

import { ExamService } from '@/services/domains/exam/ExamService';
import { QuestionService } from '@/services/domains/question/QuestionService';
import { Question, ExamSet } from '@/types';

export interface ExamSession {
  id: string;
  exam_set_id: string;
  user_id: string;
  score: number;
  completed_at: string;
  created_at: string;
  exam_sets?: ExamSet;
}

export interface ExamAttempt {
  question_id: string;
  user_answer: string;
}

export interface ExamReviewState {
  examSession: ExamSession | null;
  questions: Question[];
  examSet: ExamSet | null;
  userAnswers: Record<string, string>;
  loading: boolean;
  currentQuestionIndex: number;
  error: string | null;
}

export class ExamReviewController {
  private examService: ExamService;
  private questionService: QuestionService;
  private state: ExamReviewState;
  private listeners: Array<(state: ExamReviewState) => void> = [];

  constructor() {
    this.examService = new ExamService();
    this.questionService = new QuestionService();
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): ExamReviewState {
    return {
      examSession: null,
      questions: [],
      examSet: null,
      userAnswers: {},
      loading: false,
      currentQuestionIndex: 0,
      error: null,
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: ExamReviewState) => void): () => void {
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
  private setState(updates: Partial<ExamReviewState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): ExamReviewState {
    return { ...this.state };
  }

  /**
   * Fetch exam data for review
   */
  public async fetchExamData(sessionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.setState({ loading: true, error: null });

      // Fetch exam session
      const examSession = await this.examService.getExamSession(sessionId);
      this.setState({ examSession });

      if (!examSession) {
        throw new Error('Exam session not found');
      }

      // Fetch exam set
      const examSet = await this.examService.getExamSet(examSession.exam_set_id);
      this.setState({ examSet });

      // Fetch questions for this exam
      const questions = await this.examService.getExamQuestions(examSession.exam_set_id);
      this.setState({ questions });

      // Fetch user answers
      const attempts = await this.examService.getExamAttempts(sessionId);
      const userAnswers: Record<string, string> = {};
      attempts.forEach(attempt => {
        userAnswers[attempt.question_id] = attempt.user_answer || '';
      });
      this.setState({ userAnswers });

      return { success: true };
    } catch (error: any) {
      console.error('Error fetching exam data:', error);
      this.setState({ 
        error: 'Không thể tải dữ liệu bài thi. Vui lòng thử lại sau.' 
      });
      return {
        success: false,
        error: error.message || 'Failed to fetch exam data'
      };
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Navigate to specific question
   */
  public setCurrentQuestionIndex(index: number): void {
    const maxIndex = this.state.questions.length - 1;
    const clampedIndex = Math.max(0, Math.min(maxIndex, index));
    this.setState({ currentQuestionIndex: clampedIndex });
  }

  /**
   * Navigate to next question
   */
  public goToNextQuestion(): void {
    const nextIndex = this.state.currentQuestionIndex + 1;
    this.setCurrentQuestionIndex(nextIndex);
  }

  /**
   * Navigate to previous question
   */
  public goToPreviousQuestion(): void {
    const prevIndex = this.state.currentQuestionIndex - 1;
    this.setCurrentQuestionIndex(prevIndex);
  }

  /**
   * Get current question
   */
  public getCurrentQuestion(): Question | null {
    return this.state.questions[this.state.currentQuestionIndex] || null;
  }

  /**
   * Get current answer
   */
  public getCurrentAnswer(): string | null {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return null;
    return this.state.userAnswers[currentQuestion.id] || null;
  }

  /**
   * Check if current answer is correct
   */
  public isCurrentAnswerCorrect(): boolean {
    const currentQuestion = this.getCurrentQuestion();
    const currentAnswer = this.getCurrentAnswer();
    if (!currentQuestion || !currentAnswer) return false;
    return currentAnswer === currentQuestion.correct_choice;
  }

  /**
   * Get score color class
   */
  public getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get score badge variant
   */
  public getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  }

  /**
   * Get part color class
   */
  public getPartColor(part: number): string {
    if (part <= 4) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  }

  /**
   * Get part icon component name
   */
  public getPartIcon(part: number): string {
    if (part <= 4) return 'Headphones';
    return 'FileText';
  }

  /**
   * Get total questions count
   */
  public getTotalQuestions(): number {
    return this.state.questions.length;
  }

  /**
   * Get correct answers count
   */
  public getCorrectAnswersCount(): number {
    return this.state.questions.filter(question => {
      const userAnswer = this.state.userAnswers[question.id];
      return userAnswer === question.correct_choice;
    }).length;
  }

  /**
   * Get incorrect answers count
   */
  public getIncorrectAnswersCount(): number {
    return this.getTotalQuestions() - this.getCorrectAnswersCount();
  }

  /**
   * Get questions grouped by part
   */
  public getQuestionsByPart(): Record<number, Array<Question & { originalIndex: number }>> {
    return this.state.questions.reduce((acc, question, index) => {
      const part = question.part;
      if (!acc[part]) {
        acc[part] = [];
      }
      acc[part].push({ ...question, originalIndex: index });
      return acc;
    }, {} as Record<number, Array<Question & { originalIndex: number }>>);
  }

  /**
   * Get questions for current passage (Parts 3, 4, 6, 7)
   */
  public getCurrentPassageQuestions(): Question[] {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion || !currentQuestion.passage_id) return [];
    
    return this.state.questions.filter(q => q.passage_id === currentQuestion.passage_id);
  }

  /**
   * Check if question is answered correctly
   */
  public isQuestionCorrect(questionId: string): boolean {
    const question = this.state.questions.find(q => q.id === questionId);
    const userAnswer = this.state.userAnswers[questionId];
    if (!question || !userAnswer) return false;
    return userAnswer === question.correct_choice;
  }

  /**
   * Get user answer for question
   */
  public getUserAnswer(questionId: string): string | null {
    return this.state.userAnswers[questionId] || null;
  }

  /**
   * Get progress percentage
   */
  public getProgressPercentage(): number {
    const total = this.getTotalQuestions();
    if (total === 0) return 0;
    return ((this.state.currentQuestionIndex + 1) / total) * 100;
  }

  /**
   * Get statistics
   */
  public getStatistics() {
    const total = this.getTotalQuestions();
    const correct = this.getCorrectAnswersCount();
    const incorrect = this.getIncorrectAnswersCount();
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      total,
      correct,
      incorrect,
      score,
      currentIndex: this.state.currentQuestionIndex,
      progress: this.getProgressPercentage()
    };
  }

  /**
   * Check if current question has passage
   */
  public hasCurrentQuestionPassage(): boolean {
    const currentQuestion = this.getCurrentQuestion();
    return currentQuestion ? !!currentQuestion.passage_id : false;
  }

  /**
   * Check if current question has audio
   */
  public hasCurrentQuestionAudio(): boolean {
    const currentQuestion = this.getCurrentQuestion();
    return currentQuestion ? !!currentQuestion.audio_url : false;
  }

  /**
   * Check if current question has image
   */
  public hasCurrentQuestionImage(): boolean {
    const currentQuestion = this.getCurrentQuestion();
    return currentQuestion ? !!currentQuestion.image_url : false;
  }

  /**
   * Get current question passage
   */
  public getCurrentQuestionPassage(): any {
    const currentQuestion = this.getCurrentQuestion();
    return currentQuestion ? (currentQuestion as any).passages : null;
  }

  /**
   * Get passage images
   */
  public getPassageImages(passage: any): string[] {
    if (!passage) return [];

    const images = [];
    
    // Add main image
    if (passage.image_url) {
      images.push(passage.image_url);
    }
    
    // Add additional images from texts.additional
    if (passage.texts?.additional) {
      const additionalImages = passage.texts.additional
        .split('|')
        .map((url: string) => url.trim())
        .filter((url: string) => url && url.startsWith('http'));
      images.push(...additionalImages);
    }

    return images;
  }

  /**
   * Check if can go to next question
   */
  public canGoToNext(): boolean {
    return this.state.currentQuestionIndex < this.state.questions.length - 1;
  }

  /**
   * Check if can go to previous question
   */
  public canGoToPrevious(): boolean {
    return this.state.currentQuestionIndex > 0;
  }

  /**
   * Reset state
   */
  public reset(): void {
    this.setState(this.getInitialState());
  }

  /**
   * Set error
   */
  public setError(error: string | null): void {
    this.setState({ error });
  }

  /**
   * Clear error
   */
  public clearError(): void {
    this.setState({ error: null });
  }
}
