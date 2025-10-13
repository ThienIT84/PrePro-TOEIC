// Cache Service for MVC Architecture
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  strategy: 'lru' | 'fifo' | 'lfu'; // Cache eviction strategy
}

export interface CacheItem<T = unknown> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export class CacheService<T = unknown> {
  private cache = new Map<string, CacheItem<T>>();
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100, // 100 items default
      strategy: 'lru', // LRU default
      ...config
    };
  }

  // Set cache item
  set(key: string, value: T, ttl?: number): void {
    const item: CacheItem<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, item);
  }

  // Get cache item
  get(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if item has expired
    if (this.isExpired(item)) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();
    
    return item.value;
  }

  // Check if item exists and is not expired
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item ? !this.isExpired(item) : false;
  }

  // Delete cache item
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache statistics
  getStats() {
    const items = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: this.calculateHitRate(),
      averageAge: this.calculateAverageAge(items, now),
      oldestItem: this.getOldestItem(items),
      newestItem: this.getNewestItem(items)
    };
  }

  // Check if item is expired
  private isExpired(item: CacheItem<T>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  // Evict items based on strategy
  private evict(): void {
    const items = Array.from(this.cache.entries());
    
    switch (this.config.strategy) {
      case 'lru':
        this.evictLRU(items);
        break;
      case 'fifo':
        this.evictFIFO(items);
        break;
      case 'lfu':
        this.evictLFU(items);
        break;
    }
  }

  // Evict Least Recently Used
  private evictLRU(items: [string, CacheItem<T>][]): void {
    const sortedItems = items.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    const toEvict = sortedItems[0];
    this.cache.delete(toEvict[0]);
  }

  // Evict First In First Out
  private evictFIFO(items: [string, CacheItem<T>][]): void {
    const sortedItems = items.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toEvict = sortedItems[0];
    this.cache.delete(toEvict[0]);
  }

  // Evict Least Frequently Used
  private evictLFU(items: [string, CacheItem<T>][]): void {
    const sortedItems = items.sort((a, b) => a[1].accessCount - b[1].accessCount);
    const toEvict = sortedItems[0];
    this.cache.delete(toEvict[0]);
  }

  // Calculate hit rate
  private calculateHitRate(): number {
    const items = Array.from(this.cache.values());
    const totalAccesses = items.reduce((sum, item) => sum + item.accessCount, 0);
    const hits = items.filter(item => item.accessCount > 0).length;
    return totalAccesses > 0 ? (hits / totalAccesses) * 100 : 0;
  }

  // Calculate average age
  private calculateAverageAge(items: CacheItem<T>[], now: number): number {
    if (items.length === 0) return 0;
    const totalAge = items.reduce((sum, item) => sum + (now - item.timestamp), 0);
    return totalAge / items.length;
  }

  // Get oldest item
  private getOldestItem(items: CacheItem<T>[]): CacheItem<T> | null {
    if (items.length === 0) return null;
    return items.reduce((oldest, current) => 
      current.timestamp < oldest.timestamp ? current : oldest
    );
  }

  // Get newest item
  private getNewestItem(items: CacheItem<T>[]): CacheItem<T> | null {
    if (items.length === 0) return null;
    return items.reduce((newest, current) => 
      current.timestamp > newest.timestamp ? current : newest
    );
  }
}

// Global cache instances
export const questionCache = new CacheService({ ttl: 10 * 60 * 1000, maxSize: 200 }); // 10 minutes
export const examCache = new CacheService({ ttl: 15 * 60 * 1000, maxSize: 100 }); // 15 minutes
export const userCache = new CacheService({ ttl: 30 * 60 * 1000, maxSize: 50 }); // 30 minutes
export const analyticsCache = new CacheService({ ttl: 5 * 60 * 1000, maxSize: 50 }); // 5 minutes
export const mediaCache = new CacheService({ ttl: 60 * 60 * 1000, maxSize: 100 }); // 1 hour

// Cache decorator for methods
export function cached(cache: CacheService, ttl?: number) {
  return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const cacheKey = `${propertyName}_${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      cache.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}

// Cache invalidation utilities
export class CacheInvalidator {
  private caches: CacheService[] = [];

  constructor(caches: CacheService[]) {
    this.caches = caches;
  }

  // Invalidate by pattern
  invalidatePattern(pattern: string): void {
    this.caches.forEach(cache => {
      const keys = Array.from(cache['cache'].keys());
      keys.forEach(key => {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      });
    });
  }

  // Invalidate by prefix
  invalidatePrefix(prefix: string): void {
    this.caches.forEach(cache => {
      const keys = Array.from(cache['cache'].keys());
      keys.forEach(key => {
        if (key.startsWith(prefix)) {
          cache.delete(key);
        }
      });
    });
  }

  // Invalidate all
  invalidateAll(): void {
    this.caches.forEach(cache => cache.clear());
  }
}

// Global cache invalidator
export const cacheInvalidator = new CacheInvalidator([
  questionCache,
  examCache,
  userCache,
  analyticsCache,
  mediaCache
]);














