/**
 * BulkOperationsController
 * Business logic cho Bulk Operations
 * Extracted từ BulkOperations.tsx
 */

import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';

export interface BulkQuestion {
  id?: string;
  type: string;
  question: string;
  choiceA: string;
  choiceB: string;
  choiceC: string;
  choiceD: string;
  answer: string;
  explanation: string;
  tags: string;
  audio_url?: string;
  transcript?: string;
  status: 'pending' | 'valid' | 'invalid' | 'imported';
  errors?: string[];
}

export interface BulkOperationsState {
  activeTab: string;
  questions: BulkQuestion[];
  loading: boolean;
  importing: boolean;
  progress: number;
}

export interface FileProcessingResult {
  success: boolean;
  questions: BulkQuestion[];
  validCount: number;
  invalidCount: number;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  error?: string;
}

export interface ExportResult {
  success: boolean;
  exportedCount: number;
  error?: string;
}

export interface QuestionValidationResult {
  isValid: boolean;
  errors: string[];
  status: 'pending' | 'valid' | 'invalid' | 'imported';
}

export class BulkOperationsController {
  private state: BulkOperationsState;
  private listeners: Array<(state: BulkOperationsState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): BulkOperationsState {
    return {
      activeTab: 'import',
      questions: [],
      loading: false,
      importing: false,
      progress: 0,
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: BulkOperationsState) => void): () => void {
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
  private setState(updates: Partial<BulkOperationsState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): BulkOperationsState {
    return { ...this.state };
  }

  /**
   * Set active tab
   */
  public setActiveTab(activeTab: string): void {
    this.setState({ activeTab });
  }

  /**
   * Set questions
   */
  public setQuestions(questions: BulkQuestion[]): void {
    this.setState({ questions });
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Set importing state
   */
  public setImporting(importing: boolean): void {
    this.setState({ importing });
  }

  /**
   * Set progress
   */
  public setProgress(progress: number): void {
    this.setState({ progress });
  }

  /**
   * Validate a single question
   */
  public validateQuestion(question: BulkQuestion): QuestionValidationResult {
    const errors: string[] = [];
    
    if (!question.question.trim()) {
      errors.push('Question text is required');
    }
    
    if (!question.choiceA.trim()) {
      errors.push('Choice A is required');
    }
    
    if (!question.choiceB.trim()) {
      errors.push('Choice B is required');
    }
    
    if (!question.answer.trim()) {
      errors.push('Correct answer is required');
    }
    
    if (!['A', 'B', 'C', 'D'].includes(question.answer.toUpperCase())) {
      errors.push('Answer must be A, B, C, or D');
    }

    const isValid = errors.length === 0;
    const status = isValid ? 'valid' : 'invalid';

    return {
      isValid,
      errors,
      status: status as 'pending' | 'valid' | 'invalid' | 'imported'
    };
  }

  /**
   * Process Excel file
   */
  public async processExcelFile(file: File): Promise<FileProcessingResult> {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const parsedQuestions: BulkQuestion[] = jsonData.map((row: unknown, index: number) => {
        const question: BulkQuestion = {
          type: row.type || 'vocab',
          question: row.question || '',
          choiceA: row.choiceA || row['Choice A'] || '',
          choiceB: row.choiceB || row['Choice B'] || '',
          choiceC: row.choiceC || row['Choice C'] || '',
          choiceD: row.choiceD || row['Choice D'] || '',
          answer: row.answer || row.correct_answer || '',
          explanation: row.explanation || row.explain_vi || '',
          tags: row.tags || '',
          audio_url: row.audio_url || '',
          transcript: row.transcript || '',
          status: 'pending'
        };

        const validation = this.validateQuestion(question);
        question.errors = validation.errors;
        question.status = validation.status;

        return question;
      });

      const validCount = parsedQuestions.filter(q => q.status === 'valid').length;
      const invalidCount = parsedQuestions.filter(q => q.status === 'invalid').length;

      return {
        success: true,
        questions: parsedQuestions,
        validCount,
        invalidCount
      };
    } catch (error: unknown) {
      return {
        success: false,
        questions: [],
        validCount: 0,
        invalidCount: 0,
        error: error.message
      };
    }
  }

  /**
   * Import questions to database
   */
  public async importQuestions(userId: string, batchSize: number = 10): Promise<ImportResult> {
    const validQuestions = this.state.questions.filter(q => q.status === 'valid');
    
    if (validQuestions.length === 0) {
      return {
        success: false,
        importedCount: 0,
        error: 'No valid questions to import'
      };
    }

    try {
      let importedCount = 0;

      for (let i = 0; i < validQuestions.length; i += batchSize) {
        const batch = validQuestions.slice(i, i + batchSize);
        
        const questionsToInsert = batch.map(q => ({
          type: q.type,
          question: q.question.trim(),
          choices: [q.choiceA.trim(), q.choiceB.trim(), q.choiceC.trim(), q.choiceD.trim()],
          answer: q.answer.toUpperCase(),
          explain_vi: q.explanation.trim(),
          explain_en: q.explanation.trim(),
          audio_url: q.audio_url || null,
          transcript: q.transcript?.trim() || null,
          tags: q.tags ? q.tags.split(',').map(t => t.trim()) : []
        }));

        const { error } = await supabase
          .from('questions')
          .insert(questionsToInsert);

        if (error) throw error;

        importedCount += batch.length;
        const progress = (importedCount / validQuestions.length) * 100;
        this.setProgress(progress);

        // Update question status
        this.updateQuestionStatus(batch, 'imported');

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return {
        success: true,
        importedCount
      };
    } catch (error: unknown) {
      return {
        success: false,
        importedCount: 0,
        error: error.message
      };
    }
  }

  /**
   * Export questions to Excel
   */
  public async exportQuestions(): Promise<ExportResult> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const exportData = data.map(item => ({
        type: item.type,
        question: item.question,
        'Choice A': item.choices[0] || '',
        'Choice B': item.choices[1] || '',
        'Choice C': item.choices[2] || '',
        'Choice D': item.choices[3] || '',
        correct_answer: item.answer,
        explain_vi: item.explain_vi,
        explain_en: item.explain_en,
        audio_url: item.audio_url || '',
        transcript: item.transcript || '',
        tags: item.tags?.join(', ') || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');

      const fileName = `toeic_questions_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      return {
        success: true,
        exportedCount: data.length
      };
    } catch (error: unknown) {
      return {
        success: false,
        exportedCount: 0,
        error: error.message
      };
    }
  }

  /**
   * Generate template Excel file
   */
  public generateTemplate(): void {
    const template = [
      {
        type: 'vocab',
        question: 'What is the meaning of "abundant"?',
        'Choice A': 'scarce',
        'Choice B': 'plentiful',
        'Choice C': 'rare',
        'Choice D': 'limited',
        correct_answer: 'B',
        explain_vi: 'Abundant có nghĩa là dồi dào, phong phú',
        explain_en: 'Abundant means existing in large quantities',
        tags: 'vocabulary, common words'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'question_template.xlsx');
  }

  /**
   * Fix a question
   */
  public fixQuestion(index: number, field: keyof BulkQuestion, value: string): void {
    const newQuestions = [...this.state.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    
    // Re-validate
    const validation = this.validateQuestion(newQuestions[index]);
    newQuestions[index].errors = validation.errors;
    newQuestions[index].status = validation.status;
    
    this.setQuestions(newQuestions);
  }

  /**
   * Remove a question
   */
  public removeQuestion(index: number): void {
    const newQuestions = this.state.questions.filter((_, i) => i !== index);
    this.setQuestions(newQuestions);
  }

  /**
   * Update question status
   */
  private updateQuestionStatus(questions: BulkQuestion[], status: 'pending' | 'valid' | 'invalid' | 'imported'): void {
    const newQuestions = this.state.questions.map(q => 
      questions.includes(q) ? { ...q, status } : q
    );
    this.setQuestions(newQuestions);
  }

  /**
   * Get question counts
   */
  public getQuestionCounts(): {
    total: number;
    valid: number;
    invalid: number;
    imported: number;
  } {
    const questions = this.state.questions;
    return {
      total: questions.length,
      valid: questions.filter(q => q.status === 'valid').length,
      invalid: questions.filter(q => q.status === 'invalid').length,
      imported: questions.filter(q => q.status === 'imported').length
    };
  }

  /**
   * Get valid questions
   */
  public getValidQuestions(): BulkQuestion[] {
    return this.state.questions.filter(q => q.status === 'valid');
  }

  /**
   * Get invalid questions
   */
  public getInvalidQuestions(): BulkQuestion[] {
    return this.state.questions.filter(q => q.status === 'invalid');
  }

  /**
   * Get imported questions
   */
  public getImportedQuestions(): BulkQuestion[] {
    return this.state.questions.filter(q => q.status === 'imported');
  }

  /**
   * Check if can import
   */
  public canImport(): boolean {
    return this.getValidQuestions().length > 0 && !this.state.importing;
  }

  /**
   * Check if is importing
   */
  public isImporting(): boolean {
    return this.state.importing;
  }

  /**
   * Check if is loading
   */
  public isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Get current progress
   */
  public getProgress(): number {
    return this.state.progress;
  }

  /**
   * Get active tab
   */
  public getActiveTab(): string {
    return this.state.activeTab;
  }

  /**
   * Get questions
   */
  public getQuestions(): BulkQuestion[] {
    return this.state.questions;
  }

  /**
   * Clear questions
   */
  public clearQuestions(): void {
    this.setQuestions([]);
    this.setProgress(0);
  }

  /**
   * Reset state
   */
  public resetState(): void {
    this.setState(this.getInitialState());
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.listeners = [];
  }
}
