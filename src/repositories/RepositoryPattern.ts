// Repository Pattern Implementation for MVC Architecture

export interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
  findWhere(predicate: (entity: T) => boolean): Promise<T[]>;
  count(): Promise<number>;
}

export interface CacheRepository<T> extends Repository<T> {
  getFromCache(key: string): Promise<T | null>;
  setToCache(key: string, entity: T, ttl?: number): Promise<void>;
  invalidateCache(key: string): Promise<void>;
  clearCache(): Promise<void>;
}

export interface MockRepository<T> extends Repository<T> {
  seed(data: T[]): void;
  reset(): void;
  getMockData(): T[];
}

// Base Repository Implementation
export abstract class BaseRepository<T> implements Repository<T> {
  protected abstract getEntityName(): string;
  protected abstract getPrimaryKey(): string;

  async findById(id: string): Promise<T | null> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from(this.getEntityName())
        .select('*')
        .eq(this.getPrimaryKey(), id)
        .single();

      if (error) {
        console.error(`Error finding ${this.getEntityName()} by id:`, error);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error(`Error finding ${this.getEntityName()} by id:`, error);
      return null;
    }
  }

  async findAll(): Promise<T[]> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from(this.getEntityName())
        .select('*');

      if (error) {
        console.error(`Error finding all ${this.getEntityName()}:`, error);
        return [];
      }

      return data as T[];
    } catch (error) {
      console.error(`Error finding all ${this.getEntityName()}:`, error);
      return [];
    }
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from(this.getEntityName())
        .insert(entity)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating ${this.getEntityName()}: ${error.message}`);
      }

      return data as T;
    } catch (error) {
      console.error(`Error creating ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from(this.getEntityName())
        .update(entity)
        .eq(this.getPrimaryKey(), id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating ${this.getEntityName()}: ${error.message}`);
      }

      return data as T;
    } catch (error) {
      console.error(`Error updating ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase
        .from(this.getEntityName())
        .delete()
        .eq(this.getPrimaryKey(), id);

      if (error) {
        throw new Error(`Error deleting ${this.getEntityName()}: ${error.message}`);
      }
    } catch (error) {
      console.error(`Error deleting ${this.getEntityName()}:`, error);
      throw error;
    }
  }

  async findWhere(predicate: (entity: T) => boolean): Promise<T[]> {
    try {
      const allEntities = await this.findAll();
      return allEntities.filter(predicate);
    } catch (error) {
      console.error(`Error finding ${this.getEntityName()} where:`, error);
      return [];
    }
  }

  async count(): Promise<number> {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { count, error } = await supabase
        .from(this.getEntityName())
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`Error counting ${this.getEntityName()}:`, error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error(`Error counting ${this.getEntityName()}:`, error);
      return 0;
    }
  }
}

// Cache Repository Implementation
export abstract class BaseCacheRepository<T> extends BaseRepository<T> implements CacheRepository<T> {
  protected cache: Map<string, { data: T; timestamp: number; ttl: number }> = new Map();
  protected defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  async getFromCache(key: string): Promise<T | null> {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  async setToCache(key: string, entity: T, ttl?: number): Promise<void> {
    this.cache.set(key, {
      data: entity,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });
  }

  async invalidateCache(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clearCache(): Promise<void> {
    this.cache.clear();
  }

  // Override findById to use cache
  async findById(id: string): Promise<T | null> {
    const cacheKey = `${this.getEntityName()}_${id}`;
    
    // Try cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const entity = await super.findById(id);
    if (entity) {
      await this.setToCache(cacheKey, entity);
    }

    return entity;
  }

  // Override findAll to use cache
  async findAll(): Promise<T[]> {
    const cacheKey = `${this.getEntityName()}_all`;
    
    // Try cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return Array.isArray(cached) ? cached : [cached];
    }

    // Fetch from database
    const entities = await super.findAll();
    if (entities.length > 0) {
      await this.setToCache(cacheKey, entities as unknown);
    }

    return entities;
  }
}

// Mock Repository Implementation
export abstract class BaseMockRepository<T> implements MockRepository<T> {
  protected mockData: T[] = [];
  protected nextId: number = 1;

  seed(data: T[]): void {
    this.mockData = [...data];
    this.nextId = data.length + 1;
  }

  reset(): void {
    this.mockData = [];
    this.nextId = 1;
  }

