import { BaseModel } from './BaseModel';
import { ExamSet, DrillType, Difficulty } from '@/types';

/**
 * ExamSet Model với business logic được tách từ components
 * Sử dụng types hiện tại từ @/types
 */
export class ExamSetModel extends BaseModel {
  public title: string;
  public description: string | null;
  public type: DrillType;
  public difficulty: Difficulty;
  public question_count: number;
  public time_limit: number;
  public is_active: boolean;
  public created_by: string;

  constructor(data: ExamSet) {
    super(data);
    this.title = data.title;
    this.description = data.description;
    this.type = data.type;
    this.difficulty = data.difficulty;
    this.question_count = data.question_count;
    this.time_limit = data.time_limit;
    this.is_active = data.is_active;
    this.created_by = data.created_by;
  }

  /**
   * Validate exam set data
   */
  validate(): string[] {
    const errors: string[] = [];

    // Required fields validation
    const requiredFields = ['title', 'type', 'difficulty', 'question_count', 'time_limit'];
    errors.push(...this.validateRequired(requiredFields, this));

    // Validate title length
    if (this.title.length < 3) {
      errors.push('Title must be at least 3 characters');
    }
    if (this.title.length > 100) {
      errors.push('Title must be no more than 100 characters');
    }

    // Validate type
    if (!['vocab', 'grammar', 'listening', 'reading', 'mix'].includes(this.type)) {
      errors.push('Type must be vocab, grammar, listening, reading, or mix');
    }

    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(this.difficulty)) {
      errors.push('Difficulty must be easy, medium, or hard');
    }

    // Validate question count
    if (this.question_count < 1) {
      errors.push('Question count must be at least 1');
    }
    if (this.question_count > 200) {
      errors.push('Question count must be no more than 200');
    }

    // Validate time limit
    if (this.time_limit < 1) {
      errors.push('Time limit must be at least 1 minute');
    }
    if (this.time_limit > 300) {
      errors.push('Time limit must be no more than 300 minutes');
    }

    return errors;
  }

  /**
   * Get type display name
   */
  getTypeDisplayName(): string {
    const typeNames = {
      'vocab': 'Vocabulary',
      'grammar': 'Grammar',
      'listening': 'Listening',
      'reading': 'Reading',
      'mix': 'Mixed'
    };
    return typeNames[this.type] || this.type;
  }

  /**
   * Get difficulty display name
   */
  getDifficultyDisplayName(): string {
    const difficultyNames = {
      'easy': 'Easy',
      'medium': 'Medium',
      'hard': 'Hard'
    };
    return difficultyNames[this.difficulty] || this.difficulty;
  }

  /**
   * Get difficulty score (1-3)
   */
  getDifficultyScore(): number {
    const difficultyScores = {
      'easy': 1,
      'medium': 2,
      'hard': 3
    };
    return difficultyScores[this.difficulty] || 2;
  }

  /**
   * Calculate estimated time per question
   */
  getTimePerQuestion(): number {
    if (this.question_count === 0) return 0;
    return Math.round(this.time_limit / this.question_count);
  }

  /**
   * Check if exam set is valid for use
   */
  isValidForUse(): boolean {
    return this.validate().length === 0 && this.is_active;
  }

  /**
   * Check if exam set is TOEIC type
   */
  isTOEICType(): boolean {
    return this.type === 'mix' || this.type === 'listening' || this.type === 'reading';
  }

  /**
   * Get exam set summary
   */
  getSummary(): string {
    const timePerQuestion = this.getTimePerQuestion();
    return `${this.question_count} questions • ${this.time_limit} minutes • ${timePerQuestion} min/question`;
  }

  /**
   * Activate exam set
   */
  activate(): void {
    this.is_active = true;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Deactivate exam set
   */
  deactivate(): void {
    this.is_active = false;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Update question count
   */
  updateQuestionCount(count: number): void {
    if (count >= 0 && count <= 200) {
      this.question_count = count;
      this.updated_at = new Date().toISOString();
    }
  }

  /**
   * Update time limit
   */
  updateTimeLimit(minutes: number): void {
    if (minutes >= 1 && minutes <= 300) {
      this.time_limit = minutes;
      this.updated_at = new Date().toISOString();
    }
  }

  /**
   * Get time limit in hours and minutes
   */
  getTimeLimitDisplay(): string {
    const hours = Math.floor(this.time_limit / 60);
    const minutes = this.time_limit % 60;
    
    if (hours === 0) {
      return `${minutes} minutes`;
    } else if (minutes === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Check if exam set is suitable for target score
   */
  isSuitableForScore(targetScore: number): boolean {
    const difficultyScores = {
      'easy': 400,
      'medium': 600,
      'hard': 800
    };
    
    const minScore = difficultyScores[this.difficulty] || 400;
    const maxScore = minScore + 200;
    
    return targetScore >= minScore && targetScore <= maxScore;
  }
}
