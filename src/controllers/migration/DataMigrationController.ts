/**
 * DataMigrationController
 * Business logic cho Data Migration
 * Extracted từ DataMigration.tsx
 */

import { supabase } from '@/integrations/supabase/client';

export interface DataMigrationState {
  migrating: boolean;
  migrationResult: MigrationResult | null;
}

export interface MigrationResult {
  success: boolean;
  originalCount?: number;
  migratedCount?: number;
  originalData?: unknown[];
  migratedData?: unknown[];
  message: string;
  error?: string;
}

export interface DataStatistics {
  itemsCount: number;
  questionsCount: number;
}

export interface ItemData {
  id: string;
  type: string;
  question: string;
  choices: string[];
  answer: string;
  explain_vi: string;
  explain_en: string;
  tags: string[];
  difficulty: string;
}

export interface QuestionData {
  part: number;
  passage_id: string | null;
  blank_index: number | null;
  prompt_text: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_choice: string;
  explain_vi: string;
  explain_en: string;
  tags: string[];
  difficulty: string;
  status: string;
  created_by: string;
}

export class DataMigrationController {
  private state: DataMigrationState;
  private listeners: Array<(state: DataMigrationState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): DataMigrationState {
    return {
      migrating: false,
      migrationResult: null,
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: DataMigrationState) => void): () => void {
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
  private setState(updates: Partial<DataMigrationState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): DataMigrationState {
    return { ...this.state };
  }

  /**
   * Set migrating state
   */
  public setMigrating(migrating: boolean): void {
    this.setState({ migrating });
  }

  /**
   * Set migration result
   */
  public setMigrationResult(migrationResult: MigrationResult | null): void {
    this.setState({ migrationResult });
  }

  /**
   * Get type to part mapping
   */
  private getTypeToPartMapping(): Record<string, number> {
    return {
      'vocab': 1,
      'grammar': 5,
      'listening': 2,
      'reading': 7,
      'mix': 1
    };
  }

  /**
   * Transform choices array to object
   */
  private transformChoices(choices: string[]): { A: string; B: string; C: string; D: string } {
    return {
      A: choices[0] || '',
      B: choices[1] || '',
      C: choices[2] || '',
      D: choices[3] || ''
    };
  }

  /**
   * Transform item data to question format
   */
  public transformItemToQuestion(item: ItemData, userId: string): QuestionData {
    const typeToPart = this.getTypeToPartMapping();
    const part = typeToPart[item.type] || 1;

    const choices = Array.isArray(item.choices) ? 
      this.transformChoices(item.choices) : 
      { A: '', B: '', C: '', D: '' };

    return {
      part: part,
      passage_id: null,
      blank_index: null,
      prompt_text: item.question || '',
      choices: choices,
      correct_choice: item.answer || 'A',
      explain_vi: item.explain_vi || '',
      explain_en: item.explain_en || '',
      tags: item.tags || [],
      difficulty: item.difficulty || 'medium',
      status: 'published',
      created_by: userId
    };
  }

  /**
   * Fetch data from items table
   */
  public async fetchItemsData(): Promise<{ success: boolean; data?: ItemData[]; error?: string }> {
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*');

      if (itemsError) throw itemsError;

      if (!itemsData || itemsData.length === 0) {
        return {
          success: false,
          error: 'Không có dữ liệu trong bảng items'
        };
      }

      return {
        success: true,
        data: itemsData
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Insert questions data
   */
  public async insertQuestionsData(questions: QuestionData[]): Promise<{ success: boolean; data?: unknown[]; error?: string }> {
    try {
      const { data: insertedData, error: insertError } = await supabase
        .from('questions')
        .insert(questions)
        .select();

      if (insertError) throw insertError;

      return {
        success: true,
        data: insertedData
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Perform data migration
   */
  public async migrateData(userId: string): Promise<MigrationResult> {
    this.setMigrating(true);
    this.setMigrationResult(null);

    try {
      // 1. Fetch data from items table
      const itemsResult = await this.fetchItemsData();
      if (!itemsResult.success) {
        throw new Error(itemsResult.error || 'Failed to fetch items data');
      }

      const itemsData = itemsResult.data!;

      // 2. Transform data from items to questions format
      const transformedQuestions = itemsData.map(item => 
        this.transformItemToQuestion(item, userId)
      );

      // 3. Insert into questions table
      const insertResult = await this.insertQuestionsData(transformedQuestions);
      if (!insertResult.success) {
        throw new Error(insertResult.error || 'Failed to insert questions data');
      }

      const insertedData = insertResult.data!;

      const result: MigrationResult = {
        success: true,
        originalCount: itemsData.length,
        migratedCount: insertedData.length,
        originalData: itemsData.slice(0, 2), // Show first 2 items
        migratedData: insertedData.slice(0, 2), // Show first 2 migrated
        message: `Migration thành công! Đã chuyển ${itemsData.length} câu hỏi từ items sang questions.`
      };

      this.setMigrationResult(result);
      return result;

    } catch (error: unknown) {
      const result: MigrationResult = {
        success: false,
        error: error.message,
        message: "Migration thất bại"
      };

      this.setMigrationResult(result);
      return result;
    } finally {
      this.setMigrating(false);
    }
  }

  /**
   * Check data statistics
   */
  public async checkDataStatistics(): Promise<{ success: boolean; statistics?: DataStatistics; error?: string }> {
    try {
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('COUNT(*) as count');

      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('COUNT(*) as count');

      if (itemsError || questionsError) {
        throw new Error('Lỗi khi kiểm tra dữ liệu');
      }

      const statistics: DataStatistics = {
        itemsCount: itemsData?.[0]?.count || 0,
        questionsCount: questionsData?.[0]?.count || 0
      };

      return {
        success: true,
        statistics
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate migration prerequisites
   */
  public async validateMigrationPrerequisites(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if items table has data
      const itemsResult = await this.fetchItemsData();
      if (!itemsResult.success) {
        errors.push('Items table is empty or inaccessible');
      }

      // Check if questions table is accessible
      const { error: questionsError } = await supabase
        .from('questions')
        .select('id')
        .limit(1);

      if (questionsError) {
        errors.push('Questions table is not accessible');
      }

      return {
        valid: errors.length === 0,
        errors
      };
    } catch (error: unknown) {
      errors.push(`Validation error: ${error.message}`);
      return {
        valid: false,
        errors
      };
    }
  }

  /**
   * Get migration process steps
   */
  public getMigrationProcessSteps(): string[] {
    return [
      '📥 Fetch dữ liệu từ bảng items',
      '🔄 Transform sang format questions',
      '💾 Insert vào bảng questions',
      '✅ Xác nhận kết quả'
    ];
  }

  /**
   * Get migration result
   */
  public getMigrationResult(): MigrationResult | null {
    return this.state.migrationResult;
  }

  /**
   * Check if migrating
   */
  public isMigrating(): boolean {
    return this.state.migrating;
  }

  /**
   * Check if migration was successful
   */
  public isMigrationSuccessful(): boolean {
    return this.state.migrationResult?.success || false;
  }

  /**
   * Get migration statistics
   */
  public getMigrationStatistics(): { originalCount: number; migratedCount: number } | null {
    const result = this.state.migrationResult;
    if (!result?.success) return null;

    return {
      originalCount: result.originalCount || 0,
      migratedCount: result.migratedCount || 0
    };
  }

  /**
   * Clear migration result
   */
  public clearMigrationResult(): void {
    this.setMigrationResult(null);
  }

  /**
   * Reset migration state
   */
  public resetMigrationState(): void {
    this.setState(this.getInitialState());
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.listeners = [];
  }
}