  getMockData(): T[] {
    return [...this.mockData];
  }

  async findById(id: string): Promise<T | null> {
    return this.mockData.find((entity: unknown) => entity.id === id) || null;
  }

  async findAll(): Promise<T[]> {
    return [...this.mockData];
  }

  async create(entity: Omit<T, 'id'>): Promise<T> {
    const newEntity = { ...entity, id: this.nextId++ } as T;
    this.mockData.push(newEntity);
    return newEntity;
  }

  async update(id: string, entity: Partial<T>): Promise<T> {
    const index = this.mockData.findIndex((item: unknown) => item.id === id);
    if (index === -1) {
      throw new Error(`Entity with id ${id} not found`);
    }

    this.mockData[index] = { ...this.mockData[index], ...entity };
    return this.mockData[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.mockData.findIndex((item: unknown) => item.id === id);
    if (index === -1) {
      throw new Error(`Entity with id ${id} not found`);
    }

    this.mockData.splice(index, 1);
  }

  async findWhere(predicate: (entity: T) => boolean): Promise<T[]> {
    return this.mockData.filter(predicate);
  }

  async count(): Promise<number> {
    return this.mockData.length;
  }
}

// Repository Factory
export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private repositories = new Map<string, Repository<unknown>>();

  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  createRepository<T>(
    RepositoryClass: new () => Repository<T>,
    useCache: boolean = false,
    useMock: boolean = false
  ): Repository<T> {
    const key = RepositoryClass.name;
    
    if (this.repositories.has(key)) {
      return this.repositories.get(key)!;
    }

    let repository: Repository<T>;
    
    if (useMock) {
      repository = new RepositoryClass() as MockRepository<T>;
    } else if (useCache) {
      repository = new RepositoryClass() as CacheRepository<T>;
    } else {
      repository = new RepositoryClass();
    }

    this.repositories.set(key, repository);
    return repository;
  }

  getRepository<T>(RepositoryClass: new () => Repository<T>): Repository<T> | null {
    const key = RepositoryClass.name;
    return this.repositories.get(key) || null;
  }

  clearRepositories(): void {
    this.repositories.clear();
  }
}

// Specific Repository Implementations
export class QuestionRepository extends BaseCacheRepository<unknown> {
  protected getEntityName(): string {
    return 'questions';
  }

  protected getPrimaryKey(): string {
    return 'id';
  }

  async findByPart(part: number): Promise<unknown[]> {
    return this.findWhere((question: unknown) => question.part === part);
  }

  async findByDifficulty(difficulty: string): Promise<unknown[]> {
    return this.findWhere((question: unknown) => question.difficulty === difficulty);
  }

  async findByTags(tags: string[]): Promise<unknown[]> {
    return this.findWhere((question: unknown) => 
      tags.some(tag => question.tags?.includes(tag))
    );
  }
}

export class ExamRepository extends BaseCacheRepository<unknown> {
  protected getEntityName(): string {
    return 'exam_sets';
  }

  protected getPrimaryKey(): string {
    return 'id';
  }

  async findByStatus(status: string): Promise<unknown[]> {
    return this.findWhere((exam: unknown) => exam.status === status);
  }

  async findByCreator(creatorId: string): Promise<unknown[]> {
    return this.findWhere((exam: unknown) => exam.created_by === creatorId);
  }
}

export class UserRepository extends BaseCacheRepository<unknown> {
  protected getEntityName(): string {
    return 'profiles';
  }

  protected getPrimaryKey(): string {
    return 'id';
  }

  async findByRole(role: string): Promise<unknown[]> {
    return this.findWhere((user: unknown) => user.role === role);
  }

  async findByEmail(email: string): Promise<unknown | null> {
    const users = await this.findWhere((user: unknown) => user.email === email);
    return users.length > 0 ? users[0] : null;
  }
}

export class PassageRepository extends BaseCacheRepository<unknown> {
  protected getEntityName(): string {
    return 'passages';
  }

  protected getPrimaryKey(): string {
    return 'id';
  }

  async findByPart(part: number): Promise<unknown[]> {
    return this.findWhere((passage: unknown) => passage.part === part);
  }

  async findByType(type: string): Promise<unknown[]> {
    return this.findWhere((passage: unknown) => passage.passage_type === type);
  }
}

// Export repository factory instance
export const repositoryFactory = RepositoryFactory.getInstance();


