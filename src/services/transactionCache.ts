import { TokenBalance } from '@/types';

interface CacheEntry {
  balances: TokenBalance[];
  transactionsProcessed: number;
  timestamp: number;
  targetTimestamp: number;
}

/**
 * In-memory cache for transaction signatures with automatic expiration.
 * Reduces API calls when users query the same wallet multiple times.
 *
 * Cache key format: wallet_address:target_timestamp
 * TTL: 1 hour (3600000ms)
 */
export class TransactionCache {
  private cache: Map<string, CacheEntry>;
  private readonly TTL_MS = 60 * 60 * 1000; // 1 hour
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.cache = new Map();
    this.cleanupInterval = null;
    this.startCleanupTimer();
  }

  /**
   * Get cached historical balances for a wallet at a specific date
   */
  get(walletAddress: string, targetTimestamp: number): { balances: TokenBalance[]; transactionsProcessed: number } | null {
    const key = this.getCacheKey(walletAddress, targetTimestamp);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > this.TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    console.log(`[Cache] HIT for ${walletAddress} (${entry.transactionsProcessed} txs, ${entry.balances.length} tokens, ${this.cache.size} entries cached)`);
    return {
      balances: entry.balances,
      transactionsProcessed: entry.transactionsProcessed,
    };
  }

  /**
   * Store historical balances in cache
   */
  set(
    walletAddress: string,
    targetTimestamp: number,
    balances: TokenBalance[],
    transactionsProcessed: number
  ): void {
    const key = this.getCacheKey(walletAddress, targetTimestamp);

    this.cache.set(key, {
      balances,
      transactionsProcessed,
      timestamp: Date.now(),
      targetTimestamp,
    });

    console.log(`[Cache] STORED for ${walletAddress} (${transactionsProcessed} txs, ${balances.length} tokens, ${this.cache.size} entries cached)`);
  }

  /**
   * Generate cache key from wallet address and target timestamp
   */
  private getCacheKey(walletAddress: string, targetTimestamp: number): string {
    return `${walletAddress}:${targetTimestamp}`;
  }

  /**
   * Remove expired entries from cache
   */
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL_MS) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`[Cache] Cleaned up ${removedCount} expired entries (${this.cache.size} remaining)`);
    }
  }

  /**
   * Start automatic cleanup timer (runs every 15 minutes)
   */
  private startCleanupTimer(): void {
    if (this.cleanupInterval) {
      return;
    }

    // Run cleanup every 15 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 15 * 60 * 1000);

    // Ensure timer doesn't prevent process exit
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  /**
   * Clear all cache entries (useful for testing)
   */
  clear(): void {
    this.cache.clear();
    console.log('[Cache] Cleared all entries');
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: Array<{ wallet: string; date: string; txCount: number; tokenCount: number; age: string }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => {
      const [wallet, timestamp] = key.split(':');
      const ageMinutes = Math.floor((now - entry.timestamp) / 1000 / 60);

      return {
        wallet: wallet.slice(0, 8) + '...' + wallet.slice(-4),
        date: new Date(parseInt(timestamp) * 1000).toISOString().split('T')[0],
        txCount: entry.transactionsProcessed,
        tokenCount: entry.balances.length,
        age: `${ageMinutes}m ago`,
      };
    });

    return {
      size: this.cache.size,
      entries,
    };
  }
}

// Global singleton instance (survives Next.js hot reloading)
// @ts-ignore - Using global to persist across module reloads
const globalForCache = global as typeof globalThis & {
  transactionCache?: TransactionCache;
};

export function getTransactionCache(): TransactionCache {
  if (!globalForCache.transactionCache) {
    globalForCache.transactionCache = new TransactionCache();
    console.log('[Cache] Initialized new cache instance');
  }
  return globalForCache.transactionCache;
}
