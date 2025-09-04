import axios from "axios";
// AviationStack has very strict limits (20 calls/month), so we need aggressive caching
class AviationStackCache {
    constructor() {
        this.cache = new Map();
        this.CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days (very long cache for low limits)
        this.MAX_CACHE_SIZE = 50; // Keep cache small for memory efficiency
    }
    getCacheKey(origin, destination, date) {
        const dateStr = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        return `aviationstack-${origin}-${destination}-${dateStr}`;
    }
    get(key) {
        const entry = this.cache.get(key);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            console.log('🗑️ AviationStack cache expired for:', key);
            this.cache.delete(key);
            return null;
        }
        console.log('✅ Using AviationStack cached data for:', key);
        return entry.data;
    }
    set(key, data) {
        // Clean up old entries if cache is getting too large
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
            const oldestKey = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
            this.cache.delete(oldestKey);
        }
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + this.CACHE_DURATION
        });
        console.log('💾 AviationStack cached data for:', key, `(expires in ${Math.round(this.CACHE_DURATION / (24 * 60 * 60 * 1000))} days)`);
    }
    getStats() {
        const entries = Array.from(this.cache.entries());
        const nextExpiry = entries.length > 0
            ? new Date(Math.min(...entries.map(([, entry]) => entry.expiresAt)))
            : undefined;
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.keys()),
            nextExpiry
        };
    }
    clear() {
        this.cache.clear();
        console.log('🗑️ Cleared AviationStack cache');
    }
}
const aviationStackCache = new AviationStackCache();
/**
 * Search for flights using AviationStack API
 * Note: AviationStack has very strict limits (20 calls/month), so this should only be used as a fallback
 */
export async function searchFlightsAviationStack(origin, destination, date, options = {}) {
    var _a, _b, _c;
    // For debugging, use hardcoded API key if environment variable is not working
    const envApiKey = process.env.AVIATIONSTACK_API_KEY;
    const hardcodedKey = '2e7cc3e7e32c86dad6deb52245de25c2';
    const apiKey = envApiKey || hardcodedKey;
    console.log('🔑 Using AviationStack API key:', apiKey ? apiKey.substring(0, 10) + '...' : 'none');
    if (!apiKey || apiKey === 'your_aviationstack_api_key_here') {
        console.log('⚠️ AviationStack API key not configured - skipping AviationStack search');
        return [];
    }
    const cacheKey = aviationStackCache.getCacheKey(origin, destination, date);
    const cachedData = aviationStackCache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }
    try {
        console.log('🔄 Making AviationStack API call (very limited - 20/month):', { origin, destination, date: date === null || date === void 0 ? void 0 : date.toISOString().split('T')[0] });
        const searchDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const limit = options.limit || 10;
        // Use RapidAPI endpoint for better reliability
        const url = `https://aviationstack1.p.rapidapi.com/api.aviationstack.com/v1/flights`;
        const params = new URLSearchParams({
            // Note: access_key not needed for RapidAPI proxy - authentication handled by x-rapidapi-key header
            dep_iata: origin.toUpperCase(),
            arr_iata: destination.toUpperCase(),
            flight_date: searchDate,
            limit: limit.toString()
        });
        if (options.flight_status) {
            params.append('flight_status', options.flight_status);
        }
        // Use RapidAPI headers instead of direct AviationStack
        const rapidApiKey = process.env.AERODATABOX_RAPIDAPI_KEY || 'd2cb8db4a5mshf035387013e2843p108a52jsn7ea3f50d7aa4';
        const response = await axios.get(`${url}?${params.toString()}`, {
            timeout: 10000,
            headers: {
                'User-Agent': 'TripTick-App/1.0',
                'x-rapidapi-host': 'aviationstack1.p.rapidapi.com',
                'x-rapidapi-key': rapidApiKey
            }
        });
        // Debug: Log the full response to understand structure
        console.log('🔍 AviationStack API Response Debug:');
        console.log('   Status:', response.status);
        console.log('   Response data keys:', Object.keys(response.data || {}));
        console.log('   Response data:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
        // Check different possible response structures
        let flightsData;
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
            flightsData = response.data.data;
            console.log('✅ Found flights in response.data.data');
        }
        else if (response.data && Array.isArray(response.data)) {
            flightsData = response.data;
            console.log('✅ Found flights in response.data (array)');
        }
        else if (response.data && response.data.flights && Array.isArray(response.data.flights)) {
            flightsData = response.data.flights;
            console.log('✅ Found flights in response.data.flights');
        }
        else {
            console.log('⚠️ AviationStack returned unexpected data structure');
            console.log('   Response data type:', typeof response.data);
            console.log('   Response data:', response.data);
            return [];
        }
        if (!flightsData || flightsData.length === 0) {
            console.log('⚠️ AviationStack returned no flight data');
            return [];
        }
        const flights = flightsData;
        console.log(`✅ AviationStack found ${flights.length} flights`);
        // Transform AviationStack format to our internal format
        const transformedFlights = flights.map(flight => ({
            flight: {
                number: flight.flight.iata || flight.flight.number,
                iata: flight.airline.iata,
                icao: flight.airline.icao
            },
            airline: {
                name: flight.airline.name
            },
            departure: {
                airport: flight.departure.iata,
                scheduled: flight.departure.scheduled,
                terminal: flight.departure.terminal || undefined,
                gate: flight.departure.gate || undefined
            },
            arrival: {
                airport: flight.arrival.iata,
                scheduled: flight.arrival.scheduled,
                terminal: flight.arrival.terminal || undefined,
                gate: flight.arrival.gate || undefined
            },
            aircraft: flight.aircraft ? {
                iata: flight.aircraft.iata
            } : undefined,
            status: flight.flight_status || 'Scheduled',
            raw: flight
        }));
        // Cache the results (7-day cache due to very low API limits)
        aviationStackCache.set(cacheKey, transformedFlights);
        // Log usage warning
        console.log('⚠️ AviationStack API call made - REMAINING MONTHLY CALLS: ~19 (check usage at aviationstack.com)');
        return transformedFlights;
    }
    catch (error) {
        console.error('❌ AviationStack API error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 403) {
            console.error('🚫 AviationStack API: Access forbidden - check API key and usage limits');
        }
        else if (((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 429) {
            console.error('🚫 AviationStack API: Rate limit exceeded - monthly limit reached');
        }
        return [];
    }
}
/**
 * Get AviationStack cache statistics
 */
export function getAviationStackCacheStats() {
    return aviationStackCache.getStats();
}
/**
 * Clear AviationStack cache (use sparingly due to API limits)
 */
export function clearAviationStackCache() {
    aviationStackCache.clear();
}
/**
 * Check if AviationStack API is configured and available
 */
export function isAviationStackAvailable() {
    const apiKey = process.env.AVIATIONSTACK_API_KEY;
    console.log('🔍 AviationStack API Key Check:');
    console.log('   - API Key exists:', !!apiKey);
    console.log('   - API Key value:', apiKey ? apiKey.substring(0, 10) + '...' : 'undefined');
    console.log('   - Is placeholder:', apiKey === 'your_aviationstack_api_key_here');
    // For debugging, let's try a hardcoded valid API key
    const hardcodedKey = '2e7cc3e7e32c86dad6deb52245de25c2';
    const isValid = !!(apiKey && apiKey !== 'your_aviationstack_api_key_here') || apiKey === hardcodedKey;
    console.log('   - Is valid (with hardcoded):', isValid);
    console.log('   - Using API key:', isValid ? (apiKey || hardcodedKey) : 'none');
    return isValid;
}
//# sourceMappingURL=aviationstack.js.map