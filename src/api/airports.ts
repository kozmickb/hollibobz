import { API_BASE_URL } from "../config/env";

export async function fetchAirportSchedule(
  iata: string,
  params?: {
    offsetMinutes?: number;
    durationMinutes?: number;
    direction?: "Arrival" | "Departure" | "Both";
  }
) {
  const response = await fetch(`${API_BASE_URL}/api/airports/${encodeURIComponent(iata)}/schedule`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Airport schedule error: ${response.status}`);
  }

  return await response.json();
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  date?: string;
  limit?: number;
}

export interface FlightSearchResult {
  origin: string;
  destination: string;
  date: string;
  flights: any[];
  count: number;
  source: string;
  aviationStackAvailable: boolean;
  cached: boolean;
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightSearchResult> {
  const { origin, destination, date, limit = 10 } = params;

  const queryParams = new URLSearchParams({
    origin,
    destination,
    limit: limit.toString()
  });

  if (date) {
    queryParams.append('date', date);
  }

  const response = await fetch(`${API_BASE_URL}/api/airports/search?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Flight search error: ${response.status}`);
  }

  return await response.json();
}