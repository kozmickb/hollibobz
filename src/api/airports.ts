import api from "./client";

export async function fetchAirportSchedule(
  iata: string,
  params?: {
    offsetMinutes?: number;
    durationMinutes?: number;
    direction?: "Arrival" | "Departure" | "Both";
  }
) {
  return api.get(`/api/airports/${encodeURIComponent(iata)}/schedule`, { params }).then(r => r.data);
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
  return api.get("/api/airports/search", { params }).then(r => r.data);
}