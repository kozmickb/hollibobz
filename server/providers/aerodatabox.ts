import axios from "axios";

type AeroParams = {
  iata: string;
  offsetMinutes?: number;
  durationMinutes?: number;
  direction?: "Arrival" | "Departure" | "Both";
  withLeg?: boolean;
  withCancelled?: boolean;
  withCodeshared?: boolean;
  withCargo?: boolean;
  withPrivate?: boolean;
  withLocation?: boolean;
};

export async function getAirportScheduleByIATA(params: AeroParams) {
  const host = process.env.AERODATABOX_RAPIDAPI_HOST;
  const key = process.env.AERODATABOX_RAPIDAPI_KEY;
  if (!host || !key) throw new Error("AeroDataBox RapidAPI env not set");

  const {
    iata,
    offsetMinutes = -120,
    durationMinutes = 720,
    direction = "Both",
    withLeg = true,
    withCancelled = true,
    withCodeshared = true,
    withCargo = true,
    withPrivate = true,
    withLocation = false,
  } = params;

  const url = `https://${host}/flights/airports/iata/${encodeURIComponent(iata)}`;

  const res = await axios.get(url, {
    params: {
      offsetMinutes,
      durationMinutes,
      withLeg,
      direction,
      withCancelled,
      withCodeshared,
      withCargo,
      withPrivate,
      withLocation,
    },
    headers: {
      "x-rapidapi-host": host,
      "x-rapidapi-key": key,
    },
    timeout: 15000,
  });

  // Map provider data to a normalized shape
  // Provider schema can vary. Map the common fields defensively.
  const data = res.data;

  const normalize = (item: any) => {
    const dep = item.departure || item.dep || {};
    const arr = item.arrival || item.arr || {};
    const carrier = item.airline?.iata || item.airline?.icao || item.airline?.name || "";
    const number =
      item.flight?.number ||
      item.number ||
      `${item.airline?.iata ?? ""}${item.number ?? ""}`;

    return {
      carrier,
      number: String(number),
      depart: {
        iata: dep?.iata || dep?.airport?.iata || "",
        timeScheduled: dep?.scheduledTimeLocal || dep?.scheduledTime || null,
        terminal: dep?.terminal || null,
        gate: dep?.gate || null,
      },
      arrive: {
        iata: arr?.iata || arr?.airport?.iata || "",
        timeScheduled: arr?.scheduledTimeLocal || arr?.scheduledTime || null,
        terminal: arr?.terminal || null,
        gate: arr?.gate || null,
      },
      status: item.status || null,
      raw: item,
    };
  };

  const arrivals = Array.isArray(data.arrivals) ? data.arrivals.map(normalize) : [];
  const departures = Array.isArray(data.departures) ? data.departures.map(normalize) : [];

  return { arrivals, departures, raw: data };
}

/**
 * Get flight information by flight number and date
 * @param params Flight search parameters
 * @returns Normalized flight segment data
 */
export async function getFlightByNumberDate({
  airlineIATA,
  flightNumber,
  dateYYYYMMDD
}: {
  airlineIATA: string;
  flightNumber: string;
  dateYYYYMMDD: string;
}) {
  const host = process.env.AERODATABOX_RAPIDAPI_HOST;
  const key = process.env.AERODATABOX_RAPIDAPI_KEY;
  if (!host || !key) throw new Error("AeroDataBox RapidAPI env not set");

  // AeroDataBox endpoint for flight by number and date
  const url = `https://${host}/flights/flightNumber/${encodeURIComponent(airlineIATA)}${encodeURIComponent(flightNumber)}/${dateYYYYMMDD}`;

  const res = await axios.get(url, {
    headers: {
      "x-rapidapi-host": host,
      "x-rapidapi-key": key,
    },
    timeout: 15000,
  });

  const data = res.data;
  
  // Handle case where no flights found
  if (!data || !Array.isArray(data) || data.length === 0) {
    throw new Error(`No flights found for ${airlineIATA}${flightNumber} on ${dateYYYYMMDD}`);
  }

  // Get the first (most relevant) flight
  const flight = data[0];
  
  // Normalize the flight data
  const dep = flight.departure || flight.dep || {};
  const arr = flight.arrival || flight.arr || {};
  const carrier = flight.airline?.iata || flight.airline?.icao || flight.airline?.name || airlineIATA;
  const number = flight.flight?.number || flight.number || flightNumber;

  const normalized = {
    carrier,
    number: String(number),
    depart: {
      iata: dep?.iata || dep?.airport?.iata || "",
      timeScheduled: dep?.scheduledTimeLocal || dep?.scheduledTime || null,
      terminal: dep?.terminal || null,
      gate: dep?.gate || null,
    },
    arrive: {
      iata: arr?.iata || arr?.airport?.iata || "",
      timeScheduled: arr?.scheduledTimeLocal || arr?.scheduledTime || null,
      terminal: arr?.terminal || null,
      gate: arr?.gate || null,
    },
    status: flight.status || "Unknown",
    raw: flight,
  };

  return normalized;
}
