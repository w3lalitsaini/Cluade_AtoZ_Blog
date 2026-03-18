import { Redis } from "@upstash/redis";

// Initialize Redis with Upstash credentials
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Memory cache fallback
let memoryCache = {};

/**
 * Standardized key format
 */
const getCacheKey = (key) => `blog:${key.toLowerCase().trim()}`;

/**
 * Get cache with Redis primary and Memory fallback.
 */
export async function getCache(rawKey) {
  const key = getCacheKey(rawKey);
  try {
    if (redis) {
      const data = await redis.get(key);
      if (data) {
        console.log(`[Cache] Hit (Redis): ${key}`);
        return data;
      }
    }
  } catch (err) {
    console.log(`[Cache] Redis failed, fallback to memory: ${err.message}`);
  }

  // Fallback to memory
  const memData = memoryCache[key];
  if (memData && memData.expiry > Date.now()) {
    console.log(`[Cache] Hit (Memory): ${key}`);
    return memData.data;
  }

  console.log(`[Cache] Miss: ${key}`);
  return null;
}

/**
 * Set cache in both Redis and Memory.
 */
export async function setCache(rawKey, value, expiry = 86400) {
  const key = getCacheKey(rawKey);
  try {
    if (redis) {
      await redis.set(key, value, { ex: expiry });
      console.log(`[Cache] Saved (Redis): ${key}`);
    }
  } catch (err) {
    console.log(`[Cache] Redis set failed: ${err.message}`);
  }

  // Memory store
  memoryCache[key] = {
    data: value,
    expiry: Date.now() + (expiry * 1000)
  };
}

/**
 * Compatibility exports for existing code
 */
export const getCachedBlog = getCache;
export const setCachedBlog = setCache;
