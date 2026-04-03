import { BaseModel } from './BaseModel';
import { Passage, TOEICPart, PassageType } from '@/types';

/**
 * Passage Model với business logic được tách từ components
 * Sử dụng types hiện tại từ @/types
 */
export class PassageModel extends BaseModel {
  public part: TOEICPart;
  public passage_type: PassageType;
  public texts: {
    title?: string;
    content: string;
    additional?: string;
  };
  public audio_url: string | null;
  public assets: {
    images?: string[];
    charts?: string[];
  } | null;
  public meta: {
    word_count?: number;
    reading_time?: number;
    topic?: string;
  } | null;
  public created_by: string | null;

  constructor(data: Passage) {
    super(data);
    this.part = data.part;
    this.passage_type = data.passage_type;
    this.texts = data.texts;
    this.audio_url = data.audio_url;
    this.assets = data.assets;
    this.meta = data.meta;
    this.created_by = data.created_by;
  }

  /**
   * Validate passage data
   */
  validate(): string[] {
    const errors: string[] = [];

    // Required fields validation
    const requiredFields = ['part', 'passage_type', 'texts'];
    errors.push(...this.validateRequired(requiredFields, this));

    // Validate part
    if (![3, 4, 6, 7].includes(this.part)) {
      errors.push('Part must be 3, 4, 6, or 7');
    }

    // Validate passage type
    if (!['single', 'double', 'triple'].includes(this.passage_type)) {
      errors.push('Passage type must be single, double, or triple');
    }

    // Validate texts
    if (!this.texts.content.trim()) {
      errors.push('Passage content is required');
    }

    // Validate content length
    if (this.texts.content.length < 50) {
      errors.push('Passage content must be at least 50 characters');
    }

    // Validate word count
    if (this.meta?.word_count && this.meta.word_count < 10) {
      errors.push('Word count must be at least 10');
    }

    // Validate reading time
    if (this.meta?.reading_time && this.meta.reading_time < 1) {
      errors.push('Reading time must be at least 1 minute');
    }

    // Audio validation for listening parts
    if ([3, 4].includes(this.part) && !this.audio_url) {
      errors.push('Audio URL is required for listening parts (3, 4)');
    }

    return errors;
  }

  /**
   * Check if passage needs audio
   */
  needsAudio(): boolean {
    return [3, 4].includes(this.part);
  }

  /**
   * Get part display name
   */
  getPartDisplayName(): string {
    const partNames = {
      3: 'Part 3: Conversations',
      4: 'Part 4: Talks',
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
   * Calculate word count from content
   */
  calculateWordCount(): number {
    if (!this.texts.content) return 0;
    
    // Simple word count - split by whitespace and filter empty strings
    const words = this.texts.content
      .split(/\s+/)
      .filter(word => word.length > 0);
    
    return words.length;
  }

  /**
   * Calculate reading time in minutes
   */
  calculateReadingTime(): number {
    const wordCount = this.meta?.word_count || this.calculateWordCount();
    // Average reading speed: 200 words per minute
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Update word count and reading time
   */
  updateMeta(): void {
    if (!this.meta) {
      this.meta = {};
    }
    
    this.meta.word_count = this.calculateWordCount();
    this.meta.reading_time = this.calculateReadingTime();
    this.updated_at = new Date().toISOString();
  }

  /**
   * Check if passage is valid for exam
   */
  isValidForExam(): boolean {
    return this.validate().length === 0;
  }

  /**
   * Get passage summary
   */
  getSummary(): string {
    const content = this.texts.content;
    if (content.length <= 100) return content;
    
    return content.substring(0, 100) + '...';
  }

  /**
   * Add image asset
   */
  addImage(imageUrl: string): void {
    if (!this.assets) {
      this.assets = { images: [], charts: [] };
    }
    if (!this.assets.images) {
      this.assets.images = [];
    }
    if (!this.assets.images.includes(imageUrl)) {
      this.assets.images.push(imageUrl);
      this.updated_at = new Date().toISOString();
    }
  }

  /**
   * Add chart asset
   */
  addChart(chartUrl: string): void {
    if (!this.assets) {
      this.assets = { images: [], charts: [] };
    }
    if (!this.assets.charts) {
      this.assets.charts = [];
    }
    if (!this.assets.charts.includes(chartUrl)) {
      this.assets.charts.push(chartUrl);
      this.updated_at = new Date().toISOString();
    }
  }

  /**
   * Remove image asset
   */
  removeImage(imageUrl: string): void {
    if (this.assets?.images) {
      this.assets.images = this.assets.images.filter(img => img !== imageUrl);
      this.updated_at = new Date().toISOString();
    }
  }

  /**
   * Remove chart asset
   */
  removeChart(chartUrl: string): void {
    if (this.assets?.charts) {
      this.assets.charts = this.assets.charts.filter(chart => chart !== chartUrl);
      this.updated_at = new Date().toISOString();
    }
  }
}
