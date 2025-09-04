import api from "./client";

export interface FlightResolvePayload {
  airlineIATA: string;
  flightNumber: string;
  departDateLocal: string;
  tripId?: string;
}

export interface FlightStatusQuery {
  carrier: string;
  number: string;
  date: string;
}

export interface FlightSegment {
  carrier: string;
  number: string;
  depart: {
    iata: string;
    timeScheduled: string | null;
    terminal: string | null;
    gate: string | null;
  };
  arrive: {
    iata: string;
    timeScheduled: string | null;
    terminal: string | null;
    gate: string | null;
  };
  status: string;
  raw: any;
}

export interface FlightResolveResponse {
  success: boolean;
  flight: FlightSegment;
  tripId?: string;
  usage: {
    subjectId: string;
    monthKey: string;
    flightResolves: number;
  };
}

export interface FlightStatusResponse {
  success: boolean;
  flight: FlightSegment;
  usage: {
    subjectId: string;
    monthKey: string;
    provider: string;
  };
}

/**
 * Resolve flight information by number and date
 */
export async function resolveFlight(payload: FlightResolvePayload): Promise<FlightResolveResponse> {
  return api.post("/api/flights/resolve", payload).then(r => r.data);
}

/**
 * Get current flight status by carrier, number, and date
 */
export async function getFlightStatus(query: FlightStatusQuery): Promise<FlightStatusResponse> {
  return api.get("/api/flights/status", { params: query }).then(r => r.data);
}

/**
 * Get all resolved flights for a specific trip
 */
export async function getTripFlights(tripId: string): Promise<{
  success: boolean;
  tripId: string;
  flights: any[];
  count: number;
}> {
  return api.get(`/api/flights/trip/${encodeURIComponent(tripId)}`).then(r => r.data);
}
