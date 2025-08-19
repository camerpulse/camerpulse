/**
 * Intelligent Cache Management System
 * 
 * Provides efficient caching with TTL, LRU eviction, and memory management
 */

import { createComponentLogger } from './logger';

const cacheLogger = createComponentLogger('CacheManager');

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  cleanupInterval: number;
}

/**
 * LRU Cache with TTL support
 */
export class CacheManager<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 300000, // 5 minutes
      cleanupInterval: 60000, // 1 minute
      ...config
    };

    this.startCleanup();
  }

  /**
   * Set cache entry with optional TTL
   */
  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now()
    };

    // Remove oldest entries if at capacity
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    cacheLogger.debug(`Cache entry set: ${key}`, 'CacheManager', {
      cacheSize: this.cache.size,
      ttl: entry.ttl
    });
  }

  /**
   * Get cache entry
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      cacheLogger.debug(`Cache entry expired: ${key}`, 'CacheManager');
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    cacheLogger.debug(`Cache hit: ${key}`, 'CacheManager', {
      accessCount: entry.accessCount
    });

    return entry.data;
  }

  /**
   * Check if cache has valid entry
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry ? !this.isExpired(entry) : false;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      cacheLogger.debug(`Cache entry deleted: ${key}`, 'CacheManager');
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    cacheLogger.info('Cache cleared', 'CacheManager');
  }

  /**
   * Get or set cache entry with loader function
   */
  async getOrSet<K>(
    key: string,
    loader: () => Promise<K>,
    ttl?: number
  ): Promise<K> {
    const cached = this.get(key);
    if (cached !== null) {
      return cached as K;
    }

    try {
      const data = await loader();
      this.set(key, data as T, ttl);
      return data;
    } catch (error) {
      cacheLogger.error(`Cache loader failed for key: ${key}`, 'CacheManager', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let totalSize = 0;
    let expiredCount = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      totalSize++;
      if (this.isExpired(entry)) {
        expiredCount++;
      }
    }

    return {
      totalEntries: totalSize,
      expiredEntries: expiredCount,
      hitRatio: this.calculateHitRatio(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let oldestAccess = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      cacheLogger.debug(`LRU eviction: ${lruKey}`, 'CacheManager');
    }
  }

  /**
   * Start periodic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpired();
    }, this.config.cleanupInterval);
  }

  /**
   * Clean up expired entries
   */
  private cleanupExpired(): void {
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      cacheLogger.debug(`Cleaned up ${cleanedCount} expired entries`, 'CacheManager');
    }
  }

  /**
   * Calculate cache hit ratio
   */
  private calculateHitRatio(): number {
    let totalAccess = 0;
    let totalEntries = 0;

    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
      totalEntries++;
    }

    return totalEntries > 0 ? totalAccess / totalEntries : 0;
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  private estimateMemoryUsage(): string {
    const entries = Array.from(this.cache.entries());
    const jsonSize = JSON.stringify(entries).length;
    return `${(jsonSize / 1024).toFixed(2)}KB`;
  }

  /**
   * Destroy cache and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
    cacheLogger.info('Cache manager destroyed', 'CacheManager');
  }
}

// Global cache instances for common use cases
export const apiCache = new CacheManager({
  maxSize: 200,
  defaultTTL: 300000, // 5 minutes
  cleanupInterval: 120000 // 2 minutes
});

export const userCache = new CacheManager({
  maxSize: 50,
  defaultTTL: 900000, // 15 minutes
  cleanupInterval: 300000 // 5 minutes
});

export const assetCache = new CacheManager({
  maxSize: 500,
  defaultTTL: 1800000, // 30 minutes
  cleanupInterval: 600000 // 10 minutes
});