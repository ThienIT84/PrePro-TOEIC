/**
 * QuestionCreatorController
 * Business logic cho TOEIC Question Creator
 * Extracted từ TOEICQuestionCreator.tsx
 */

import { QuestionModel } from '@/models/entities/QuestionModel';
import { PassageModel } from '@/models/entities/PassageModel';
import { QuestionService } from '@/services/domains/question/QuestionService';
import { PassageService } from '@/services/domains/exam/ExamService';
import { TOEICPart, Difficulty, CorrectChoice, PassageType } from '@/types';
import { isAudioRequired, usesIndividualAudio, usesPassageAudio } from '@/utils/audioUtils';

export interface QuestionFormData {
  part: TOEICPart;
  difficulty: Difficulty;
  prompt_text: string;
  choices: { A: string; B: string; C: string; D: string };
  correct_choice: CorrectChoice;
  explain_vi: string;
  explain_en: string;
  tags: string[];
  blank_index: number | null;
  image_url: string;
  audio_url: string;
}

export interface PassageFormData {
  part: TOEICPart;
  passage_type: PassageType;
  texts: { title: string; content: string; additional: string };
  audio_url: string;
  assets: { images: string[]; charts: string[] };
  meta: { word_count: number; reading_time: number; topic: string };
}

export interface QuestionCreatorState {
  questionData: QuestionFormData;
  passageData: PassageFormData;
  loading: boolean;
  activeTab: 'question' | 'passage';
  passages: any[];
  selectedPassageId: string | null;
  newTag: string;
  errors: string[];
}

export class QuestionCreatorController {
  private questionService: QuestionService;
  private passageService: any; // Will be created later
  private state: QuestionCreatorState;
  private listeners: Array<(state: QuestionCreatorState) => void> = [];

