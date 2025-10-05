/**
 * ExamSetManagementController
 * Business logic cho Exam Set Management
 * Extracted từ ExamSetManagement.tsx
 */

import { supabase } from '@/integrations/supabase/client';

export interface ExamSetManagementState {
  examSets: ExamSet[];
  loading: boolean;
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  editingExamSet: ExamSet | null;
  formData: ExamSetFormData;
}

export interface ExamSet {
  id: string;
  title: string;
  description: string;
  total_questions: number;
  time_limit: number; // in minutes
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'inactive';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ExamSetFormData {
  title: string;
  description: string;
  time_limit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'inactive';
}

export interface CreateExamSetParams {
  title: string;
  description: string;
  time_limit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'inactive';
  created_by: string;
}

export interface UpdateExamSetParams {
  id: string;
  title: string;
  description: string;
  time_limit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'active' | 'inactive';
}

export class ExamSetManagementController {
  private state: ExamSetManagementState;
  private listeners: Array<(state: ExamSetManagementState) => void> = [];

  constructor() {
    this.state = this.getInitialState();
  }

  /**
   * Get initial state
   */
  private getInitialState(): ExamSetManagementState {
    return {
      examSets: [],
      loading: true,
      isCreateDialogOpen: false,
      isEditDialogOpen: false,
      editingExamSet: null,
      formData: {
        title: '',
        description: '',
        time_limit: 120,
        difficulty: 'medium',
        status: 'active'
      }
    };
  }

