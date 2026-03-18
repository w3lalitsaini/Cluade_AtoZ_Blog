/**
 * Simple In-Memory Rate Limiter
 */

const rateLimitStore = new Map();

/**
 * Checks if a request should be rate limited.
 * 
 * @param {string} ip - The requester's IP address.
 * @param {Object} options - Rate limit options.
 * @param {number} options.limit - Max requests (default 5).
 * @param {number} options.windowMs - Time window in ms (default 60000).
 * @returns {boolean} - True if limit exceeded.
 */
export function isRateLimited(ip, options = {}) {
  const { limit = 5, windowMs = 60000 } = options;
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  // Check if window has expired
  if (now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  // Increment and check limit
  record.count += 1;
  return record.count > limit;
}

// Optional: Periodically clean up expired records to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}, 300000); // Clean every 5 mins
