import { supabase } from '@/integrations/supabase/client';

/**
 * Base Service class với common functionality
 * Tất cả domain services sẽ extend từ class này
 */
export abstract class BaseService {
  protected supabase = supabase;

  /**
   * Generic method để fetch data từ Supabase
   */
  protected async fetchData<T>(
    table: string,
    select: string = '*',
    filters?: Record<string, any>,
    orderBy?: { column: string; ascending?: boolean }
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      let query = this.supabase.from(table).select(select);

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error(`Error fetching data from ${table}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Generic method để insert data vào Supabase
   */
  protected async insertData<T>(
    table: string,
    data: Partial<T>
  ): Promise<{ data: T | null; error: any }> {
    try {
      const { data: result, error } = await this.supabase
        .from(table)
        .insert([data])
        .select()
        .single();

      return { data: result, error };
    } catch (error) {
      console.error(`Error inserting data into ${table}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Generic method để update data trong Supabase
   */
  protected async updateData<T>(
    table: string,
    id: string,
    updates: Partial<T>
  ): Promise<{ data: T | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error(`Error updating data in ${table}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Generic method để delete data từ Supabase
   */
  protected async deleteData(
    table: string,
    id: string
  ): Promise<{ error: any }> {
    try {
      const { error } = await this.supabase
        .from(table)
        .delete()
        .eq('id', id);

      return { error };
    } catch (error) {
      console.error(`Error deleting data from ${table}:`, error);
      return { error };
    }
  }

  /**
   * Generic method để search data
   */
  protected async searchData<T>(
    table: string,
    searchTerm: string,
    searchColumns: string[],
    select: string = '*'
  ): Promise<{ data: T[] | null; error: any }> {
    try {
      const searchConditions = searchColumns
        .map(column => `${column}.ilike.%${searchTerm}%`)
        .join(',');

      const { data, error } = await this.supabase
        .from(table)
        .select(select)
        .or(searchConditions);

      return { data, error };
    } catch (error) {
      console.error(`Error searching data in ${table}:`, error);
      return { data: null, error };
    }
  }

  /**
   * Generic method để count records
   */
  protected async countData(
    table: string,
    filters?: Record<string, any>
  ): Promise<{ count: number | null; error: any }> {
    try {
      let query = this.supabase.from(table).select('*', { count: 'exact', head: true });

      // Apply filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }

      const { count, error } = await query;
      return { count, error };
    } catch (error) {
      console.error(`Error counting data in ${table}:`, error);
      return { count: null, error };
    }
  }

  /**
   * Handle errors consistently
   */
  protected handleError(error: any, context: string): never {
    console.error(`Error in ${context}:`, error);
    throw new Error(`Failed to ${context}: ${error.message || 'Unknown error'}`);
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: any, requiredFields: string[]): string[] {
    const errors: string[] = [];
    
    requiredFields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors.push(`${field} is required`);
      }
    });
    
    return errors;
  }

  /**
   * Log service operations
   */
  protected log(operation: string, details?: any): void {
    console.log(`[${this.constructor.name}] ${operation}`, details || '');
  }
}
