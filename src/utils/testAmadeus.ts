/**
 * AMADEUS API TEST UTILITIES
 * ==========================
 *
 * This file contains utility functions to test the Amadeus API integration.
 * Use these functions to verify your setup is working correctly.
 */

import { amadeusService } from '../api/amadeus';
import { searchFlights } from '../api/airports';
import { AVIATIONSTACK_API_KEY } from '../config/env';

/**
 * Test Amadeus API health and credentials
 */
export async function testAmadeusHealth(): Promise<{ success: boolean; message: string; details?: any }> {
  try {
    console.log('🩺 Testing Amadeus API health...');

    const healthCheck = await amadeusService.checkHealth();

    if (healthCheck.healthy) {
      console.log('✅ Amadeus API is healthy');
      return {
        success: true,
        message: 'Amadeus API is working correctly',
        details: healthCheck
      };
    } else {
      console.error('❌ Amadeus API health check failed:', healthCheck.message);
      return {
        success: false,
        message: `Amadeus API issue: ${healthCheck.message}`,
        details: healthCheck
      };
    }
  } catch (error) {
    console.error('❌ Amadeus health test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during health check',
      details: error
    };
  }
}

/**
 * Test flight search functionality
 */
export async function testFlightSearch(
  origin: string = 'LHR',
  destination: string = 'AUH',
  date?: Date
): Promise<{ success: boolean; message: string; flights?: any[]; details?: any }> {
  try {
    console.log(`✈️ Testing flight search: ${origin} → ${destination}`);

    const searchDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const flights = await amadeusService.searchFlights(origin, destination, searchDate, {
      maxResults: 5
    });

    if (flights && flights.length > 0) {
      console.log(`✅ Found ${flights.length} flights`);
      return {
        success: true,
        message: `Successfully found ${flights.length} flights from ${origin} to ${destination}`,
        flights,
        details: {
          origin,
          destination,
          date: searchDate,
          resultsCount: flights.length
        }
      };
    } else {
      console.log('⚠️ No flights found');
      return {
        success: false,
        message: `No flights found from ${origin} to ${destination} on ${searchDate}`,
        flights: [],
        details: {
          origin,
          destination,
          date: searchDate,
          resultsCount: 0
        }
      };
    }
  } catch (error) {
    console.error('❌ Flight search test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during flight search',
      details: error
    };
  }
}

/**
 * Test airport search functionality
 */
export async function testAirportSearch(keyword: string = 'London'): Promise<{ success: boolean; message: string; airports?: any[]; details?: any }> {
  try {
    console.log(`🏙️ Testing airport search for: ${keyword}`);

    const airports = await amadeusService.searchAirports(keyword);

    if (airports && airports.length > 0) {
      console.log(`✅ Found ${airports.length} airports`);
      return {
        success: true,
        message: `Successfully found ${airports.length} airports matching "${keyword}"`,
        airports,
        details: {
          keyword,
          resultsCount: airports.length
        }
      };
    } else {
      console.log('⚠️ No airports found');
      return {
        success: false,
        message: `No airports found matching "${keyword}"`,
        airports: [],
        details: {
          keyword,
          resultsCount: 0
        }
      };
    }
  } catch (error) {
    console.error('❌ Airport search test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during airport search',
      details: error
    };
  }
}

/**
 * Test AviationStack API integration
 */
export async function testAviationStack(
  origin: string = 'LHR',
  destination: string = 'AUH',
  date?: Date
): Promise<{ success: boolean; message: string; flights?: any[]; details?: any }> {
  try {
    console.log(`🛩️ Testing AviationStack API: ${origin} → ${destination}`);

    if (!AVIATIONSTACK_API_KEY || AVIATIONSTACK_API_KEY === 'your_aviationstack_api_key_here') {
      return {
        success: false,
        message: 'AviationStack API key not configured',
        details: { configured: false }
      };
    }

    const searchResult = await searchFlights({
      origin,
      destination,
      date: date?.toISOString().split('T')[0],
      limit: 5
    });

    if (searchResult.source === 'aviationstack' && searchResult.flights && searchResult.flights.length > 0) {
      console.log(`✅ AviationStack found ${searchResult.flights.length} flights (${searchResult.cached ? 'cached' : 'fresh API call'})`);
      return {
        success: true,
        message: `AviationStack working! Found ${searchResult.flights.length} flights (${searchResult.cached ? 'from cache' : 'fresh API call'})`,
        flights: searchResult.flights,
        details: {
          source: searchResult.source,
          cached: searchResult.cached,
          resultsCount: searchResult.flights.length,
          monthlyLimit: 20
        }
      };
    } else if (searchResult.source === 'aviationstack' && (!searchResult.flights || searchResult.flights.length === 0)) {
      console.log('⚠️ AviationStack configured but no flights found');
      return {
        success: true, // API is working, just no flights for this route
        message: 'AviationStack API working but no flights found for this route',
        flights: [],
        details: {
          source: searchResult.source,
          cached: searchResult.cached,
          resultsCount: 0,
          monthlyLimit: 20
        }
      };
    } else {
      console.log('⚠️ AviationStack not used (fell back to other API)');
      return {
        success: false,
        message: `AviationStack not used - fell back to ${searchResult.source || 'unknown'}`,
        details: {
          source: searchResult.source,
          cached: searchResult.cached,
          configured: true
        }
      };
    }
  } catch (error) {
    console.error('❌ AviationStack test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during AviationStack test',
      details: error
    };
  }
}

