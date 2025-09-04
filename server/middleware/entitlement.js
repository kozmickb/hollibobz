import { prisma } from '../db';
import { getSubjectId } from './subject';
/**
 * Get user plan based on RevenueCat and Trial status
 */
export async function getPlan(req) {
    const subjectId = getSubjectId(req);
    // TODO: Check RevenueCat for pro status
    // if (await checkRevenueCatPro(subjectId)) {
    //   return 'pro';
    // }
    // Check if user has an active trial
    try {
        const trial = await prisma.trial.findUnique({
            where: { subjectId }
        });
        if (trial && new Date() < trial.endsAt) {
            return 'trial';
        }
    }
    catch (error) {
        console.error('Error checking trial status:', error);
    }
    return 'free';
}
/**
 * Enforce limits based on plan type
 */
export function enforceLimit(kind, computeAllowed) {
    return async (req, res, next) => {
        try {
            const plan = await getPlan(req);
            const allowed = computeAllowed(plan);
            // Attach plan info to request
            req.plan = plan;
            req.limitAllowed = allowed;
            next();
        }
        catch (error) {
            console.error('Error enforcing limit:', error);
            res.status(500).json({ error: 'Failed to check entitlements' });
        }
    };
}
/**
 * Specific limit rules
 */
export const LIMIT_RULES = {
    // Flight resolution: free allows 1 per trip, trial/pro unlimited
    flightResolvePerTrip: (plan) => {
        return plan === 'free' ? 1 : Infinity;
    },
    // Airport schedule window: free max 240 minutes, trial/pro 720
    airportWindow: (plan) => {
        return plan === 'free' ? 240 : 720;
    },
    // AI generations per month: free max 10, trial 50, pro unlimited
    aiGenerationsPerMonth: (plan) => {
        switch (plan) {
            case 'free': return 10;
            case 'trial': return 50;
            case 'pro': return Infinity;
        }
    },
    // File size limit: free max 5MB, trial/pro 10MB
    fileSizeLimit: (plan) => {
        return plan === 'free' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB vs 10MB
    }
};
/**
 * Middleware to check if user can resolve more flights for a trip
 */
export async function checkFlightResolveLimit(req, tripId) {
    const plan = await getPlan(req);
    if (plan === 'pro' || plan === 'trial') {
        return true; // Unlimited for paid users
    }
    // For free users, check existing resolved flights for this trip
    try {
        const existingFlights = await prisma.flightSegment.count({
            where: { tripId }
        });
        return existingFlights < 1; // Free users limited to 1 flight per trip
    }
    catch (error) {
        console.error('Error checking flight resolve limit:', error);
        return false;
    }
}
/**
 * Middleware to check current month usage against limits
 */
export async function checkMonthlyUsageLimit(req, usageType) {
    const subjectId = getSubjectId(req);
    const plan = await getPlan(req);
    // Get current month usage
    const monthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usage = await prisma.usageMeter.findUnique({
        where: {
            subjectId_monthKey: { subjectId, monthKey }
        }
    });
    const current = (usage === null || usage === void 0 ? void 0 : usage[usageType]) || 0;
    // Determine limit based on plan
    let limit;
    switch (usageType) {
        case 'aiGenerations':
            limit = LIMIT_RULES.aiGenerationsPerMonth(plan);
            break;
        case 'flightResolves':
            limit = plan === 'free' ? 5 : Infinity; // Free: 5 per month, others unlimited
            break;
        case 'airportQueries':
            limit = plan === 'free' ? 20 : Infinity; // Free: 20 per month, others unlimited
            break;
        default:
            limit = Infinity;
    }
    return {
        allowed: current < limit,
        current,
        limit
    };
}
//# sourceMappingURL=entitlement.js.map