import { Router } from "express";
import { getFlightByNumberDate } from "../../providers/aerodatabox";
import { 
  incrUsage, 
  recordProviderUsage 
} from "../../db";
import { prisma } from "../../db";
import { 
  attachSubjectId,
  getSubjectId 
} from "../../middleware/subject";
import { 
  checkFlightResolveLimit,
  checkMonthlyUsageLimit,
  getPlan
} from "../../middleware/entitlement";

export const flightsRouter = Router();

// Apply subject ID middleware to all routes
flightsRouter.use(attachSubjectId);

/**
 * POST /api/flights/resolve
 * Resolve flight information by number and date
 * Body: { airlineIATA, flightNumber, departDateLocal, tripId? }
 */
flightsRouter.post("/resolve", async (req, res, next) => {
  try {
    const { airlineIATA, flightNumber, departDateLocal, tripId } = req.body;
    const subjectId = getSubjectId(req);
    const plan = await getPlan(req);
    
    // Validate required parameters
    if (!airlineIATA || !flightNumber || !departDateLocal) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "airlineIATA, flightNumber, and departDateLocal are required"
      });
    }

    // Validate airline IATA code format
    if (!/^[A-Z]{2,3}$/.test(airlineIATA)) {
      return res.status(400).json({
        error: "Invalid airline IATA code",
        message: "Airline IATA code must be 2-3 uppercase letters"
      });
    }

    // Validate flight number format
    if (!/^\d+$/.test(flightNumber)) {
      return res.status(400).json({
        error: "Invalid flight number",
        message: "Flight number must contain only digits"
      });
    }

    // Parse and validate date
    const departDate = new Date(departDateLocal);
    if (isNaN(departDate.getTime())) {
      return res.status(400).json({
        error: "Invalid date format",
        message: "departDateLocal must be a valid date string"
      });
    }

    // Enforce flight resolve limits
    if (tripId) {
      const canResolve = await checkFlightResolveLimit(req, tripId);
      if (!canResolve) {
        return res.status(403).json({
          error: "Flight resolve limit exceeded",
          message: "Free users are limited to one resolved flight per trip. Upgrade to Pro for unlimited flight resolution."
        });
      }
    } else if (plan === 'free') {
      return res.status(400).json({
        error: "Trip ID required for free users",
        message: "Free users must provide tripId to track flight resolution limits"
      });
    }

    // Check monthly usage limits
    const usageCheck = await checkMonthlyUsageLimit(req, 'flightResolves');
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "Monthly limit exceeded",
        message: `You have reached your monthly limit of ${usageCheck.limit} flight resolutions. Current usage: ${usageCheck.current}`,
        usage: {
          current: usageCheck.current,
          limit: usageCheck.limit,
          plan
        }
      });
    }

    // Format date for AeroDataBox API (YYYY-MM-DD)
    const dateYYYYMMDD = departDate.toISOString().split('T')[0];

    console.log('🔍 Flight resolution request:', {
      airlineIATA,
      flightNumber,
      departDateLocal,
      dateYYYYMMDD,
      tripId,
      subjectId,
      plan
    });

    // Resolve flight via AeroDataBox
    const flightSegment = await getFlightByNumberDate({
      airlineIATA,
      flightNumber,
      dateYYYYMMDD
    });

    // If tripId is provided, upsert FlightSegment
    if (tripId) {
      try {
        await prisma.flightSegment.upsert({
          where: {
            tripId_carrier_number: {
              tripId,
              carrier: flightSegment.carrier,
              number: flightSegment.number
            }
          },
          update: {
            departIATA: flightSegment.depart.iata,
            arriveIATA: flightSegment.arrive.iata,
            departTime: flightSegment.depart.timeScheduled ? new Date(flightSegment.depart.timeScheduled) : new Date(),
            arriveTime: flightSegment.arrive.timeScheduled ? new Date(flightSegment.arrive.timeScheduled) : new Date(),
            departTerminal: flightSegment.depart.terminal,
            departGate: flightSegment.depart.gate,
            arriveTerminal: flightSegment.arrive.terminal,
            arriveGate: flightSegment.arrive.gate,
            status: flightSegment.status,
            updatedAt: new Date()
          },
          create: {
            tripId,
            carrier: flightSegment.carrier,
            number: flightSegment.number,
            departIATA: flightSegment.depart.iata,
            arriveIATA: flightSegment.arrive.iata,
            departTime: flightSegment.depart.timeScheduled ? new Date(flightSegment.depart.timeScheduled) : new Date(),
            arriveTime: flightSegment.arrive.timeScheduled ? new Date(flightSegment.arrive.timeScheduled) : new Date(),
            departTerminal: flightSegment.depart.terminal,
            departGate: flightSegment.depart.gate,
            arriveTerminal: flightSegment.arrive.terminal,
            arriveGate: flightSegment.arrive.gate,
            status: flightSegment.status
          }
        });

        console.log('✅ Flight segment upserted for trip:', tripId);
      } catch (dbError) {
        console.error('❌ Database error upserting flight segment:', dbError);
        // Continue with the response even if database save fails
      }
    }

    // Update usage metrics
    try {
      // Increment flight resolves count
      await incrUsage(subjectId, {
        flightResolves: 1
      });

      // Record provider usage (AeroDataBox)
      await recordProviderUsage({
        provider: 'aerodatabox',
        endpoint: 'flights/flightNumber',
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
      success: true,
      flight: flightSegment,
      tripId,
      usage: {
        subjectId,
        plan,
        flightResolves: 1
      }
    });

  } catch (error) {
    console.error('❌ Flight resolution error:', error);
    
    if (error instanceof Error && error.message.includes('No flights found')) {
      return res.status(404).json({
        error: 'Flight not found',
        message: error.message
      });
    }

    next(error);
  }
});

