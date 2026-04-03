import { BaseModel } from './BaseModel';
import { Profile, AppRole } from '@/types';

/**
 * User Model với business logic được tách từ components
 * Sử dụng types hiện tại từ @/types
 */
export class UserModel extends BaseModel {
  public user_id: string;
  public name: string | null;
  public role: AppRole;
  public target_score: number;
  public test_date: string | null;
  public locales: string;
  public focus: string[];

  constructor(data: Profile) {
    super(data);
    this.user_id = data.user_id;
    this.name = data.name;
    this.role = data.role;
    this.target_score = data.target_score;
    this.test_date = data.test_date;
    this.locales = data.locales;
    this.focus = data.focus;
  }

  /**
   * Validate user data
   */
  validate(): string[] {
    const errors: string[] = [];

    // Required fields validation
    const requiredFields = ['user_id', 'role', 'target_score', 'locales'];
    errors.push(...this.validateRequired(requiredFields, this));

    // Validate role
    if (!['student', 'teacher'].includes(this.role)) {
      errors.push('Role must be student or teacher');
    }

    // Validate target score
    if (this.target_score < 0 || this.target_score > 990) {
      errors.push('Target score must be between 0 and 990');
    }

    // Validate locales
    if (!this.locales.trim()) {
      errors.push('Locales is required');
    }

    // Validate test date format if provided
    if (this.test_date && !this.isValidDate(this.test_date)) {
      errors.push('Test date must be in valid date format');
    }

    // Validate focus areas
    if (this.focus && !Array.isArray(this.focus)) {
      errors.push('Focus must be an array');
    }

    return errors;
  }

  /**
   * Check if date is valid
   */
  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Get role display name
   */
  getRoleDisplayName(): string {
    const roleNames = {
      'student': 'Student',
      'teacher': 'Teacher'
    };
    return roleNames[this.role] || this.role;
  }

  /**
   * Check if user is student
   */
  isStudent(): boolean {
    return this.role === 'student';
  }

  /**
   * Check if user is teacher
   */
  isTeacher(): boolean {
    return this.role === 'teacher';
  }

  /**
   * Get target score level
   */
  getTargetScoreLevel(): string {
    if (this.target_score >= 900) return 'Advanced';
    if (this.target_score >= 700) return 'Intermediate';
    if (this.target_score >= 500) return 'Beginner';
    return 'Starter';
  }

  /**
   * Get days until test
   */
  getDaysUntilTest(): number | null {
    if (!this.test_date) return null;
    
    const testDate = new Date(this.test_date);
    const today = new Date();
    const diffTime = testDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Check if test is coming soon (within 30 days)
   */
  isTestComingSoon(): boolean {
    const daysUntilTest = this.getDaysUntilTest();
    return daysUntilTest !== null && daysUntilTest <= 30 && daysUntilTest >= 0;
  }

  /**
   * Check if test has passed
   */
  hasTestPassed(): boolean {
    const daysUntilTest = this.getDaysUntilTest();
    return daysUntilTest !== null && daysUntilTest < 0;
  }

  /**
   * Get user level based on target score
   */
  getUserLevel(): 'Beginner' | 'Intermediate' | 'Advanced' {
    if (this.target_score >= 800) return 'Advanced';
    if (this.target_score >= 600) return 'Intermediate';
    return 'Beginner';
  }

  /**
   * Add focus area
   */
  addFocusArea(area: string): void {
    if (!this.focus.includes(area)) {
      this.focus.push(area);
      this.updated_at = new Date().toISOString();
    }
  }

  /**
   * Remove focus area
   */
  removeFocusArea(area: string): void {
    this.focus = this.focus.filter(f => f !== area);
    this.updated_at = new Date().toISOString();
  }

  /**
   * Update target score
   */
  updateTargetScore(score: number): void {
    if (score >= 0 && score <= 990) {
      this.target_score = score;
      this.updated_at = new Date().toISOString();
    }
  }

  /**
   * Update test date
   */
  updateTestDate(date: string | null): void {
    if (date === null || this.isValidDate(date)) {
      this.test_date = date;
      this.updated_at = new Date().toISOString();
    }
  }

  /**
   * Get user summary
   */
  getSummary(): string {
    const level = this.getUserLevel();
    const daysUntilTest = this.getDaysUntilTest();
    
    let summary = `${this.getRoleDisplayName()} • ${level} (${this.target_score} target)`;
    
    if (daysUntilTest !== null) {
      if (daysUntilTest > 0) {
        summary += ` • Test in ${daysUntilTest} days`;
      } else if (daysUntilTest === 0) {
        summary += ` • Test today`;
      } else {
        summary += ` • Test passed`;
      }
    }
    
    return summary;
  }

  /**
   * Check if user has focus area
   */
  hasFocusArea(area: string): boolean {
    return this.focus.includes(area);
  }

  /**
   * Get focus areas display
   */
  getFocusAreasDisplay(): string {
    if (this.focus.length === 0) return 'None';
    return this.focus.join(', ');
  }

  /**
   * Check if user profile is complete
   */
  isProfileComplete(): boolean {
    return !!(
      this.name &&
      this.name.trim() &&
      this.target_score > 0 &&
      this.test_date &&
      this.focus.length > 0
    );
  }

  /**
   * Get profile completion percentage
   */
  getProfileCompletionPercentage(): number {
    let completed = 0;
    const total = 5;
    
    if (this.name && this.name.trim()) completed++;
    if (this.target_score > 0) completed++;
    if (this.test_date) completed++;
    if (this.focus.length > 0) completed++;
    if (this.locales && this.locales.trim()) completed++;
    
    return Math.round((completed / total) * 100);
  }
}
