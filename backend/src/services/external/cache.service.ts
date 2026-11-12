interface CacheEntry<T> { value: T; expiresAt: number; }

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) { this.store.delete(key); return undefined; }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string): void { this.store.delete(key); }
  deletePrefix(prefix: string): void { for (const k of this.store.keys()) if (k.startsWith(prefix)) this.store.delete(k); }
  clear(): void { this.store.clear(); }
  size(): number { return this.store.size; }
}

export const cache = new MemoryCache();

export const TTL = {
  SETTINGS: 5 * 60 * 1000,
  TEMPLATES: 5 * 60 * 1000,
  PAGES: 5 * 60 * 1000,
  PERMISSIONS: 60 * 1000,
} as const;

export async function cached<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = cache.get<T>(key);
  if (hit !== undefined) return hit;
  const value = await fetcher();
  cache.set(key, value, ttlMs);
  return value;
}
