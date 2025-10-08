// Mock services for now
const mockExamService = {
  getExamSessions: async (sessionId: string) => ({ data: [], error: null }),
  getExamSets: async (examSetId: string) => ({ data: [], error: null }),
  getExamSetQuestions: async (sessionId: string) => ({ data: [], error: null })
};

const mockQuestionService = {
  getAllQuestions: async () => ({ data: [], error: null })
};

import { ExamSet, Question, Passage } from '@/types';

export interface ExamSession {
  id: string;
  exam_set_id: string;
  user_id: string;
  started_at: string;
  completed_at?: string;
  total_time: number;
  score?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  exam_sets?: ExamSet;
}

export interface UserAnswer {
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  time_spent: number;
}

export interface QuestionReview {
  question: Question;
  userAnswer: UserAnswer | null;
  isCorrect: boolean;
  timeSpent: number;
  explanation: string;
}

export interface ExamStatistics {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredQuestions: number;
  accuracy: number;
  totalTime: number;
  averageTimePerQuestion: number;
  partBreakdown: Record<number, {
    total: number;
    correct: number;
    accuracy: number;
  }>;
}

export interface ExamReviewState {
  examSession: ExamSession | null;
  examSet: ExamSet | null;
  questions: Question[];
  questionReviews: QuestionReview[];
  userAnswers: Record<string, UserAnswer>;
  currentQuestionIndex: number;
  loading: boolean;
  error: string | null;
  statistics: ExamStatistics | null;
}

export class ExamReviewController {
  private examService: any;
  private questionService: any;
  private state: ExamReviewState;

  constructor() {
    this.examService = mockExamService;
    this.questionService = mockQuestionService;
    this.state = this.getInitialState();
  }

  // Initial State
  private getInitialState(): ExamReviewState {
    return {
      examSession: null,
      examSet: null,
      questions: [],
      questionReviews: [],
      userAnswers: {},
      currentQuestionIndex: 0,
      loading: false,
      error: null,
      statistics: null
    };
  }

  // State Management
  getState(): ExamReviewState {
    return { ...this.state };
  }

  updateState(updates: Partial<ExamReviewState>): void {
    this.state = { ...this.state, ...updates };
  }

  // Data Loading
  async loadExamData(sessionId: string): Promise<void> {
    try {
      this.updateState({ loading: true, error: null });

      // Load exam session
      const examSessionResult = await this.examService.getExamSessions(sessionId);
      const examSession = examSessionResult.data?.[0] || null;
      this.updateState({ examSession });

      // Load exam set
      if (examSession?.exam_set_id) {
        const examSetResult = await this.examService.getExamSets(examSession.exam_set_id);
        const examSet = examSetResult.data?.[0] || null;
        this.updateState({ examSet });
      }

      // Load questions
      const questionsResult = await this.examService.getExamSetQuestions(sessionId);
      const questions = questionsResult.data || [];
      this.updateState({ questions });

      // Load user answers
      const userAnswersResult = await this.examService.getExamSessions(sessionId);
      const userAnswers = userAnswersResult.data || {};
      this.updateState({ userAnswers });

      // Generate question reviews
      const questionReviews = this.generateQuestionReviews(questions, userAnswers);
      this.updateState({ questionReviews });

      // Calculate statistics
      const statistics = this.calculateStatistics(questionReviews, examSession as any);
      this.updateState({ statistics });

      this.updateState({ loading: false });
    } catch (error: any) {
      this.updateState({ 
        loading: false, 
        error: error?.message || 'An error occurred'
      });
      throw error;
    }
  }

  // Question Navigation
  setCurrentQuestionIndex(index: number): void {
    if (index >= 0 && index < this.state.questions.length) {
      this.updateState({ currentQuestionIndex: index });
    }
  }

  goToNextQuestion(): void {
    const nextIndex = this.state.currentQuestionIndex + 1;
    if (nextIndex < this.state.questions.length) {
    this.setCurrentQuestionIndex(nextIndex);
    }
  }

  goToPreviousQuestion(): void {
    const prevIndex = this.state.currentQuestionIndex - 1;
    if (prevIndex >= 0) {
    this.setCurrentQuestionIndex(prevIndex);
  }
  }

  goToQuestion(questionIndex: number): void {
    this.setCurrentQuestionIndex(questionIndex);
  }

  // Question Review Generation
  private generateQuestionReviews(questions: Question[], userAnswers: Record<string, UserAnswer>): QuestionReview[] {
    return questions.map(question => {
      const userAnswer = userAnswers[question.id];
      const isCorrect = userAnswer ? userAnswer.is_correct : false;
      const timeSpent = userAnswer ? userAnswer.time_spent : 0;
      const explanation = this.generateExplanation(question, userAnswer);

      return {
        question,
        userAnswer,
        isCorrect,
        timeSpent,
        explanation
      };
    });
  }

  private generateExplanation(question: Question, userAnswer: UserAnswer | null): string {
    if (!userAnswer) {
      return 'Question was not answered.';
    }

    if (userAnswer.is_correct) {
      return `Correct! ${question.explain_vi || question.explain_en || 'Well done!'}`;
    } else {
      const correctAnswer = question.correct_choice;
      const userAnswerChoice = userAnswer.user_answer;
      return `Incorrect. The correct answer is ${correctAnswer}. Your answer was ${userAnswerChoice}. ${question.explain_vi || question.explain_en || 'Please review the explanation.'}`;
    }
  }