/**
 * GET /api/flights/status
 * Get current flight status
 * Query: { carrier, number, date }
 */
flightsRouter.get("/status", async (req, res, next) => {
  try {
    const { carrier, number, date } = req.query;
    const subjectId = getSubjectId(req);
    
    // Validate required parameters
    if (!carrier || !number || !date) {
      return res.status(400).json({
        error: "Missing required parameters",
        message: "carrier, number, and date are required"
      });
    }

    // Validate date format
    const flightDate = new Date(String(date));
    if (isNaN(flightDate.getTime())) {
      return res.status(400).json({
        error: "Invalid date format",
        message: "date must be a valid date string"
      });
    }

    // Format date for AeroDataBox API (YYYY-MM-DD)
    const dateYYYYMMDD = flightDate.toISOString().split('T')[0];

    console.log('🔍 Flight status request:', {
      carrier: String(carrier),
      number: String(number),
      date: String(date),
      dateYYYYMMDD,
      subjectId
    });

    // Get flight status via AeroDataBox
    const flightSegment = await getFlightByNumberDate({
      airlineIATA: String(carrier),
      flightNumber: String(number),
      dateYYYYMMDD
    });

    // Update usage metrics
    try {
      // Record provider usage (AeroDataBox)
      await recordProviderUsage({
        provider: 'aerodatabox',
        endpoint: 'flights/flightNumber',
        units: 1,
        costCents: 0,
        subjectId
      });

      console.log('✅ Provider usage recorded for subject:', subjectId);
    } catch (usageError) {
      console.error('❌ Error recording provider usage:', usageError);
      // Continue with the response even if usage tracking fails
    }

    res.json({
      success: true,
      flight: flightSegment,
      usage: {
        subjectId,
        provider: 'aerodatabox'
      }
    });

  } catch (error) {
    console.error('❌ Flight status error:', error);
    
    if (error instanceof Error && error.message.includes('No flights found')) {
      return res.status(404).json({
        error: 'Flight not found',
        message: error.message
      });
    }

    next(error);
  }
});

/**
 * GET /api/flights/trip/:tripId
 * Get all resolved flights for a specific trip
 */
flightsRouter.get("/trip/:tripId", async (req, res, next) => {
  try {
    const { tripId } = req.params;
    
    if (!tripId) {
      return res.status(400).json({
        error: "Missing trip ID",
        message: "tripId is required"
      });
    }

    const flights = await prisma.flightSegment.findMany({
      where: { tripId },
      orderBy: { departTime: 'asc' }
    });

    res.json({
      success: true,
      tripId,
      flights,
      count: flights.length
    });

  } catch (error) {
    console.error('❌ Get trip flights error:', error);
    next(error);
  }
});
