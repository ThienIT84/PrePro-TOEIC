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
    filters?: Record<string, unknown>,
    orderBy?: { column: string; ascending?: boolean }
  ): Promise<{ data: T[] | null; error: unknown }> {
    try {
      let query = (this.supabase as any).from(table).select(select);

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
      return { data: data as T[] | null, error };
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
  ): Promise<{ data: T | null; error: unknown }> {
    try {
      const { data: result, error } = await (this.supabase as any)
        .from(table)
        .insert([data])
        .select()
        .single();

      return { data: result as T | null, error };
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
  ): Promise<{ data: T | null; error: unknown }> {
    try {
      const { data, error } = await (this.supabase as any)
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      return { data: data as T | null, error };
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
  ): Promise<{ error: unknown }> {
    try {
      const { error } = await (this.supabase as any)
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
  ): Promise<{ data: T[] | null; error: unknown }> {
    try {
      const searchConditions = searchColumns
        .map(column => `${column}.ilike.%${searchTerm}%`)
        .join(',');

      const { data, error } = await (this.supabase as any)
        .from(table)
        .select(select)
        .or(searchConditions);

      return { data: data as T[] | null, error };
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
    filters?: Record<string, unknown>
  ): Promise<{ count: number | null; error: unknown }> {
    try {
      let query = (this.supabase as any).from(table).select('*', { count: 'exact', head: true });

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
  protected handleError(error: unknown, context: string): never {
    console.error(`Error in ${context}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to ${context}: ${errorMessage}`);
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: unknown, requiredFields: string[]): string[] {
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
  protected log(operation: string, details?: unknown): void {
    console.log(`[${this.constructor.name}] ${operation}`, details || '');
  }

  /**
   * Execute multiple operations in a transaction-like manner
   */
  protected async executeBatch<T>(
    operations: Array<() => Promise<{ data: T | null; error: unknown }>>
  ): Promise<{ data: T[] | null; error: unknown }> {
    try {
      const results = await Promise.all(operations.map(op => op()));
      
      // Check if any operation failed
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        return { data: null, error: errors[0].error };
      }

      // Return successful results
      const successfulData = results
        .filter(result => result.data !== null)
        .map(result => result.data!);
      
      return { data: successfulData, error: null };
    } catch (error) {
      console.error('Error executing batch operations:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if a record exists
   */
  protected async recordExists(
    table: string,
    id: string
  ): Promise<{ exists: boolean; error: unknown }> {
    try {
      const { data, error } = await (this.supabase as any)
        .from(table)
        .select('id')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        return { exists: false, error };
      }

      return { exists: !!data, error: null };
    } catch (error) {
      console.error(`Error checking if record exists in ${table}:`, error);
      return { exists: false, error };
    }
  }

  /**
   * Get paginated data
   */
  protected async getPaginatedData<T>(
    table: string,
    page: number = 1,
    limit: number = 10,
    select: string = '*',
    filters?: Record<string, unknown>,
    orderBy?: { column: string; ascending?: boolean }
  ): Promise<{ data: T[] | null; total: number | null; error: unknown }> {
    try {
      const offset = (page - 1) * limit;
      
      // Get total count
      const { count, error: countError } = await this.countData(table, filters);
      if (countError) {
        return { data: null, total: null, error: countError };
      }

      // Get paginated data
      const { data, error } = await this.fetchData<T>(
        table,
        select,
        filters,
        orderBy
      );

      if (error) {
        return { data: null, total: null, error };
      }

      // Apply pagination manually since Supabase doesn't have built-in pagination
      const paginatedData = data?.slice(offset, offset + limit) || [];

      return { data: paginatedData, total: count, error: null };
    } catch (error) {
      console.error(`Error getting paginated data from ${table}:`, error);
      return { data: null, total: null, error };
    }
  }
}
