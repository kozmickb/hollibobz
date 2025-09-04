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
export declare function getAirportScheduleByIATA(params: AeroParams): Promise<{
    arrivals: any;
    departures: any;
    raw: any;
}>;
/**
 * Get flight information by flight number and date
 * @param params Flight search parameters
 * @returns Normalized flight segment data
 */
export declare function getFlightByNumberDate({ airlineIATA, flightNumber, dateYYYYMMDD }: {
    airlineIATA: string;
    flightNumber: string;
    dateYYYYMMDD: string;
}): Promise<{
    carrier: any;
    number: string;
    depart: {
        iata: any;
        timeScheduled: any;
        terminal: any;
        gate: any;
    };
    arrive: {
        iata: any;
        timeScheduled: any;
        terminal: any;
        gate: any;
    };
    status: any;
    raw: any;
}>;
export {};
//# sourceMappingURL=aerodatabox.d.ts.map