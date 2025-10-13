/**
 * ItemsTableCleanupController
 * Business logic cho Items Table Cleanup
 * Extracted từ ItemsTableCleanup.tsx
 * 
 * NOTE: This controller is designed to migrate from legacy 'items' table to 'questions' table.
 * Since the 'items' table doesn't exist in the current database schema, this controller
 * will handle the case gracefully and provide appropriate feedback.
 */

import { supabase } from '@/integrations/supabase/client';

export interface ItemsTableCleanupState {
  cleaning: boolean;
  cleanupResult: CleanupResult | null;
}

export interface CleanupResult {
  success: boolean;
  steps?: string[];
  totalItems?: number;
  message: string;
  error?: string;
}

export interface DependenciesCheck {
  itemsCount: number;
  foreignKeys: unknown[];
  hasDependencies: boolean;
  error?: string;
}

export interface BackupResult {
  success: boolean;
  backedUpCount: number;
  error?: string;
}

export interface MigrationResult {
  success: boolean;
  migrated: number;
  message: string;
  error?: string;
}

export interface DropTableResult {
  success: boolean;
  message: string;
  error?: string;
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
  created_by: string | null;
}

export class ItemsTableCleanupController {
  private state: ItemsTableCleanupState;
  private listeners: Array<(state: ItemsTableCleanupState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): ItemsTableCleanupState {
    return {
      cleaning: false,
      cleanupResult: null,
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: ItemsTableCleanupState) => void): () => void {
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
  private setState(updates: Partial<ItemsTableCleanupState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): ItemsTableCleanupState {
    return { ...this.state };
  }

  /**
   * Set cleaning state
   */
  public setCleaning(cleaning: boolean): void {
    this.setState({ cleaning });
  }

  /**
   * Set cleanup result
   */
  public setCleanupResult(cleanupResult: CleanupResult | null): void {
    this.setState({ cleanupResult });
  }

  /**
   * Check dependencies
   */
  public async checkDependencies(): Promise<DependenciesCheck> {
    try {
      // Since 'items' table doesn't exist in current schema, return appropriate response
      const { data: foreignKeys, error: fkError } = await supabase
        .rpc('get_foreign_keys', { target_table_name: 'items' });

      // Check if items table exists by attempting to query it
      let itemsCount = 0;
      try {
        const { count, error: itemsError } = await supabase
          .from('items' as any)
          .select('*', { count: 'exact', head: true });
        
        if (!itemsError) {
          itemsCount = count || 0;
        }
      } catch {
        // Table doesn't exist, which is expected
        itemsCount = 0;
      }

      return {
        itemsCount: itemsCount,
        foreignKeys: foreignKeys || [],
        hasDependencies: (foreignKeys || []).length > 0
      };
    } catch (error: unknown) {
      console.error('Check dependencies error:', error);
      return {
        itemsCount: 0,
        foreignKeys: [],
        hasDependencies: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Backup items data
   */
  public async backupItemsData(): Promise<BackupResult> {
    try {
      // Attempt to query items table
      const { data: itemsData, error } = await supabase
        .from('items' as any)
        .select('*');

      if (error) {
        // Table doesn't exist, return appropriate response
        return {
          success: true,
          backedUpCount: 0,
          error: 'Items table does not exist - no data to backup'
        };
      }

      // Create backup in a JSON format
      const backup = {
        timestamp: new Date().toISOString(),
        table: 'items',
        count: itemsData?.length || 0,
        data: itemsData
      };

      // Download as JSON file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `items_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return {
        success: true,
        backedUpCount: itemsData?.length || 0
      };
    } catch (error: unknown) {
      return {
        success: false,
        backedUpCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
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
  private transformItemToQuestion(item: ItemData, userId: string | null): QuestionData {
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
   * Migrate remaining data
   */
  public async migrateRemainingData(userId: string | null): Promise<MigrationResult> {
    try {
      // Attempt to query items table
      const { data: itemsData, error: itemsError } = await supabase
        .from('items' as any)
        .select('*');

      if (itemsError) {
        // Table doesn't exist
        return { 
          success: true,
          migrated: 0, 
          message: 'Items table does not exist - no data to migrate' 
        };
      }

      if (!itemsData || itemsData.length === 0) {
        return { 
          success: true,
          migrated: 0, 
          message: 'No data to migrate' 
        };
      }

      // Transform and insert into questions
      const transformedQuestions = itemsData.map((item: any) => 
        this.transformItemToQuestion(item, userId)
      );

      const { data: insertedData, error: insertError } = await supabase
        .from('questions')
        .insert(transformedQuestions)
        .select();

      if (insertError) throw insertError;

      return {
        success: true,
        migrated: insertedData?.length || 0,
        message: `Migrated ${transformedQuestions.length} items to questions`
      };
    } catch (error: unknown) {
      return {
        success: false,
        migrated: 0,
        message: 'Migration failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Drop items table
   */
  public async dropItemsTable(): Promise<DropTableResult> {
    try {
      // Drop the items table
      const { error } = await supabase
        .rpc('drop_table_if_exists', { target_table_name: 'items' });

      if (error) throw error;

      return { 
        success: true, 
        message: 'Items table dropped successfully (or did not exist)' 
      };
    } catch (error: unknown) {
      return {
        success: false,
        message: 'Drop table failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Perform cleanup
   */
  public async performCleanup(userId: string | null): Promise<CleanupResult> {
    this.setCleaning(true);
    this.setCleanupResult(null);

    try {
      const steps = [];
      let totalItems = 0;

      // Step 1: Check dependencies
      steps.push("🔍 Checking dependencies...");
      const dependencies = await this.checkDependencies();
      if (dependencies.error) throw new Error(dependencies.error);
      
      totalItems = dependencies.itemsCount;
      steps.push(`📊 Found ${totalItems} items in table`);

      if (dependencies.hasDependencies) {
        throw new Error("Cannot drop items table: it has foreign key dependencies");
      }

      // Step 2: Backup data
      if (totalItems > 0) {
        steps.push("💾 Creating backup...");
        const backup = await this.backupItemsData();
        if (!backup.success) throw new Error(backup.error || 'Backup failed');
        steps.push(`✅ Backup created: ${backup.backedUpCount} items`);
      }

      // Step 3: Migrate remaining data
      if (totalItems > 0) {
        steps.push("🔄 Migrating data to questions table...");
        const migration = await this.migrateRemainingData(userId);
        if (!migration.success) throw new Error(migration.error || 'Migration failed');
        steps.push(`✅ Migration: ${migration.message}`);
      }

      // Step 4: Drop table
      steps.push("🗑️ Dropping items table...");
      const dropResult = await this.dropItemsTable();
      if (!dropResult.success) throw new Error(dropResult.error || 'Drop table failed');
      steps.push(`✅ ${dropResult.message}`);

      const result: CleanupResult = {
        success: true,
        steps: steps,
        totalItems: totalItems,
        message: "Items table cleanup completed successfully!"
      };

      this.setCleanupResult(result);
      return result;

    } catch (error: unknown) {
      console.error('Cleanup error:', error);
      const result: CleanupResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: "Cleanup thất bại"
      };

      this.setCleanupResult(result);
      return result;
    } finally {
      this.setCleaning(false);
    }
  }

  /**
   * Get cleanup process steps
   */
  public getCleanupProcessSteps(): string[] {
    return [
      '🔍 Kiểm tra dependencies và foreign keys',
      '💾 Backup dữ liệu items (download JSON)',
      '🔄 Migrate dữ liệu sang bảng questions',
      '🗑️ Xóa bảng items',
      '✅ Xác nhận hoàn thành'
    ];
  }

  /**
   * Get cleanup benefits
   */
  public getCleanupBenefits(): string[] {
    return [
      '✅ Loại bỏ nhầm lẫn giữa 2 bảng',
      '✅ Tất cả components sẽ fetch từ bảng questions',
      '✅ Cấu trúc dữ liệu thống nhất',
      '✅ Tránh lỗi fetch từ bảng cũ'
    ];
  }

  /**
   * Get cleanup warnings
   */
  public getCleanupWarnings(): string[] {
    return [
      '⚠️ CẢNH BÁO: Hành động này sẽ XÓA VĨNH VIỄN bảng items!',
      '• Tất cả dữ liệu trong bảng items sẽ được backup và migrate sang bảng questions',
      '• Bảng items sẽ bị xóa hoàn toàn',
      '• Hành động này KHÔNG THỂ hoàn tác'
    ];
  }

  /**
   * Get cleanup result
   */
  public getCleanupResult(): CleanupResult | null {
    return this.state.cleanupResult;
  }

  /**
   * Check if cleaning
   */
  public isCleaning(): boolean {
    return this.state.cleaning;
  }

  /**
   * Check if cleanup was successful
   */
  public isCleanupSuccessful(): boolean {
    return this.state.cleanupResult?.success || false;
  }

  /**
   * Clear cleanup result
   */
  public clearCleanupResult(): void {
    this.setCleanupResult(null);
  }

  /**
   * Reset cleanup state
   */
  public resetCleanupState(): void {
    this.setState(this.getInitialState());
  }

  /**
   * Cleanup resources
   */
  public cleanup(): void {
    this.listeners = [];
  }
}
