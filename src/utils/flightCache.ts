/**
 * FLIGHT DATA CACHING UTILITY
 * ===========================
 *
 * This utility provides caching for flight data to reduce API costs
 * and improve user experience by showing cached data when APIs are unavailable.
 */

interface CacheEntry {
  data: any[];
  timestamp: number;
  expiresAt: number;
}

class FlightCache {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_CACHE_SIZE = 100;

  private getCacheKey(origin: string, destination: string, date?: Date): string {
    const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    return `${origin}-${destination}-${dateStr}`;
  }

  public get(key: string): any[] | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    console.log('✅ Using cached flight data for:', key);
    return entry.data;
  }

  public set(key: string, data: any[]): void {
    // Clean up old entries if cache is getting too large
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.CACHE_DURATION
    });

    console.log('💾 Cached flight data for:', key);
  }

  public clear(): void {
    this.cache.clear();
    console.log('🗑️ Cleared flight cache');
  }

  public getStats(): { size: number, entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }
}

export const flightCache = new FlightCache();

/**
 * FLIGHT API REQUEST MANAGER
 * ==========================
 *
 * Handles rate limiting, retries, and error handling for flight API requests.
 */

class FlightAPIRequestManager {
  private requestQueue = new Map<string, Promise<any>>();
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
  private readonly MAX_RETRIES = 3;
  private readonly REQUEST_TIMEOUT = 10000; // 10 seconds

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  private async makeRequestWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number = this.REQUEST_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  public async makeAPIRequest(
    url: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<any> {
    const cacheKey = `${url}-${JSON.stringify(options)}`;

    // Return cached request if it's already in progress
    if (this.requestQueue.has(cacheKey)) {
      console.log('🔄 Reusing in-progress request for:', url);
      return this.requestQueue.get(cacheKey);
    }

    const requestPromise = this.executeRequest(url, options, retryCount);
    this.requestQueue.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestQueue.delete(cacheKey);
    }
  }

  private async executeRequest(
    url: string,
    options: RequestInit,
    retryCount: number
  ): Promise<any> {
    try {
      await this.waitForRateLimit();

      console.log(`🌐 Making API request to: ${url}`);
      const response = await this.makeRequestWithTimeout(url, options);

      if (!response.ok) {
        if (response.status === 429 && retryCount < this.MAX_RETRIES) {
          // Rate limited, wait and retry
          const retryAfter = response.headers.get('Retry-After') || '5';
          const waitTime = parseInt(retryAfter) * 1000;
          console.log(`⏳ Rate limited, waiting ${waitTime}ms before retry ${retryCount + 1}/${this.MAX_RETRIES}`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return this.makeAPIRequest(url, options, retryCount + 1);
        }

        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ API request successful');
      return data;

    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        const backoffTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`❌ Request failed, retrying in ${backoffTime}ms (${retryCount + 1}/${this.MAX_RETRIES}):`, error);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return this.makeAPIRequest(url, options, retryCount + 1);
      }

      console.error('❌ API request failed after all retries:', error);
      throw error;
    }
  }
}

export const flightAPIRequestManager = new FlightAPIRequestManager();

/**
 * FLIGHT SEARCH WITH CACHING
 * ==========================
 *
 * Example of how to use caching with flight API requests.
 */

export async function searchFlightsWithCache(
  origin: string,
  destination: string,
  date?: Date,
  searchFunction: (origin: string, destination: string, date?: Date) => Promise<any[]>
): Promise<any[]> {
  const cacheKey = flightCache.getCacheKey(origin, destination, date);

  // Check cache first
  const cachedData = flightCache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  try {
    // Make API request
    const flightData = await searchFunction(origin, destination, date);

    // Cache successful results
    if (flightData && flightData.length > 0) {
      flightCache.set(cacheKey, flightData);
    }

    return flightData;

  } catch (error) {
    console.error('Flight search failed:', error);

    // Try to return cached data even if it's expired
    const expiredCache = flightCache.get(cacheKey);
    if (expiredCache) {
      console.log('⚠️ Using expired cached data as fallback');
      return expiredCache;
    }

    throw error;
  }
}

/**
 * MONITORING AND ANALYTICS
 * ========================
 */

export function logFlightAPIMetrics(
  apiName: string,
  endpoint: string,
  success: boolean,
  responseTime: number,
  error?: string
): void {
  const metrics = {
    api: apiName,
    endpoint,
    success,
    responseTime,
    timestamp: new Date().toISOString(),
    error: error || null
  };

  // In production, send to analytics service
  console.log('📊 Flight API Metrics:', metrics);

  // Could send to services like:
  // - Google Analytics
  // - Mixpanel
  // - Custom monitoring dashboard
  // - Alert system for failures
}

/**
 * USAGE EXAMPLES:
 * ===============
 *
 * // Basic usage with caching
 * const flights = await searchFlightsWithCache(
 *   'LHR', 'AUH', new Date(),
 *   async (origin, destination, date) => {
 *     return await callAmadeusAPI(origin, destination, date);
 *   }
 * );
 *
 * // Direct API call with monitoring
 * const startTime = Date.now();
 * try {
 *   const data = await flightAPIRequestManager.makeAPIRequest(url, options);
 *   logFlightAPIMetrics('Amadeus', 'flight-search', true, Date.now() - startTime);
 *   return data;
 * } catch (error) {
 *   logFlightAPIMetrics('Amadeus', 'flight-search', false, Date.now() - startTime, error.message);
 *   throw error;
 * }
 */
