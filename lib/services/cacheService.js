import { cacheGet, cacheSet } from "../redis";

/**
 * AI Blog Cache Service
 * Handles caching of agentically generated blog results to save API costs and improve speed.
 * Uses Redis with an optional memory fallback (already handled by redis.ts).
 */

const CACHE_PREFIX = "blog_ai_v1:";
const DEFAULT_TTL = 12 * 60 * 60; // 12 hours (43200 seconds)

// Memory Fallback
const memoryCache = new Map();

/**
 * Retrieves a blog result from the cache for a given keyword.
 * 
 * @param {string} keyword 
 * @returns {Promise<Object|null>} The cached blog result or null.
 */
export async function getCachedBlog(keyword) {
  const cacheKey = `${CACHE_PREFIX}${keyword.toLowerCase().trim()}`;
  console.log(`[CacheService] Checking cache for: ${keyword}`);
  
  // 1. Try Redis
  const redisResult = await cacheGet(cacheKey);
  if (redisResult) return redisResult;

  // 2. Try Memory Fallback
  const memResult = memoryCache.get(cacheKey);
  if (memResult && memResult.expiry > Date.now()) {
    console.log(`[CacheService] Memory Cache Hit!`);
    return memResult.data;
  }
  
  return null;
}

/**
 * Stores a blog agent result in the cache.
 * 
 * @param {string} keyword 
 * @param {Object} blogResult 
 * @param {number} ttlSeconds - Default is 12 hours.
 */
export async function setCachedBlog(keyword, blogResult, ttlSeconds = DEFAULT_TTL) {
  const cacheKey = `${CACHE_PREFIX}${keyword.toLowerCase().trim()}`;
  
  // Ensure we don't cache fallback/error results
  if (blogResult.fallback_used) {
    console.log(`[CacheService] Skipping cache set for fallback result: ${keyword}`);
    return;
  }

  console.log(`[CacheService] Caching result for: ${keyword} (TTL: ${ttlSeconds}s)`);
  
  // 1. Set Redis
  await cacheSet(cacheKey, blogResult, ttlSeconds);

  // 2. Set Memory Fallback
  memoryCache.set(cacheKey, {
    data: blogResult,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
}

/**
 * Clears the cache for a specific keyword.
 * 
 * @param {string} keyword 
 */
export async function clearBlogCache(keyword) {
  const cacheKey = `${CACHE_PREFIX}${keyword.toLowerCase().trim()}`;
  const getRedis = (await import("../redis")).default;
  await getRedis().del(cacheKey);
}
