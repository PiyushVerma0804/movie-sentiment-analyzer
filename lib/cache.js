/**
 * @file cache.js
 * @description In-memory caching layer with TTL and request deduplication.
 * Prevents redundant AI API calls.
 */

const cache = new Map();
const pendingRequests = new Map();

/**
 * Gets a value from the cache if it exists and hasn't expired.
 * @param {string} key 
 * @returns {any|null}
 */
export async function getCache(key) {
    if (!cache.has(key)) return null;

    const { value, expiry } = cache.get(key);
    if (Date.now() > expiry) {
        cache.delete(key);
        return null; // Cache miss due to expiration
    }

    return value;
}

/**
 * Sets a value in the cache with a specified Time-to-Live (TTL).
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttlInSeconds 
 */
export async function setCache(key, value, ttlInSeconds = 3600) {
    const expiry = Date.now() + ttlInSeconds * 1000;
    cache.set(key, { value, expiry });

    // Cleanup old keys occasionally to prevent memory leaks
    if (cache.size > 1000) {
        for (const [k, v] of cache.entries()) {
            if (Date.now() > v.expiry) {
                cache.delete(k);
            }
        }
    }
}

/**
 * Executes an async task while preventing duplicate concurrent requests.
 * @param {string} key Unique request key
 * @param {Function} task Async function yielding the result
 * @returns {Promise<any>}
 */
export async function deduplicateRequest(key, task) {
    if (pendingRequests.has(key)) {
        return pendingRequests.get(key);
    }

    const promise = task().finally(() => {
        pendingRequests.delete(key);
    });

    pendingRequests.set(key, promise);
    return promise;
}
