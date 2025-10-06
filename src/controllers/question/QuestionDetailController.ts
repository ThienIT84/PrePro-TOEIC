import { QuestionModel } from '@/models/entities';
import { TOEICPart, Difficulty } from '@/types';

/**
 * QuestionDetail Controller - Xử lý business logic cho QuestionDetailModal
 * Tách business logic khỏi UI component
 */
export class QuestionDetailController {
  private question: QuestionModel | null = null;
  private isOpen: boolean = false;

  // Event callbacks
  private onQuestionChange?: (question: QuestionModel | null) => void;
  private onOpenChange?: (isOpen: boolean) => void;

  constructor() {
    // Initialize controller
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: {
    onQuestionChange?: (question: QuestionModel | null) => void;
    onOpenChange?: (isOpen: boolean) => void;
  }) {
    this.onQuestionChange = callbacks.onQuestionChange;
    this.onOpenChange = callbacks.onOpenChange;
  }

  /**
   * Get current question
   */
  getQuestion(): QuestionModel | null {
    return this.question;
  }

  /**
   * Get open state
   */
  getIsOpen(): boolean {
    return this.isOpen;
  }

  /**
   * Set question and notify
   */
  private setQuestion(question: QuestionModel | null): void {
    this.question = question;
    this.onQuestionChange?.(question);
  }

  /**
   * Set open state and notify
   */
  private setIsOpen(isOpen: boolean): void {
    this.isOpen = isOpen;
    this.onOpenChange?.(isOpen);
  }

  /**
   * Open modal with question
   */
  openModal(question: QuestionModel): void {
    this.setQuestion(question);
    this.setIsOpen(true);
  }

  /**
   * Close modal
   */
  closeModal(): void {
    this.setIsOpen(false);
    // Keep question data for potential reopening
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.setQuestion(null);
    this.setIsOpen(false);
  }

  /**
   * Get type label for display
   */
  getTypeLabel(type: string): string {
    const labels = {
      'Part 1: Photos': 'Hình ảnh',
      'Part 2: Question-Response': 'Hỏi đáp',
      'Part 3: Conversations': 'Hội thoại',
      'Part 4: Talks': 'Bài nói',
      'Part 5: Incomplete Sentences': 'Hoàn thành câu',
      'Part 6: Text Completion': 'Hoàn thành đoạn văn',
      'Part 7: Reading Comprehension': 'Đọc hiểu'
    };
    return labels[type as keyof typeof labels] || type;
  }

  /**
   * Get difficulty label for display
   */
  getDifficultyLabel(difficulty: Difficulty): string {
    const labels = {
      easy: 'Dễ',
      medium: 'Trung bình',
      hard: 'Khó'
    };
    return labels[difficulty] || difficulty;
  }

  /**
   * Get difficulty color class
   */
  getDifficultyColor(difficulty: Difficulty): string {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Play audio
   */
  playAudio(audioUrl: string): void {
    try {
      const audio = new Audio(audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        // Could emit error event here
      });
    } catch (error) {
      console.error('Error creating audio:', error);
      // Could emit error event here
    }
  }

  /**
   * Check if question has audio
   */
  hasAudio(): boolean {
    return this.question?.needsAudio() && !!this.question?.audio_url;
  }

  /**
   * Check if question has transcript
   */
  hasTranscript(): boolean {
    return !!this.question?.transcript;
  }

  /**
   * Check if question has explanations
   */
  hasExplanations(): boolean {
    return !!(this.question?.explain_vi || this.question?.explain_en);
  }

  /**
   * Check if question has tags
   */
  hasTags(): boolean {
    return !!(this.question?.tags && this.question.tags.length > 0);
  }

  /**
   * Get question summary
   */
  getQuestionSummary(): string {
    if (!this.question) return '';
    
    const part = this.question.getPartDisplayName();
    const difficulty = this.getDifficultyLabel(this.question.difficulty);
    const time = this.question.getEstimatedTime();
    
    return `${part} • ${difficulty} • ${time}s`;
  }

  /**
   * Get question requirements
   */
  getQuestionRequirements(): string[] {
    if (!this.question) return [];
    
    const requirements: string[] = [];
    
    if (this.question.needsAudio()) {
      requirements.push('Cần audio');
    }
    if (this.question.needsImage()) {
      requirements.push('Cần hình ảnh');
    }
    if (this.question.needsPassage()) {
      requirements.push('Cần đoạn văn');
    }
    
    return requirements;
  }

  /**
   * Check if question is valid for exam
   */
  isQuestionValidForExam(): boolean {
    return this.question?.isValidForExam() || false;
  }

  /**
   * Get question difficulty score
   */
  getQuestionDifficultyScore(): number {
    return this.question?.getDifficultyScore() || 0;
  }

  /**
   * Get question part type
   */
  getQuestionPartType(): 'listening' | 'reading' | null {
    return this.question?.getPartType() || null;
  }

  /**
   * Get question part number
   */
  getQuestionPartNumber(): TOEICPart | null {
    return this.question?.part || null;
  }

  /**
   * Get question status
   */
  getQuestionStatus(): string {
    return this.question?.status || '';
  }

  /**
   * Get question created date
   */
  getQuestionCreatedDate(): string {
    if (!this.question) return '';
    
    const date = new Date(this.question.created_at);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get question updated date
   */
  getQuestionUpdatedDate(): string {
    if (!this.question) return '';
    
    const date = new Date(this.question.updated_at);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
