// Controller Composition and Middleware Implementation

export interface ControllerMiddleware {
  execute(context: ControllerContext, next: () => Promise<unknown>): Promise<unknown>;
  getName(): string;
}

export interface ControllerContext {
  controller: unknown;
  method: string;
  params: unknown[];
  result?: unknown;
  error?: Error;
  metadata: Map<string, unknown>;
}

export interface ControllerMixin {
  name: string;
  methods: Record<string, Function>;
  properties: Record<string, unknown>;
}

// Base Controller Middleware
export abstract class BaseControllerMiddleware implements ControllerMiddleware {
  protected name: string;

  constructor(name: string) {
    this.name = name;
  }

  abstract execute(context: ControllerContext, next: () => Promise<unknown>): Promise<unknown>;

  getName(): string {
    return this.name;
  }
}

// Logging Middleware
export class LoggingMiddleware extends BaseControllerMiddleware {
  constructor() {
    super('LoggingMiddleware');
  }

  async execute(context: ControllerContext, next: () => Promise<unknown>): Promise<unknown> {
    const startTime = performance.now();
    
    console.log(`[${this.name}] Starting ${context.controller.constructor.name}.${context.method}`);
    console.log(`[${this.name}] Parameters:`, context.params);

    try {
      const result = await next();
      const endTime = performance.now();
      
      console.log(`[${this.name}] Completed ${context.controller.constructor.name}.${context.method} in ${(endTime - startTime).toFixed(2)}ms`);
      console.log(`[${this.name}] Result:`, result);
      
      context.result = result;
      return result;
    } catch (error) {
      const endTime = performance.now();
      
      console.error(`[${this.name}] Error in ${context.controller.constructor.name}.${context.method} after ${(endTime - startTime).toFixed(2)}ms:`, error);
      
      context.error = error as Error;
      throw error;
    }
  }
}

// Validation Middleware
export class ValidationMiddleware extends BaseControllerMiddleware {
  private validators: Map<string, (params: unknown[]) => boolean> = new Map();

  constructor() {
    super('ValidationMiddleware');
  }

  addValidator(method: string, validator: (params: unknown[]) => boolean): void {
    this.validators.set(method, validator);
  }

  async execute(context: ControllerContext, next: () => Promise<unknown>): Promise<unknown> {
    const validator = this.validators.get(context.method);
    
    if (validator && !validator(context.params)) {
      const error = new Error(`Validation failed for ${context.method}`);
      context.error = error;
      throw error;
    }

    return await next();
  }
}

// Caching Middleware
export class CachingMiddleware extends BaseControllerMiddleware {
  private cache: Map<string, { data: unknown; timestamp: number; ttl: number }> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super('CachingMiddleware');
  }

  async execute(context: ControllerContext, next: () => Promise<unknown>): Promise<unknown> {
    const cacheKey = this.generateCacheKey(context);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`[${this.name}] Cache hit for ${cacheKey}`);
      context.result = cached.data;
      return cached.data;
    }

    const result = await next();
    
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
      ttl: this.defaultTTL
    });

    console.log(`[${this.name}] Cached result for ${cacheKey}`);
    return result;
  }

  private generateCacheKey(context: ControllerContext): string {
    return `${context.controller.constructor.name}_${context.method}_${JSON.stringify(context.params)}`;
  }

  clearCache(): void {
    this.cache.clear();
  }

  setTTL(ttl: number): void {
    this.defaultTTL = ttl;
  }
}

// Error Handling Middleware
export class ErrorHandlingMiddleware extends BaseControllerMiddleware {
  constructor() {
    super('ErrorHandlingMiddleware');
  }

  async execute(context: ControllerContext, next: () => Promise<unknown>): Promise<unknown> {
    try {
      return await next();
    } catch (error) {
      console.error(`[${this.name}] Error caught:`, error);
      
      // Transform error if needed
      const transformedError = this.transformError(error as Error, context);
      context.error = transformedError;
      
      throw transformedError;
    }
  }

  private transformError(error: Error, context: ControllerContext): Error {
    // Add context information to error
    const enhancedError = new Error(`${error.message} (Controller: ${context.controller.constructor.name}, Method: ${context.method})`);
    enhancedError.stack = error.stack;
    return enhancedError;
  }
}

// Performance Monitoring Middleware
export class PerformanceMonitoringMiddleware extends BaseControllerMiddleware {
  private metrics: Map<string, { count: number; totalTime: number; averageTime: number }> = new Map();

  constructor() {
    super('PerformanceMonitoringMiddleware');
  }

  async execute(context: ControllerContext, next: () => Promise<unknown>): Promise<unknown> {
    const startTime = performance.now();
    const methodKey = `${context.controller.constructor.name}.${context.method}`;
    
    try {
      const result = await next();
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      this.updateMetrics(methodKey, executionTime);
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      this.updateMetrics(methodKey, executionTime);
      throw error;
    }
  }

  private updateMetrics(methodKey: string, executionTime: number): void {
    const existing = this.metrics.get(methodKey) || { count: 0, totalTime: 0, averageTime: 0 };
    
    existing.count++;
    existing.totalTime += executionTime;
    existing.averageTime = existing.totalTime / existing.count;
    
    this.metrics.set(methodKey, existing);
  }

