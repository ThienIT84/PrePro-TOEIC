/**
 * Base Model class với common functionality
 * Tất cả models sẽ extend từ class này
 */
export abstract class BaseModel {
  public id: string;
  public created_at: string;
  public updated_at: string;

  constructor(data: unknown) {
    this.id = data.id;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Validate required fields
   */
  protected validateRequired(fields: string[], data: unknown): string[] {
    const errors: string[] = [];
    
    fields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
        errors.push(`${field} is required`);
      }
    });
    
    return errors;
  }

  /**
   * Validate field length
   */
  protected validateLength(field: string, value: string, min: number, max: number): string | null {
    if (value.length < min) {
      return `${field} must be at least ${min} characters`;
    }
    if (value.length > max) {
      return `${field} must be no more than ${max} characters`;
    }
    return null;
  }

  /**
   * Validate field format
   */
  protected validateFormat(field: string, value: string, pattern: RegExp, message: string): string | null {
    if (!pattern.test(value)) {
      return `${field} ${message}`;
    }
    return null;
  }

  /**
   * Convert model to plain object
   */
  toJSON(): unknown {
    return { ...this };
  }

  /**
   * Create model from plain object
   */
  static fromJSON<T extends BaseModel>(this: new (data: unknown) => T, data: unknown): T {
    return new this(data);
  }
}
