/**
 * AMADEUS FLIGHT API SERVICE
 * ===========================
 *
 * This service handles all Amadeus API interactions including:
 * - OAuth2 authentication
 * - Flight search
 * - Error handling and retries
 * - Rate limiting
 */

import { AMADEUS_API_KEY, AMADEUS_API_SECRET } from '../config/env';
import { flightAPIRequestManager, logFlightAPIMetrics } from '../utils/flightCache';

export interface AmadeusFlightOffer {
  id: string;
  itineraries: Array<{
    segments: Array<{
      carrierCode: string;
      number: string;
      departure: {
        iataCode: string;
        at: string;
        terminal?: string;
      };
      arrival: {
        iataCode: string;
        at: string;
        terminal?: string;
      };
      aircraft: {
        code: string;
      };
      duration: string;
    }>;
  }>;
  price: {
    total: string;
    currency: string;
  };
  validatingAirlineCodes: string[];
}

export interface AmadeusSearchResponse {
  data: AmadeusFlightOffer[];
  meta: {
    count: number;
  };
}

class AmadeusService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private readonly BASE_URL = 'https://test.api.amadeus.com';

  /**
   * Get a valid access token for Amadeus API
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
      throw new Error('Amadeus API credentials not configured. Please check your environment variables.');
    }

    const startTime = Date.now();

    try {
      console.log('🔐 Requesting Amadeus access token...');

      const response = await flightAPIRequestManager.makeAPIRequest(
        `${this.BASE_URL}/v1/security/oauth2/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: AMADEUS_API_KEY,
            client_secret: AMADEUS_API_SECRET
          })
        }
      );

      const tokenData = response as any;

      if (!tokenData.access_token) {
        throw new Error('Failed to obtain access token from Amadeus');
      }

      this.accessToken = tokenData.access_token;
      // Set expiry to 5 minutes before actual expiry for safety
      this.tokenExpiry = new Date(Date.now() + (tokenData.expires_in - 300) * 1000);

      logFlightAPIMetrics('Amadeus', 'oauth2/token', true, Date.now() - startTime);

      console.log('✅ Amadeus access token obtained successfully');
      return this.accessToken;

    } catch (error) {
      logFlightAPIMetrics('Amadeus', 'oauth2/token', false, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Failed to get Amadeus access token:', error);
      throw error;
    }
  }

  /**
   * Search for flights between two airports on a specific date
   */
  async searchFlights(
    origin: string,
    destination: string,
    departureDate: string,
    options: {
      returnDate?: string;
      adults?: number;
      children?: number;
      infants?: number;
      travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
      maxResults?: number;
    } = {}
  ): Promise<AmadeusFlightOffer[]> {
    const startTime = Date.now();

    try {
      const accessToken = await this.getAccessToken();

      const params = new URLSearchParams({
        originLocationCode: origin.toUpperCase(),
        destinationLocationCode: destination.toUpperCase(),
        departureDate,
        adults: String(options.adults || 1),
        max: String(options.maxResults || 10),
        currencyCode: 'USD'
      });

      if (options.returnDate) {
        params.append('returnDate', options.returnDate);
      }

      if (options.children) {
        params.append('children', String(options.children));
      }

      if (options.infants) {
        params.append('infants', String(options.infants));
      }

      if (options.travelClass) {
        params.append('travelClass', options.travelClass);
      }

      const url = `${this.BASE_URL}/v2/shopping/flight-offers?${params.toString()}`;

      console.log(`✈️ Searching flights: ${origin} → ${destination} on ${departureDate}`);

      const response = await flightAPIRequestManager.makeAPIRequest(
        url,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const searchData = response as AmadeusSearchResponse;

      logFlightAPIMetrics('Amadeus', 'flight-search', true, Date.now() - startTime);

      console.log(`✅ Found ${searchData.data.length} flights from Amadeus`);

      return searchData.data;

    } catch (error) {
      logFlightAPIMetrics('Amadeus', 'flight-search', false, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Amadeus flight search failed:', error);
      throw error;
    }
  }

  /**
   * Get flight offer details by offer ID
   */
  async getFlightOfferDetails(offerId: string): Promise<any> {
    const startTime = Date.now();

    try {
      const accessToken = await this.getAccessToken();

      console.log(`📋 Getting flight offer details for: ${offerId}`);

      const response = await flightAPIRequestManager.makeAPIRequest(
        `${this.BASE_URL}/v2/shopping/flight-offers/${offerId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logFlightAPIMetrics('Amadeus', 'flight-offer-details', true, Date.now() - startTime);

      return response;

    } catch (error) {
      logFlightAPIMetrics('Amadeus', 'flight-offer-details', false, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Failed to get flight offer details:', error);
      throw error;
    }
  }

  /**
   * Search for airports by keyword
   */
  async searchAirports(keyword: string): Promise<any[]> {
    const startTime = Date.now();

    try {
      const accessToken = await this.getAccessToken();

      console.log(`🏙️ Searching airports for: ${keyword}`);

      const response = await flightAPIRequestManager.makeAPIRequest(
        `${this.BASE_URL}/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(keyword)}&page%5Blimit%5D=10`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      logFlightAPIMetrics('Amadeus', 'airport-search', true, Date.now() - startTime);

      return response.data || [];

    } catch (error) {
      logFlightAPIMetrics('Amadeus', 'airport-search', false, Date.now() - startTime, error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ Airport search failed:', error);
      throw error;
    }
  }

  /**
   * Check API health and credentials
   */
  async checkHealth(): Promise<{ healthy: boolean; message: string }> {
    try {
      await this.getAccessToken();
      return { healthy: true, message: 'Amadeus API is healthy' };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const amadeusService = new AmadeusService();

/**
 * LEGACY FUNCTIONS FOR BACKWARD COMPATIBILITY
 * These functions maintain compatibility with existing code
 */

export async function callAmadeusAPI(
  origin: string,
  destination: string,
  date?: Date
): Promise<any[]> {
  try {
    const departureDate = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    const offers = await amadeusService.searchFlights(origin, destination, departureDate);

    // Transform Amadeus format to our internal format
    return offers.map((offer: AmadeusFlightOffer) => {
      const segment = offer.itineraries[0].segments[0];
      return {
        flight: {
          number: segment.carrierCode + segment.number,
          iata: segment.carrierCode,
          icao: 'XXX' // Would need airline lookup
        },
        airline: {
          name: segment.carrierCode // Would need airline lookup
        },
        departure: {
          airport: segment.departure.iataCode,
          scheduled: segment.departure.at,
          terminal: segment.departure.terminal || undefined,
          gate: undefined // Not always available
        },
        arrival: {
          airport: segment.arrival.iataCode,
          scheduled: segment.arrival.at,
          terminal: segment.arrival.terminal || undefined,
          gate: undefined // Not always available
        },
        aircraft: {
          iata: segment.aircraft.code
        },
        status: 'Scheduled', // Amadeus doesn't provide real-time status
        price: offer.price
      };
    });

  } catch (error) {
    console.error('Legacy Amadeus API call failed:', error);
    return [];
  }
}