  constructor() {
    this.questionService = new QuestionService();
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): QuestionCreatorState {
    return {
      questionData: {
        part: 1 as TOEICPart,
        difficulty: 'medium' as Difficulty,
        prompt_text: '',
        choices: { A: '', B: '', C: '', D: '' },
        correct_choice: 'A' as CorrectChoice,
        explain_vi: '',
        explain_en: '',
        tags: [],
        blank_index: null,
        image_url: '',
        audio_url: '',
      },
      passageData: {
        part: 3 as TOEICPart,
        passage_type: 'single' as PassageType,
        texts: { title: '', content: '', additional: '' },
        audio_url: '',
        assets: { images: [], charts: [] },
        meta: { word_count: 0, reading_time: 0, topic: '' },
      },
      loading: false,
      activeTab: 'question',
      passages: [],
      selectedPassageId: null,
      newTag: '',
      errors: [],
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: QuestionCreatorState) => void): () => void {
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
  private setState(updates: Partial<QuestionCreatorState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): QuestionCreatorState {
    return { ...this.state };
  }

  /**
   * Get TOEIC part information
   */
  public getToeicPartInfo() {
    return {
      1: { name: 'Part 1: Photos', description: 'Mô tả hình ảnh', icon: '📷', needsPassage: false },
      2: { name: 'Part 2: Question-Response', description: 'Hỏi đáp', icon: '💬', needsPassage: false },
      3: { name: 'Part 3: Conversations', description: 'Hội thoại', icon: '👥', needsPassage: true },
      4: { name: 'Part 4: Talks', description: 'Bài nói', icon: '🎤', needsPassage: true },
      5: { name: 'Part 5: Incomplete Sentences', description: 'Hoàn thành câu', icon: '✏️', needsPassage: false },
      6: { name: 'Part 6: Text Completion', description: 'Hoàn thành đoạn văn', icon: '📝', needsPassage: true },
      7: { name: 'Part 7: Reading Comprehension', description: 'Đọc hiểu', icon: '📖', needsPassage: true },
    };
  }

  /**
   * Handle question data changes
   */
  public handleQuestionChange(field: string, value: any): void {
    const newQuestionData = {
      ...this.state.questionData,
      [field]: value
    };

    // Reset choices when part changes
    if (field === 'part') {
      newQuestionData.choices = { A: '', B: '', C: '', D: '' };
      newQuestionData.correct_choice = 'A';
    }

    this.setState({ questionData: newQuestionData });

    // Load passages if part needs passage
    const partInfo = this.getToeicPartInfo()[newQuestionData.part];
    if (partInfo.needsPassage) {
      this.loadPassages(newQuestionData.part);
    }
  }

  /**
   * Handle choice changes
   */
  public handleChoiceChange(choice: string, value: string): void {
    const newChoices = {
      ...this.state.questionData.choices,
      [choice]: value
    };

    this.setState({
      questionData: {
        ...this.state.questionData,
        choices: newChoices
      }
    });
  }

  /**
   * Handle passage data changes
   */
  public handlePassageChange(field: string, value: any): void {
    this.setState({
      passageData: {
        ...this.state.passageData,
        [field]: value
      }
    });
  }

  /**
   * Handle passage text changes
   */
  public handlePassageTextChange(field: string, value: string): void {
    this.setState({
      passageData: {
        ...this.state.passageData,
        texts: {
          ...this.state.passageData.texts,
          [field]: value
        }
      }
    });
  }

  /**
   * Add tag to question
   */
  public addTag(): void {
    const { newTag, questionData } = this.state;
    
    if (newTag.trim() && !questionData.tags.includes(newTag.trim())) {
      this.setState({
        questionData: {
          ...questionData,
          tags: [...questionData.tags, newTag.trim()]
        },
        newTag: ''
      });
    }
  }

  /**
   * Remove tag from question
   */
  public removeTag(tagToRemove: string): void {
    const { questionData } = this.state;
    
    this.setState({
      questionData: {
        ...questionData,
        tags: questionData.tags.filter(tag => tag !== tagToRemove)
      }
    });
  }

  /**
   * Set new tag value
   */
  public setNewTag(value: string): void {
    this.setState({ newTag: value });
  }

  /**
   * Set active tab
   */
  public setActiveTab(tab: 'question' | 'passage'): void {
    this.setState({ activeTab: tab });
  }

  /**
   * Set selected passage ID
   */
  public setSelectedPassageId(passageId: string | null): void {
    this.setState({ selectedPassageId: passageId });
  }

  /**
   * Load passages for a specific part
   */
  public async loadPassages(part: TOEICPart): Promise<void> {
    try {
      // This will be implemented when PassageService is available
      // For now, we'll use a mock implementation
      const mockPassages = [
        {
          id: '1',
          part: part,
          texts: { title: 'Sample Passage', content: 'Sample content...' },
          passage_type: 'single',
          created_at: new Date().toISOString()
        }
      ];
      
      this.setState({ passages: mockPassages });
    } catch (error) {
      console.error('Error loading passages:', error);
      this.setState({ errors: ['Không thể tải danh sách đoạn văn'] });
    }
  }

  /**
   * Validate question data
   */
  public validateQuestion(): { isValid: boolean; errors: string[] } {
    const { questionData, selectedPassageId } = this.state;
    const errors: string[] = [];

    // Validate prompt text for parts other than 1 and 2
    if (questionData.part !== 1 && questionData.part !== 2 && !questionData.prompt_text.trim()) {
      errors.push('Vui lòng nhập câu hỏi');
    }

    // Validate choices based on part
    if (questionData.part !== 1 && questionData.part !== 2) {
      const choices = questionData.choices;
      if (!choices.A.trim() || !choices.B.trim()) {
        errors.push('Vui lòng nhập ít nhất 2 lựa chọn A và B');
      } else {
        // Check for meaningful content
        const meaningfulChoices = [choices.A, choices.B].filter(
          choice => choice.trim().length > 0 && /[a-zA-ZÀ-ỹ0-9]/.test(choice.trim())
        );
        
        if (meaningfulChoices.length < 2) {
          errors.push('Vui lòng nhập lựa chọn có ý nghĩa cho ít nhất A và B');
        }
      }
    }

    // Validate explanations
    if (!questionData.explain_vi.trim() || !questionData.explain_en.trim()) {
      errors.push('Vui lòng nhập giải thích bằng tiếng Việt và tiếng Anh');
    } else {
      const hasMeaningfulExplainVi = /[a-zA-ZÀ-ỹ0-9]/.test(questionData.explain_vi.trim());
      const hasMeaningfulExplainEn = /[a-zA-ZÀ-ỹ0-9]/.test(questionData.explain_en.trim());
      
      if (!hasMeaningfulExplainVi || !hasMeaningfulExplainEn) {
        errors.push('Vui lòng nhập giải thích có ý nghĩa bằng cả tiếng Việt và tiếng Anh');
      }
    }

    // Validate URLs
    if (questionData.image_url.trim()) {
      try {
        new URL(questionData.image_url.trim());
      } catch {
        errors.push('Vui lòng nhập link ảnh hợp lệ (bắt đầu bằng http:// hoặc https://)');
      }
    }
    
    if (questionData.audio_url.trim()) {
      try {
        new URL(questionData.audio_url.trim());
      } catch {
        errors.push('Vui lòng nhập link audio hợp lệ (bắt đầu bằng http:// hoặc https://)');
      }
    }

    // Validate passage requirement
    const partInfo = this.getToeicPartInfo()[questionData.part];
    if (partInfo.needsPassage && !selectedPassageId) {
      errors.push(`Phần ${questionData.part} cần chọn đoạn văn`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate passage data
   */
  public validatePassage(): { isValid: boolean; errors: string[] } {
    const { passageData } = this.state;
    const errors: string[] = [];

    if (!passageData.texts.content.trim()) {
      errors.push('Vui lòng nhập nội dung đoạn văn');
    }

    if (passageData.audio_url.trim()) {
      try {
        new URL(passageData.audio_url.trim());
      } catch {
        errors.push('Vui lòng nhập link audio hợp lệ');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create question
   */
  public async createQuestion(userId: string): Promise<{ success: boolean; error?: string }> {
    const validation = this.validateQuestion();
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    try {
      this.setState({ loading: true });

      const { questionData, selectedPassageId } = this.state;

      // Determine audio URL based on part
      let audioUrl = null;
      if (usesIndividualAudio(questionData.part)) {
        audioUrl = questionData.audio_url || null;
      } else if (usesPassageAudio(questionData.part)) {
        audioUrl = null; // Will be handled by passage
      }

      // Create question using QuestionService
      const questionDataForService = {
        part: questionData.part,
        passage_id: selectedPassageId,
        blank_index: questionData.blank_index,
        prompt_text: questionData.part === 1 || questionData.part === 2 ? '' : questionData.prompt_text,
        choices: questionData.choices,
        correct_choice: questionData.correct_choice,
        explain_vi: questionData.explain_vi,
        explain_en: questionData.explain_en,
        tags: questionData.tags,
        difficulty: questionData.difficulty,
        image_url: questionData.image_url || null,
        audio_url: audioUrl,
        status: 'published' as const,
        created_by: userId,
      };

      await this.questionService.createQuestion(questionDataForService);

      // Reset form
      this.setState({
        questionData: this.getInitialState().questionData,
        selectedPassageId: null
      });

      return { success: true };
    } catch (error) {
      console.error('Error creating question:', error);
      return {
        success: false,
        error: 'Không thể tạo câu hỏi'
      };
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Create passage
   */
  public async createPassage(userId: string): Promise<{ success: boolean; error?: string }> {
    const validation = this.validatePassage();
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    try {
      this.setState({ loading: true });

      const { passageData } = this.state;

      // Create passage using PassageService (will be implemented)
      const passageDataForService = {
        part: passageData.part,
        passage_type: passageData.passage_type,
        texts: passageData.texts,
        audio_url: passageData.audio_url || null,
        assets: passageData.assets,
        meta: passageData.meta,
        created_by: userId,
      };

      // Mock implementation - will be replaced with actual service call
      console.log('Creating passage:', passageDataForService);

      // Reset form
      this.setState({
        passageData: this.getInitialState().passageData
      });

      // Reload passages
      await this.loadPassages(passageData.part);

      return { success: true };
    } catch (error) {
      console.error('Error creating passage:', error);
      return {
        success: false,
        error: 'Không thể tạo đoạn văn'
      };
    } finally {
      this.setState({ loading: false });
    }
  }

  /**
   * Reset form
   */
  public resetForm(): void {
    this.setState(this.getInitialState());
  }

  /**
   * Get current part info
   */
  public getCurrentPartInfo() {
    return this.getToeicPartInfo()[this.state.questionData.part];
  }

  /**
   * Check if part needs passage
   */
  public needsPassage(part: TOEICPart): boolean {
    return this.getToeicPartInfo()[part].needsPassage;
  }

  /**
   * Check if part uses individual audio
   */
  public usesIndividualAudio(part: TOEICPart): boolean {
    return usesIndividualAudio(part);
  }

  /**
   * Check if part uses passage audio
   */
  public usesPassageAudio(part: TOEICPart): boolean {
    return usesPassageAudio(part);
  }

  /**
   * Check if part requires audio
   */
  public isAudioRequired(part: TOEICPart): boolean {
    return isAudioRequired(part);
  }

  /**
   * Get available choices for part
   */
  public getAvailableChoices(part: TOEICPart): string[] {
    return part === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
  }

  /**
   * Get blank index options for Part 6
   */
  public getBlankIndexOptions(): Array<{ value: number; label: string }> {
    return [
      { value: 1, label: 'Chỗ trống 1' },
      { value: 2, label: 'Chỗ trống 2' },
      { value: 3, label: 'Chỗ trống 3' },
      { value: 4, label: 'Chỗ trống 4' },
    ];
  }

  /**
   * Get passage type options
   */
  public getPassageTypeOptions(): Array<{ value: PassageType; label: string }> {
    return [
      { value: 'single', label: 'Đoạn đơn' },
      { value: 'double', label: 'Đoạn đôi' },
      { value: 'triple', label: 'Đoạn ba' },
    ];
  }

  /**
   * Get difficulty options
   */
  public getDifficultyOptions(): Array<{ value: Difficulty; label: string }> {
    return [
      { value: 'easy', label: 'Dễ' },
      { value: 'medium', label: 'Trung bình' },
      { value: 'hard', label: 'Khó' },
    ];
  }
}
