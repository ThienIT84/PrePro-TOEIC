/**
 * ExamSessionController
 * Business logic cho Exam Session Management
 * Extracted từ ExamSession.tsx
 */

import { ExamSet, Question, DrillType } from '@/types';

export interface ExamAnswer {
  questionId: string;
  answer: string;
  timeSpent: number;
  isCorrect: boolean;
}

export interface PassageLite {
  id: string;
  texts: { title?: string; content?: string; additional?: string } | null;
  image_url: string | null;
  audio_url: string | null;
}

export interface ExamSessionState {
  examSet: ExamSet | null;
  questions: Question[];
  currentIndex: number;
  answers: Map<string, ExamAnswer>;
  timeLeft: number;
  isStarted: boolean;
  isPaused: boolean;
  isSubmitted: boolean;
  loading: boolean;
  showSubmitDialog: boolean;
  hasCompleted: boolean;
  refreshKey: number;
  sessionId: string | null;
  passageMap: Record<string, PassageLite>;
  selectedParts: number[] | null;
}

export class ExamSessionController {
  private state: ExamSessionState;
  private listeners: Array<(state: ExamSessionState) => void> = [];
  private timerInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): ExamSessionState {
    return {
      examSet: null,
      questions: [],
      currentIndex: 0,
      answers: new Map(),
      timeLeft: 0,
      isStarted: false,
      isPaused: false,
      isSubmitted: false,
      loading: true,
      showSubmitDialog: false,
      hasCompleted: false,
      refreshKey: 0,
      sessionId: null,
      passageMap: {},
      selectedParts: null,
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: ExamSessionState) => void): () => void {
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
  private setState(updates: Partial<ExamSessionState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): ExamSessionState {
    return { ...this.state };
  }

  /**
   * Set exam set data
   */
  public setExamSet(examSet: ExamSet | null): void {
    this.setState({ examSet });
  }

  /**
   * Set questions data
   */
  public setQuestions(questions: Question[]): void {
    this.setState({ questions });
  }

  /**
   * Set selected parts
   */
  public setSelectedParts(parts: number[] | null): void {
    this.setState({ selectedParts: parts });
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Set has completed state
   */
  public setHasCompleted(hasCompleted: boolean): void {
    this.setState({ hasCompleted });
  }

  /**
   * Set passage map
   */
  public setPassageMap(passageMap: Record<string, PassageLite>): void {
    this.setState({ passageMap });
  }

  /**
   * Set session ID
   */
  public setSessionId(sessionId: string | null): void {
    this.setState({ sessionId });
  }

  /**
   * Set time left
   */
  public setTimeLeft(timeLeft: number): void {
    this.setState({ timeLeft });
  }

  /**
   * Start exam
   */
  public startExam(): void {
    this.setState({ isStarted: true });
    this.startTimer();
  }

  /**
   * Pause/Resume exam
   */
  public pauseExam(): void {
    const isPaused = !this.state.isPaused;
    this.setState({ isPaused });
    
    if (isPaused) {
      this.stopTimer();
    } else {
      this.startTimer();
    }
  }

  /**
   * Start timer
   */
  private startTimer(): void {
    this.stopTimer();
    
    if (this.state.isStarted && !this.state.isPaused && this.state.timeLeft > 0) {
      this.timerInterval = setInterval(() => {
        this.setState({ timeLeft: this.state.timeLeft - 1 });
        
        if (this.state.timeLeft <= 1) {
          this.handleSubmitExam();
        }
      }, 1000);
    }
  }

  /**
   * Stop timer
   */
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Navigate to next question
   */
  public nextQuestion(): void {
    if (this.state.currentIndex < this.state.questions.length - 1) {
      this.setState({ currentIndex: this.state.currentIndex + 1 });
    }
  }

  /**
   * Navigate to previous question
   */
  public previousQuestion(): void {
    if (this.state.currentIndex > 0) {
      this.setState({ currentIndex: this.state.currentIndex - 1 });
    }
  }

  /**
   * Navigate to specific question
   */
  public goToQuestion(index: number): void {
    if (index >= 0 && index < this.state.questions.length) {
      this.setState({ currentIndex: index });
    }
  }

  /**
   * Handle answer change
   */
  public handleAnswerChange(questionId: string, answer: string): void {
    const currentAnswer = this.state.answers.get(questionId);
    const timeSpent = currentAnswer?.timeSpent || 0;
    
    const newAnswers = new Map(this.state.answers);
    newAnswers.set(questionId, {
      questionId,
      answer,
      timeSpent,
      isCorrect: false // Will be calculated on submit
    });
    
    this.setState({ answers: newAnswers });
  }

  /**
   * Show submit dialog
   */
  public showSubmitDialog(): void {
    this.setState({ showSubmitDialog: true });
  }

  /**
   * Hide submit dialog
   */
  public hideSubmitDialog(): void {
    this.setState({ showSubmitDialog: false });
  }

  /**
   * Handle exam submission
   */
  public handleSubmitExam(): void {
    this.setState({ isSubmitted: true });
    this.stopTimer();
  }

  /**
   * Format time in MM:SS format
   */
  public formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Get progress percentage
   */
  public getProgress(): number {
    if (this.state.questions.length === 0) return 0;
    return ((this.state.currentIndex + 1) / this.state.questions.length) * 100;
  }

  /**
   * Get answered count
   */
  public getAnsweredCount(): number {
    return Array.from(this.state.answers.values()).filter(a => a.answer).length;
  }

  /**
   * Get current question
   */
  public getCurrentQuestion(): Question | null {
    return this.state.questions[this.state.currentIndex] || null;
  }

  /**
   * Get current answer
   */
  public getCurrentAnswer(): ExamAnswer | null {
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return null;
    return this.state.answers.get(currentQuestion.id) || null;
  }

  /**
   * Calculate exam results
   */
  public calculateResults(): {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    timeSpent: number;
  } {
    const totalQuestions = this.state.questions.length;
    const correctAnswers = Array.from(this.state.answers.values()).filter(a => a.isCorrect).length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const timeSpent = (this.state.examSet?.time_limit || 0) * 60 - this.state.timeLeft;

    return {
      totalQuestions,
      correctAnswers,
      score,
      timeSpent
    };
  }

  /**
   * Get question by index
   */
  public getQuestionByIndex(index: number): Question | null {
    return this.state.questions[index] || null;
  }

  /**
   * Get answer by question ID
   */
  public getAnswerByQuestionId(questionId: string): ExamAnswer | null {
    return this.state.answers.get(questionId) || null;
  }

  /**
   * Get passage by ID
   */
  public getPassageById(passageId: string): PassageLite | null {
    return this.state.passageMap[passageId] || null;
  }

  /**
   * Check if question is answered
   */
  public isQuestionAnswered(questionId: string): boolean {
    const answer = this.state.answers.get(questionId);
    return answer ? Boolean(answer.answer) : false;
  }

  /**
   * Check if exam is completed
   */
  public isExamCompleted(): boolean {
    return this.state.isSubmitted;
  }

  /**
   * Check if exam is started
   */
  public isExamStarted(): boolean {
    return this.state.isStarted;
  }

  /**
   * Check if exam is paused
   */
  public isExamPaused(): boolean {
    return this.state.isPaused;
  }

  /**
   * Check if exam is loading
   */
  public isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Check if user has completed exam
   */
  public hasCompleted(): boolean {
    return this.state.hasCompleted;
  }

  /**
   * Get exam statistics
   */
  public getExamStatistics(): {
    totalQuestions: number;
    answeredQuestions: number;
    unansweredQuestions: number;
    progress: number;
    timeLeft: number;
    timeSpent: number;
  } {
    const totalQuestions = this.state.questions.length;
    const answeredQuestions = this.getAnsweredCount();
    const unansweredQuestions = totalQuestions - answeredQuestions;
    const progress = this.getProgress();
    const timeLeft = this.state.timeLeft;
    const timeSpent = (this.state.examSet?.time_limit || 0) * 60 - timeLeft;

    return {
      totalQuestions,
      answeredQuestions,
      unansweredQuestions,
      progress,
      timeLeft,
      timeSpent
    };
  }

  /**
   * Reset exam session
   */
  public resetExamSession(): void {
    this.stopTimer();
    this.setState(this.getInitialState());
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.stopTimer();
    this.listeners = [];
  }
}