  getMetrics(): Map<string, { count: number; totalTime: number; averageTime: number }> {
    return new Map(this.metrics);
  }

  getMethodMetrics(methodKey: string): { count: number; totalTime: number; averageTime: number } | null {
    return this.metrics.get(methodKey) || null;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Controller Composition System
export class ControllerComposition {
  private middlewares: ControllerMiddleware[] = [];
  private mixins: Map<string, ControllerMixin> = new Map();

  addMiddleware(middleware: ControllerMiddleware): void {
    this.middlewares.push(middleware);
  }

  removeMiddleware(middlewareName: string): void {
    this.middlewares = this.middlewares.filter(m => m.getName() !== middlewareName);
  }

  addMixin(mixin: ControllerMixin): void {
    this.mixins.set(mixin.name, mixin);
  }

  removeMixin(mixinName: string): void {
    this.mixins.delete(mixinName);
  }

  applyMixins(target: unknown): void {
    this.mixins.forEach((mixin, name) => {
      // Apply methods
      Object.entries(mixin.methods).forEach(([methodName, method]) => {
        target[methodName] = method.bind(target);
      });

      // Apply properties
      Object.entries(mixin.properties).forEach(([propName, value]) => {
        target[propName] = value;
      });
    });
  }

  async executeWithMiddlewares(
    controller: unknown,
    method: string,
    params: unknown[]
  ): Promise<unknown> {
    const context: ControllerContext = {
      controller,
      method,
      params,
      metadata: new Map()
    };

    let index = 0;

    const next = async (): Promise<unknown> => {
      if (index >= this.middlewares.length) {
        // Execute the actual method
        return await controller[method](...params);
      }

      const middleware = this.middlewares[index++];
      return await middleware.execute(context, next);
    };

    return await next();
  }

  getMiddlewares(): ControllerMiddleware[] {
    return [...this.middlewares];
  }

  getMixins(): ControllerMixin[] {
    return Array.from(this.mixins.values());
  }
}

// Controller Mixins
export const LoggingMixin: ControllerMixin = {
  name: 'LoggingMixin',
  methods: {
    log: function(message: string, data?: unknown) {
      console.log(`[${this.constructor.name}] ${message}`, data);
    },
    logError: function(error: Error, context?: unknown) {
      console.error(`[${this.constructor.name}] Error:`, error, context);
    }
  },
  properties: {
    isLoggingEnabled: true
  }
};

export const ValidationMixin: ControllerMixin = {
  name: 'ValidationMixin',
  methods: {
    validate: function(data: unknown, rules: unknown): boolean {
      // Simple validation logic
      return data && typeof data === 'object';
    },
    validateRequired: function(data: unknown, fields: string[]): boolean {
      return fields.every(field => data && data[field] !== undefined && data[field] !== null);
    }
  },
  properties: {
    validationRules: new Map()
  }
};

export const CachingMixin: ControllerMixin = {
  name: 'CachingMixin',
  methods: {
    getCached: function(key: string): unknown {
      return this.cache?.get(key);
    },
    setCached: function(key: string, value: unknown, ttl?: number): void {
      this.cache?.set(key, { value, timestamp: Date.now(), ttl: ttl || 300000 });
    },
    clearCache: function(): void {
      this.cache?.clear();
    }
  },
  properties: {
    cache: new Map()
  }
};

// Enhanced Controller Base Class
export abstract class EnhancedController {
  protected composition: ControllerComposition;
  protected middlewares: ControllerMiddleware[];

  constructor() {
    this.composition = new ControllerComposition();
    this.middlewares = [];
    this.setupDefaultMiddlewares();
    this.setupDefaultMixins();
  }

  private setupDefaultMiddlewares(): void {
    this.composition.addMiddleware(new LoggingMiddleware());
    this.composition.addMiddleware(new ErrorHandlingMiddleware());
    this.composition.addMiddleware(new PerformanceMonitoringMiddleware());
  }

  private setupDefaultMixins(): void {
    this.composition.addMixin(LoggingMixin);
    this.composition.addMixin(ValidationMixin);
    this.composition.addMixin(CachingMixin);
    this.composition.applyMixins(this);
  }

  protected async executeMethod(method: string, ...params: unknown[]): Promise<unknown> {
    return await this.composition.executeWithMiddlewares(this, method, params);
  }

  addMiddleware(middleware: ControllerMiddleware): void {
    this.composition.addMiddleware(middleware);
  }

  removeMiddleware(middlewareName: string): void {
    this.composition.removeMiddleware(middlewareName);
  }

  addMixin(mixin: ControllerMixin): void {
    this.composition.addMixin(mixin);
    this.composition.applyMixins(this);
  }

  getPerformanceMetrics(): Map<string, { count: number; totalTime: number; averageTime: number }> {
    const performanceMiddleware = this.composition.getMiddlewares()
      .find(m => m instanceof PerformanceMonitoringMiddleware) as PerformanceMonitoringMiddleware;
    
    return performanceMiddleware ? performanceMiddleware.getMetrics() : new Map();
  }
}

// Export composition system
export const controllerComposition = new ControllerComposition();




