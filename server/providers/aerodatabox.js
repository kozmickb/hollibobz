import axios from "axios";
export async function getAirportScheduleByIATA(params) {
    const host = process.env.AERODATABOX_RAPIDAPI_HOST;
    const key = process.env.AERODATABOX_RAPIDAPI_KEY;
    if (!host || !key)
        throw new Error("AeroDataBox RapidAPI env not set");
    const { iata, offsetMinutes = -120, durationMinutes = 720, direction = "Both", withLeg = true, withCancelled = true, withCodeshared = true, withCargo = true, withPrivate = true, withLocation = false, } = params;
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
    const normalize = (item) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        const dep = item.departure || item.dep || {};
        const arr = item.arrival || item.arr || {};
        const carrier = ((_a = item.airline) === null || _a === void 0 ? void 0 : _a.iata) || ((_b = item.airline) === null || _b === void 0 ? void 0 : _b.icao) || ((_c = item.airline) === null || _c === void 0 ? void 0 : _c.name) || "";
        const number = ((_d = item.flight) === null || _d === void 0 ? void 0 : _d.number) ||
            item.number ||
            `${(_f = (_e = item.airline) === null || _e === void 0 ? void 0 : _e.iata) !== null && _f !== void 0 ? _f : ""}${(_g = item.number) !== null && _g !== void 0 ? _g : ""}`;
        return {
            carrier,
            number: String(number),
            depart: {
                iata: (dep === null || dep === void 0 ? void 0 : dep.iata) || ((_h = dep === null || dep === void 0 ? void 0 : dep.airport) === null || _h === void 0 ? void 0 : _h.iata) || "",
                timeScheduled: (dep === null || dep === void 0 ? void 0 : dep.scheduledTimeLocal) || (dep === null || dep === void 0 ? void 0 : dep.scheduledTime) || null,
                terminal: (dep === null || dep === void 0 ? void 0 : dep.terminal) || null,
                gate: (dep === null || dep === void 0 ? void 0 : dep.gate) || null,
            },
            arrive: {
                iata: (arr === null || arr === void 0 ? void 0 : arr.iata) || ((_j = arr === null || arr === void 0 ? void 0 : arr.airport) === null || _j === void 0 ? void 0 : _j.iata) || "",
                timeScheduled: (arr === null || arr === void 0 ? void 0 : arr.scheduledTimeLocal) || (arr === null || arr === void 0 ? void 0 : arr.scheduledTime) || null,
                terminal: (arr === null || arr === void 0 ? void 0 : arr.terminal) || null,
                gate: (arr === null || arr === void 0 ? void 0 : arr.gate) || null,
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
export async function getFlightByNumberDate({ airlineIATA, flightNumber, dateYYYYMMDD }) {
    var _a, _b, _c, _d, _e, _f;
    const host = process.env.AERODATABOX_RAPIDAPI_HOST;
    const key = process.env.AERODATABOX_RAPIDAPI_KEY;
    if (!host || !key)
        throw new Error("AeroDataBox RapidAPI env not set");
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
    const carrier = ((_a = flight.airline) === null || _a === void 0 ? void 0 : _a.iata) || ((_b = flight.airline) === null || _b === void 0 ? void 0 : _b.icao) || ((_c = flight.airline) === null || _c === void 0 ? void 0 : _c.name) || airlineIATA;
    const number = ((_d = flight.flight) === null || _d === void 0 ? void 0 : _d.number) || flight.number || flightNumber;
    const normalized = {
        carrier,
        number: String(number),
        depart: {
            iata: (dep === null || dep === void 0 ? void 0 : dep.iata) || ((_e = dep === null || dep === void 0 ? void 0 : dep.airport) === null || _e === void 0 ? void 0 : _e.iata) || "",
            timeScheduled: (dep === null || dep === void 0 ? void 0 : dep.scheduledTimeLocal) || (dep === null || dep === void 0 ? void 0 : dep.scheduledTime) || null,
            terminal: (dep === null || dep === void 0 ? void 0 : dep.terminal) || null,
            gate: (dep === null || dep === void 0 ? void 0 : dep.gate) || null,
        },
        arrive: {
            iata: (arr === null || arr === void 0 ? void 0 : arr.iata) || ((_f = arr === null || arr === void 0 ? void 0 : arr.airport) === null || _f === void 0 ? void 0 : _f.iata) || "",
            timeScheduled: (arr === null || arr === void 0 ? void 0 : arr.scheduledTimeLocal) || (arr === null || arr === void 0 ? void 0 : arr.scheduledTime) || null,
            terminal: (arr === null || arr === void 0 ? void 0 : arr.terminal) || null,
            gate: (arr === null || arr === void 0 ? void 0 : arr.gate) || null,
        },
        status: flight.status || "Unknown",
        raw: flight,
    };
    return normalized;
}
//# sourceMappingURL=aerodatabox.js.map