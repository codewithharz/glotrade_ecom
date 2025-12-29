import Redis from "ioredis";

export enum CacheProvider {
    REDIS = "redis",
    MEMORY = "memory",
}

class CacheService {
    private client: Redis | null = null;
    private memoryCache: Map<string, { value: any; expiresAt: number | null }> = new Map();
    private isEnabled: boolean = false;
    private provider: CacheProvider = CacheProvider.MEMORY;

    constructor() {
        this.isEnabled = process.env.REDIS_ENABLED === "true";

        if (this.isEnabled) {
            const redisUrl = process.env.REDIS_URL;
            if (redisUrl) {
                try {
                    this.client = new Redis(redisUrl, {
                        retryStrategy: (times) => {
                            const delay = Math.min(times * 50, 2000);
                            return delay;
                        },
                        maxRetriesPerRequest: 3,
                    });

                    this.client.on("connect", () => {
                        console.log("🚀 Redis connected successfully");
                        this.provider = CacheProvider.REDIS;
                    });

                    this.client.on("error", (err) => {
                        console.warn("⚠️ Redis connection error, falling back to memory:", err.message);
                        this.provider = CacheProvider.MEMORY;
                    });
                } catch (error: any) {
                    console.error("❌ Failed to initialize Redis client:", error.message);
                    this.isEnabled = false;
                }
            } else {
                console.warn("⚠️ REDIS_ENABLED is true but REDIS_URL is missing. Using memory cache.");
                this.provider = CacheProvider.MEMORY;
            }
        } else {
            console.log("ℹ️ Redis is disabled. Using memory cache.");
            this.provider = CacheProvider.MEMORY;
        }
    }

    public getClient(): Redis | null {
        return this.client;
    }

    /**
     * Set a value in the cache
     * @param key Cache key
     * @param value Value to store
     * @param ttl Seconds to live (optional)
     */
    async set(key: string, value: any, ttl?: number): Promise<void> {
        if (this.provider === CacheProvider.REDIS && this.client) {
            const stringValue = typeof value === "string" ? value : JSON.stringify(value);
            if (ttl) {
                await this.client.set(key, stringValue, "EX", ttl);
            } else {
                await this.client.set(key, stringValue);
            }
        } else {
            const expiresAt = ttl ? Date.now() + ttl * 1000 : null;
            this.memoryCache.set(key, { value, expiresAt });
        }
    }

    /**
     * Get a value from the cache
     * @param key Cache key
     */
    async get<T>(key: string): Promise<T | null> {
        if (this.provider === CacheProvider.REDIS && this.client) {
            const value = await this.client.get(key);
            if (!value) return null;
            try {
                return JSON.parse(value) as T;
            } catch {
                return value as unknown as T;
            }
        } else {
            const cached = this.memoryCache.get(key);
            if (!cached) return null;

            if (cached.expiresAt && cached.expiresAt < Date.now()) {
                this.memoryCache.delete(key);
                return null;
            }

            return cached.value as T;
        }
    }

    /**
     * Delete a value from the cache
     * @param key Cache key
     */
    async del(key: string): Promise<void> {
        if (this.provider === CacheProvider.REDIS && this.client) {
            await this.client.del(key);
        } else {
            this.memoryCache.delete(key);
        }
    }

    /**
     * Clear all cache entries (Memory only)
     */
    async clear(): Promise<void> {
        if (this.provider === CacheProvider.REDIS && this.client) {
            await this.client.flushdb();
        } else {
            this.memoryCache.clear();
        }
    }
}

export const cacheService = new CacheService();
export default cacheService;
