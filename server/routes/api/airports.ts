import { Router } from "express";
import { getAirportScheduleByIATA } from "../../providers/aerodatabox";
import { searchFlightsAviationStack, isAviationStackAvailable } from "../../providers/aviationstack";
import { 
  incrUsage, 
  recordProviderUsage 
} from "../../db";
import { 
  attachSubjectId,
  getSubjectId 
} from "../../middleware/subject";
import { 
  getPlan,
  checkMonthlyUsageLimit,
  LIMIT_RULES
} from "../../middleware/entitlement";

export const airportsRouter = Router();

// Apply subject ID middleware
airportsRouter.use(attachSubjectId);

/**
 * GET /api/airports/:iata/schedule
 * Query
 *   offsetMinutes number default -120
 *   durationMinutes number default 720
 *   direction Arrival | Departure | Both default Both
 */
airportsRouter.get("/:iata/schedule", async (req, res, next) => {
  try {
    const subjectId = getSubjectId(req);
    const plan = await getPlan(req);
    const iata = String(req.params.iata || "").toUpperCase();
    
    if (!iata || iata.length !== 3) {
      return res.status(400).json({ error: "IATA code required" });
    }

    const offsetMinutes = req.query.offsetMinutes ? Number(req.query.offsetMinutes) : undefined;
    const durationMinutes = req.query.durationMinutes ? Number(req.query.durationMinutes) : undefined;
    const direction = req.query.direction as "Arrival" | "Departure" | "Both" | undefined;

    // Check monthly usage limits
    const usageCheck = await checkMonthlyUsageLimit(req, 'airportQueries');
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "Monthly limit exceeded",
        message: `You have reached your monthly limit of ${usageCheck.limit} airport queries. Current usage: ${usageCheck.current}`,
        usage: {
          current: usageCheck.current,
          limit: usageCheck.limit,
          plan
        }
      });
    }

    // Apply entitlement-based gating
    const maxDuration = LIMIT_RULES.airportWindow(plan);
    const safeDuration = Math.min(Number(durationMinutes ?? maxDuration), maxDuration);

    console.log('🔍 Airport schedule request:', {
      iata,
      offsetMinutes,
      requestedDuration: durationMinutes,
      safeDuration,
      direction: direction ?? "Both",
      subjectId,
      plan
    });

    const result = await getAirportScheduleByIATA({
      iata,
      offsetMinutes,
      durationMinutes: safeDuration,
      direction: direction ?? "Both",
    });

    // Update usage metrics
    try {
      // Increment airport queries count
      await incrUsage(subjectId, {
        airportQueries: 1
      });

      // Record provider usage (AeroDataBox)
      await recordProviderUsage({
        provider: 'aerodatabox',
        endpoint: 'flights/airports/iata',
        units: 1,
        costCents: 0, // AeroDataBox costs are typically per API call, not per unit
        subjectId
      });

      console.log('✅ Usage metrics updated for subject:', subjectId);
    } catch (usageError) {
      console.error('❌ Error updating usage metrics:', usageError);
      // Continue with the response even if usage tracking fails
    }

    res.json({ 
      iata, 
      ...result, 
      entitlements: {
        plan,
        maxDuration,
        actualDuration: safeDuration
      },
      usage: {
        subjectId,
        plan,
        airportQueries: 1
      }
    });
  } catch (err) {
    console.error('❌ Airport schedule error:', err);
    next(err);
  }
});

/**
 * GET /api/airports/search
 * Query parameters:
 *   origin: string (required) - Origin airport IATA code
 *   destination: string (required) - Destination airport IATA code
 *   date: string (optional) - Flight date in YYYY-MM-DD format
 *   limit: number (optional) - Maximum number of results (default: 10)
 */
airportsRouter.get("/search", async (req, res, next) => {
  try {
    const { origin, destination, date, limit = 10 } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "Both 'origin' and 'destination' airport codes are required"
      });
    }

    const originCode = String(origin).toUpperCase();
    const destinationCode = String(destination).toUpperCase();

    if (originCode.length !== 3 || destinationCode.length !== 3) {
      return res.status(400).json({
        error: "Invalid airport codes",
        message: "Airport codes must be 3-letter IATA codes (e.g., LHR, JFK)"
      });
    }

    const searchDate = date ? new Date(String(date)) : new Date();
    const maxResults = Math.min(Number(limit) || 10, 25); // Cap at 25 to be reasonable

    console.log('🔍 Flight search request:', {
      origin: originCode,
      destination: destinationCode,
      date: searchDate.toISOString().split('T')[0],
      limit: maxResults
    });

    // Try AviationStack first (if available) due to very low limits
    let flights: any[] = [];
    let source = 'none';

    if (isAviationStackAvailable()) {
      console.log('🛩️ Trying AviationStack API (limited to 20 calls/month)...');
      flights = await searchFlightsAviationStack(originCode, destinationCode, searchDate, {
        limit: maxResults
      });

      if (flights.length > 0) {
        source = 'aviationstack';
        console.log(`✅ Found ${flights.length} flights from AviationStack`);
      } else {
        console.log('⚠️ AviationStack returned no flights');
      }
    } else {
      console.log('⚠️ AviationStack not configured - skipping');
    }

    // If no flights found and we didn't use AviationStack, try AeroDataBox as backup
    if (flights.length === 0 && source !== 'aviationstack') {
      console.log('🔄 Falling back to AeroDataBox...');

      // Convert flight search to airport schedule format for AeroDataBox
      try {
        const scheduleResult = await getAirportScheduleByIATA({
          iata: originCode,
          offsetMinutes: 0,
          durationMinutes: 720, // 12 hours (AeroDataBox API limit)
          direction: "Departure"
        });

        // Filter for destination airport
        const relevantFlights = scheduleResult.departures.filter((flight: any) =>
          flight.arrive.iata === destinationCode
        );

        if (relevantFlights.length > 0) {
          flights = relevantFlights.slice(0, maxResults);
          source = 'aerodatabox';
          console.log(`✅ Found ${flights.length} flights from AeroDataBox`);
        }
      } catch (error) {
        console.error('❌ AeroDataBox fallback failed:', error);
      }
    }

    const response = {
      origin: originCode,
      destination: destinationCode,
      date: searchDate.toISOString().split('T')[0],
      flights: flights,
      count: flights.length,
      source: source,
      aviationStackAvailable: isAviationStackAvailable(),
      cached: source === 'aviationstack' // AviationStack results are always cached
    };

    // Log usage warnings for AviationStack
    if (source === 'aviationstack') {
      console.log('⚠️ IMPORTANT: AviationStack API used - monitor monthly usage (20 calls limit)');
    }

    res.json(response);

  } catch (err) {
    console.error('Flight search error:', err);
    next(err);
  }
});
