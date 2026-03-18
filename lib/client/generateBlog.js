/**
 * Frontend Utility to call the blog agent API.
 * 
 * @param {string} keyword - The seed keyword to generate a blog for.
 * @param {boolean} save - Whether to save the blog to the database.
 * @param {boolean} useCache - Whether to check for existing blogs first.
 * @returns {Promise<{ loading: boolean, success: boolean, fallback_used: boolean, cached: boolean, data: any, error: string|null }>}
 */
export async function generateBlog(keyword, save = false, useCache = true) {
  const status = {
    loading: false,
    success: false,
    fallback_used: false,
    cached: false,
    data: null,
    error: null
  };

  if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
    return { ...status, error: 'A valid keyword is required.' };
  }

  try {
    const response = await fetch('/api/agent-blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ keyword, save, useCache }),
    });

    const result = await response.json();

    if (!response.ok) {
      const msg = result.error || `Error ${response.status}`;
      return { ...status, error: msg };
    }

    if (result.success && result.data) {
      const isCached = !!result.cached;
      const isFallback = !!result.fallback_used;

      // Logging for dashboard debugging
      if (isCached) {
        console.log('--- [generateBlog] Using cached blog ---');
      } else if (isFallback) {
        console.warn('--- [generateBlog] Fallback mode active (Quota Exceeded) ---');
      } else {
        console.log('--- [generateBlog] Live generation success ---');
      }

      return {
        loading: false,
        success: true,
        fallback_used: isFallback,
        cached: isCached,
        data: {
          ...result.data,
          postId: result.postId,
          saved: !!result.saved
        },
        error: null
      };
    }

    return { ...status, error: 'Invalid response format from server.' };
  } catch (error) {
    console.error('[generateBlog] Client error:', error.message);
    return { ...status, error: error.message };
  }
}
