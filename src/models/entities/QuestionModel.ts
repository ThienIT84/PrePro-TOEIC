import { BaseModel } from './BaseModel';
import { Question, TOEICPart, Difficulty, CorrectChoice, QuestionStatus } from '@/types';

/**
 * Question Model với business logic được tách từ components
 * Sử dụng types hiện tại từ @/types
 */
export class QuestionModel extends BaseModel {
  public part: TOEICPart;
  public passage_id: string | null;
  public blank_index: number | null;
  public prompt_text: string;
  public choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  public correct_choice: CorrectChoice;
  public explain_vi: string;
  public explain_en: string;
  public tags: string[];
  public difficulty: Difficulty;
  public status: QuestionStatus;
  public image_url: string | null;
  public audio_url: string | null;
  public transcript: string | null;
  public created_by: string | null;

  constructor(data: Question) {
    super(data);
    this.part = data.part;
    this.passage_id = data.passage_id;
    this.blank_index = data.blank_index;
    this.prompt_text = data.prompt_text;
    this.choices = data.choices;
    this.correct_choice = data.correct_choice;
    this.explain_vi = data.explain_vi;
    this.explain_en = data.explain_en;
    this.tags = data.tags;
    this.difficulty = data.difficulty;
    this.status = data.status;
    this.image_url = data.image_url;
    this.audio_url = data.audio_url;
    this.transcript = data.transcript;
    this.created_by = data.created_by;
  }

  /**
   * Validate question data
   */
  validate(): string[] {
    const errors: string[] = [];

    // Required fields validation
    const requiredFields = ['part', 'correct_choice', 'explain_vi', 'explain_en'];
    errors.push(...this.validateRequired(requiredFields, this));

    // Part-specific validation
    if (this.part === 1) {
      // Part 1: Photos - choices are optional, just need correct answer
      if (!this.image_url) {
        errors.push('Image URL is required for Part 1');
      }
    } else if (this.part === 2) {
      // Part 2: Question-Response - choices are optional, just need correct answer (A, B, or C)
      if (!['A', 'B', 'C'].includes(this.correct_choice)) {
        errors.push('Correct choice for Part 2 must be A, B, or C');
      }
    } else {
      // Parts 3-7: Require meaningful choices
      if (!this.choices.A.trim() || !this.choices.B.trim()) {
        errors.push('At least choices A and B are required for Parts 3-7');
      }

      // Check for meaningful content in choices
      const meaningfulChoices = [this.choices.A, this.choices.B].filter(
        choice => choice.trim().length > 0 && /[a-zA-ZÀ-ỹ0-9]/.test(choice.trim())
      );
      
      if (meaningfulChoices.length < 2) {
        errors.push('Choices A and B must have meaningful content');
      }

      // Parts 3, 4, 6, 7 need passage
      if ([3, 4, 6, 7].includes(this.part) && !this.passage_id) {
        errors.push('Passage ID is required for Parts 3, 4, 6, and 7');
      }

      // Part 6 needs blank_index
      if (this.part === 6 && !this.blank_index) {
        errors.push('Blank index is required for Part 6');
      }
    }

    // Explanation validation
    if (!this.explain_vi.trim() || !this.explain_en.trim()) {
      errors.push('Both Vietnamese and English explanations are required');
    }

    // Check for meaningful explanations
    const hasMeaningfulExplainVi = /[a-zA-ZÀ-ỹ0-9]/.test(this.explain_vi.trim());
    const hasMeaningfulExplainEn = /[a-zA-ZÀ-ỹ0-9]/.test(this.explain_en.trim());
    
    if (!hasMeaningfulExplainVi || !hasMeaningfulExplainEn) {
      errors.push('Explanations must have meaningful content');
    }

    // Audio validation for listening parts
    if ([1, 2, 3, 4].includes(this.part) && !this.audio_url) {
      errors.push('Audio URL is required for listening parts (1, 2, 3, 4)');
    }

    return errors;
  }

  /**
   * Check if question needs passage
   */
  needsPassage(): boolean {
    return [3, 4, 6, 7].includes(this.part);
  }

  /**
   * Check if question needs audio
   */
  needsAudio(): boolean {
    return [1, 2, 3, 4].includes(this.part);
  }

  /**
   * Check if question needs image
   */
  needsImage(): boolean {
    return this.part === 1;
  }

  /**
   * Get part display name
   */
  getPartDisplayName(): string {
    const partNames = {
      1: 'Part 1: Photos',
      2: 'Part 2: Question-Response',
      3: 'Part 3: Conversations',
      4: 'Part 4: Talks',
      5: 'Part 5: Incomplete Sentences',
      6: 'Part 6: Text Completion',
      7: 'Part 7: Reading Comprehension'
    };
    return partNames[this.part] || `Part ${this.part}`;
  }

  /**
   * Get part type (listening/reading)
   */
  getPartType(): 'listening' | 'reading' {
    return this.part <= 4 ? 'listening' : 'reading';
  }

  /**
   * Calculate estimated time for question
   */
  getEstimatedTime(): number {
    const timePerPart = {
      1: 5,   // 5 seconds per photo
      2: 8,   // 8 seconds per question-response
      3: 15,  // 15 seconds per conversation
      4: 17,  // 17 seconds per talk
      5: 20,  // 20 seconds per sentence
      6: 12,  // 12 seconds per text completion
      7: 43   // 43 seconds per reading comprehension
    };
    return timePerPart[this.part] || 10;
  }

  /**
   * Check if question is valid for exam
   */
  isValidForExam(): boolean {
    return this.validate().length === 0 && this.status === 'published';
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
   * Update question status
   */
  updateStatus(status: QuestionStatus): void {
    this.status = status;
    this.updated_at = new Date().toISOString();
  }

  /**
   * Add tag
   */
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updated_at = new Date().toISOString();
    }
  }

  /**
   * Remove tag
   */
  removeTag(tag: string): void {
    this.tags = this.tags.filter(t => t !== tag);
    this.updated_at = new Date().toISOString();
  }
}