  // Statistics Calculation
  private calculateStatistics(questionReviews: QuestionReview[], examSession: ExamSession): ExamStatistics {
    const totalQuestions = questionReviews.length;
    const correctAnswers = questionReviews.filter(review => review.isCorrect).length;
    const incorrectAnswers = questionReviews.filter(review => review.userAnswer && !review.isCorrect).length;
    const unansweredQuestions = questionReviews.filter(review => !review.userAnswer).length;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const totalTime = examSession.total_time || 0;
    const averageTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;

    // Part breakdown
    const partBreakdown: Record<number, { total: number; correct: number; accuracy: number }> = {};
    questionReviews.forEach(review => {
      const part = review.question.part;
      if (!partBreakdown[part]) {
        partBreakdown[part] = { total: 0, correct: 0, accuracy: 0 };
      }
      partBreakdown[part].total++;
      if (review.isCorrect) {
        partBreakdown[part].correct++;
      }
    });

    // Calculate accuracy for each part
    Object.keys(partBreakdown).forEach(part => {
      const partData = partBreakdown[parseInt(part)];
      partData.accuracy = partData.total > 0 ? (partData.correct / partData.total) * 100 : 0;
    });

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unansweredQuestions,
      accuracy,
      totalTime,
      averageTimePerQuestion,
      partBreakdown
    };
  }

  // Audio Management
  getAudioUrl(question: Question): string | null {
    if (question.audio_url) {
      return question.audio_url;
    }

    // Check if question has associated passage with audio
    if (question.passage_id && (question as any).passage) {
      return (question as any).passage.audio_url || null;
    }

    return null;
  }

  // Question Analysis
  getQuestionAnalysis(question: Question): {
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'listening' | 'reading';
    skills: string[];
  } {
    const part = question.part;
    const isListening = part >= 1 && part <= 4;
    const isReading = part >= 5 && part <= 7;

    const skills: string[] = [];
    if (isListening) {
      skills.push('Listening');
      if (part === 1) skills.push('Visual Description');
      if (part === 2) skills.push('Question Response');
      if (part === 3) skills.push('Conversation');
      if (part === 4) skills.push('Talk');
    } else if (isReading) {
      skills.push('Reading');
      if (part === 5) skills.push('Grammar');
      if (part === 6) skills.push('Text Completion');
      if (part === 7) skills.push('Reading Comprehension');
    }

    return {
      difficulty: question.difficulty,
      type: isListening ? 'listening' : 'reading',
      skills
    };
  }

  // Performance Analysis
  getPerformanceAnalysis(): {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  } {
    if (!this.state.statistics) {
      return { strengths: [], weaknesses: [], recommendations: [] };
    }

    const { partBreakdown, accuracy } = this.state.statistics;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze part performance
    Object.entries(partBreakdown).forEach(([part, data]) => {
      const partName = this.getPartName(parseInt(part));
      if (data.accuracy >= 80) {
        strengths.push(`${partName} (${data.accuracy.toFixed(1)}%)`);
      } else if (data.accuracy < 60) {
        weaknesses.push(`${partName} (${data.accuracy.toFixed(1)}%)`);
      }
    });

    // Generate recommendations
    if (accuracy < 60) {
      recommendations.push('Focus on fundamental grammar and vocabulary');
    } else if (accuracy < 80) {
      recommendations.push('Practice more TOEIC-specific question types');
    } else {
      recommendations.push('Continue practicing to maintain high performance');
    }

    if (weaknesses.length > 0) {
      recommendations.push(`Focus on improving: ${weaknesses.join(', ')}`);
    }

    return { strengths, weaknesses, recommendations };
  }

  private getPartName(part: number): string {
    const partNames = {
      1: 'Part 1: Photos',
      2: 'Part 2: Question-Response',
      3: 'Part 3: Conversations',
      4: 'Part 4: Talks',
      5: 'Part 5: Incomplete Sentences',
      6: 'Part 6: Text Completion',
      7: 'Part 7: Reading Comprehension'
    };
    return partNames[part] || `Part ${part}`;
  }

  // Utility Methods
  getCurrentQuestion(): Question | null {
    if (this.state.questions.length === 0) return null;
    return this.state.questions[this.state.currentQuestionIndex];
  }

  getCurrentQuestionReview(): QuestionReview | null {
    if (this.state.questionReviews.length === 0) return null;
    return this.state.questionReviews[this.state.currentQuestionIndex];
  }

  getQuestionByIndex(index: number): Question | null {
    if (index < 0 || index >= this.state.questions.length) return null;
    return this.state.questions[index];
  }

  getQuestionReviewByIndex(index: number): QuestionReview | null {
    if (index < 0 || index >= this.state.questionReviews.length) return null;
    return this.state.questionReviews[index];
  }

  // Error Management
  clearError(): void {
    this.updateState({ error: null });
  }

  resetState(): void {
    this.state = this.getInitialState();
  }
}