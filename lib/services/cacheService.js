import { Redis } from "@upstash/redis";

/**
 * Cache Service - Native Upstash Implementation
 * Removed legacy ioredis and local fallback logic for simplicity and reliability.
 */
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const CACHE_KEY_PREFIX = "blog:";

export async function getCache(rawKey) {
  if (!redis) return null;
  const key = `${CACHE_KEY_PREFIX}${rawKey.toLowerCase().trim()}`;
  
  try {
    const data = await redis.get(key);
    if (data) {
      console.log(`[REDIS] Cache hit: ${key}`);
      return data;
    }
    console.log(`[REDIS] Cache miss: ${key}`);
  } catch (err) {
    console.error(`[REDIS] Error: ${err.message}`);
  }
  return null;
}

export async function setCache(rawKey, value, expiry = 86400) {
  if (!redis) return;
  const key = `${CACHE_KEY_PREFIX}${rawKey.toLowerCase().trim()}`;
  
  try {
    await redis.set(key, value, { ex: expiry });
    console.log(`[REDIS] Cache saved: ${key}`);
  } catch (err) {
    console.error(`[REDIS] Set error: ${err.message}`);
  }
}