  /**
   * Subscribe to state changes
   */
  public subscribe(listener: (state: ExamSetManagementState) => void): () => void {
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
  private setState(updates: Partial<ExamSetManagementState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Get current state
   */
  public getState(): ExamSetManagementState {
    return { ...this.state };
  }

  /**
   * Set exam sets
   */
  public setExamSets(examSets: ExamSet[]): void {
    this.setState({ examSets });
  }

  /**
   * Set loading state
   */
  public setLoading(loading: boolean): void {
    this.setState({ loading });
  }

  /**
   * Set create dialog open state
   */
  public setCreateDialogOpen(isOpen: boolean): void {
    this.setState({ isCreateDialogOpen: isOpen });
  }

  /**
   * Set edit dialog open state
   */
  public setEditDialogOpen(isOpen: boolean): void {
    this.setState({ isEditDialogOpen: isOpen });
  }

  /**
   * Set editing exam set
   */
  public setEditingExamSet(examSet: ExamSet | null): void {
    this.setState({ editingExamSet: examSet });
  }

  /**
   * Set form data
   */
  public setFormData(formData: Partial<ExamSetFormData>): void {
    this.setState({ 
      formData: { ...this.state.formData, ...formData } 
    });
  }

  /**
   * Reset form data
   */
  public resetFormData(): void {
    this.setState({
      formData: {
        title: '',
        description: '',
        time_limit: 120,
        difficulty: 'medium',
        status: 'active'
      }
    });
  }

  /**
   * Fetch exam sets from database
   */
  public async fetchExamSets(): Promise<{ success: boolean; data?: ExamSet[]; error?: string }> {
    this.setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const examSets = data || [];
      this.setExamSets(examSets);

      return {
        success: true,
        data: examSets
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Create exam set
   */
  public async createExamSet(params: CreateExamSetParams): Promise<{ success: boolean; data?: ExamSet; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('exam_sets')
        .insert({
          title: params.title,
          description: params.description,
          total_questions: 200, // Default TOEIC full test
          time_limit: params.time_limit,
          difficulty: params.difficulty,
          status: params.status,
          created_by: params.created_by
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update exam set
   */
  public async updateExamSet(params: UpdateExamSetParams): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('exam_sets')
        .update({
          title: params.title,
          description: params.description,
          time_limit: params.time_limit,
          difficulty: params.difficulty,
          status: params.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete exam set
   */
  public async deleteExamSet(examSetId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('exam_sets')
        .delete()
        .eq('id', examSetId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Open create dialog
   */
  public openCreateDialog(): void {
    this.resetFormData();
    this.setCreateDialogOpen(true);
  }

  /**
   * Close create dialog
   */
  public closeCreateDialog(): void {
    this.setCreateDialogOpen(false);
    this.resetFormData();
  }

  /**
   * Open edit dialog
   */
  public openEditDialog(examSet: ExamSet): void {
    this.setEditingExamSet(examSet);
    this.setFormData({
      title: examSet.title,
      description: examSet.description,
      time_limit: examSet.time_limit,
      difficulty: examSet.difficulty,
      status: examSet.status
    });
    this.setEditDialogOpen(true);
  }

  /**
   * Close edit dialog
   */
  public closeEditDialog(): void {
    this.setEditDialogOpen(false);
    this.setEditingExamSet(null);
    this.resetFormData();
  }

  /**
   * Get difficulty color class
   */
  public getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get status color class
   */
  public getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get difficulty display text
   */
  public getDifficultyDisplayText(difficulty: string): string {
    switch (difficulty) {
      case 'easy': return 'Dễ';
      case 'medium': return 'Trung bình';
      case 'hard': return 'Khó';
      default: return 'Không xác định';
    }
  }

  /**
   * Get status display text
   */
  public getStatusDisplayText(status: string): string {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Tạm dừng';
      default: return 'Không xác định';
    }
  }

  /**
   * Validate form data
   */
  public validateFormData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!this.state.formData.title.trim()) {
      errors.push('Tên đề thi không được để trống');
    }
    
    if (!this.state.formData.description.trim()) {
      errors.push('Mô tả không được để trống');
    }
    
    if (this.state.formData.time_limit < 30 || this.state.formData.time_limit > 300) {
      errors.push('Thời gian phải từ 30 đến 300 phút');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Get exam set by ID
   */
  public getExamSetById(id: string): ExamSet | null {
    return this.state.examSets.find(examSet => examSet.id === id) || null;
  }

  /**
   * Get exam sets by status
   */
  public getExamSetsByStatus(status: string): ExamSet[] {
    return this.state.examSets.filter(examSet => examSet.status === status);
  }

  /**
   * Get exam sets by difficulty
   */
  public getExamSetsByDifficulty(difficulty: string): ExamSet[] {
    return this.state.examSets.filter(examSet => examSet.difficulty === difficulty);
  }

  /**
   * Get exam set statistics
   */
  public getExamSetStatistics(): {
    totalExamSets: number;
    activeExamSets: number;
    inactiveExamSets: number;
    totalQuestions: number;
    averageTimeLimit: number;
    difficultyDistribution: Record<string, number>;
  } {
    const examSets = this.state.examSets;
    const totalExamSets = examSets.length;
    const activeExamSets = examSets.filter(e => e.status === 'active').length;
    const inactiveExamSets = examSets.filter(e => e.status === 'inactive').length;
    const totalQuestions = examSets.reduce((sum, e) => sum + e.total_questions, 0);
    const averageTimeLimit = totalExamSets > 0 
      ? examSets.reduce((sum, e) => sum + e.time_limit, 0) / totalExamSets 
      : 0;
    
    const difficultyDistribution = examSets.reduce((acc, e) => {
      acc[e.difficulty] = (acc[e.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExamSets,
      activeExamSets,
      inactiveExamSets,
      totalQuestions,
      averageTimeLimit,
      difficultyDistribution
    };
  }

  /**
   * Check if loading
   */
  public isLoading(): boolean {
    return this.state.loading;
  }

  /**
   * Check if create dialog is open
   */
  public isCreateDialogOpen(): boolean {
    return this.state.isCreateDialogOpen;
  }

  /**
   * Check if edit dialog is open
   */
  public isEditDialogOpen(): boolean {
    return this.state.isEditDialogOpen;
  }

  /**
   * Get editing exam set
   */
  public getEditingExamSet(): ExamSet | null {
    return this.state.editingExamSet;
  }

  /**
   * Get form data
   */
  public getFormData(): ExamSetFormData {
    return this.state.formData;
  }

  /**
   * Get exam sets
   */
  public getExamSets(): ExamSet[] {
    return this.state.examSets;
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