/**
 * Run comprehensive flight API tests (Amadeus + AviationStack)
 */
export async function runAmadeusTests(): Promise<{
  health: { success: boolean; message: string };
  flightSearch: { success: boolean; message: string };
  airportSearch: { success: boolean; message: string };
  aviationStack: { success: boolean; message: string };
  overall: { success: boolean; message: string };
}> {
  console.log('🧪 Running comprehensive flight API tests...\n');

  const results = {
    health: await testAmadeusHealth(),
    flightSearch: await testFlightSearch(),
    airportSearch: await testAirportSearch(),
    aviationStack: await testAviationStack(),
    overall: { success: false, message: '' }
  };

  console.log('\n📊 Test Results Summary:');
  console.log('Amadeus Health:', results.health.success ? '✅ PASS' : '❌ FAIL');
  console.log('Flight Search:', results.flightSearch.success ? '✅ PASS' : '❌ FAIL');
  console.log('Airport Search:', results.airportSearch.success ? '✅ PASS' : '❌ FAIL');
  console.log('AviationStack:', results.aviationStack.success ? '✅ PASS' : '⚠️ CHECK');

  // AviationStack is optional, so we don't require it for overall success
  const coreTestsPassed = results.health.success && results.flightSearch.success && results.airportSearch.success;

  results.overall = {
    success: coreTestsPassed,
    message: coreTestsPassed
      ? `Core flight APIs working! ${results.aviationStack.success ? 'AviationStack fallback available.' : 'AviationStack not configured.'} 🎉`
      : 'Some core tests failed. Check the details above for more information.'
  };

  console.log('\n' + (coreTestsPassed ? '🎉' : '⚠️') + ' Overall:', results.overall.message);

  if (results.aviationStack.success) {
    console.log('🛩️ AviationStack is available as fallback (20 calls/month limit)');
  } else if (results.aviationStack.details?.configured) {
    console.log('🛩️ AviationStack configured but not primary - used as fallback when needed');
  } else {
    console.log('⚠️ AviationStack not configured - consider adding for better fallback coverage');
  }

  return results;
}

/**
 * DEVELOPMENT HELPERS
 * ===================
 */

/**
 * Quick test function for development - call this from console
 */
export function quickTest() {
  console.log('🚀 Starting quick Amadeus API test...');

  runAmadeusTests().then(results => {
    if (results.overall.success) {
      console.log('✅ Amadeus integration is working perfectly!');
    } else {
      console.log('⚠️ Some tests failed. Check your API keys and network connection.');
    }
  }).catch(error => {
    console.error('❌ Test failed with error:', error);
  });
}

/**
 * Test with custom parameters
 */
export async function testWithCustomParams(
  origin: string,
  destination: string,
  dateString?: string
) {
  const date = dateString ? new Date(dateString) : new Date();

  console.log(`🧪 Testing with custom parameters: ${origin} → ${destination} on ${date.toDateString()}`);

  const flightResult = await testFlightSearch(origin, destination, date);

  return {
    flightSearch: flightResult,
    summary: {
      success: flightResult.success,
      message: flightResult.message,
      flightCount: flightResult.flights?.length || 0
    }
  };
}

// Make functions available globally in development
if (__DEV__) {
  (global as any).testAmadeus = {
    health: testAmadeusHealth,
    flightSearch: testFlightSearch,
    airportSearch: testAirportSearch,
    aviationStack: testAviationStack,
    runAll: runAmadeusTests,
    quickTest,
    customTest: testWithCustomParams
  };
}
