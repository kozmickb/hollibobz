import { Request, Response, NextFunction } from 'express';
export type PlanType = 'free' | 'trial' | 'pro';
/**
 * Get user plan based on RevenueCat and Trial status
 */
export declare function getPlan(req: Request): Promise<PlanType>;
/**
 * Enforce limits based on plan type
 */
export declare function enforceLimit(kind: string, computeAllowed: (plan: PlanType) => number | boolean): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Specific limit rules
 */
export declare const LIMIT_RULES: {
    flightResolvePerTrip: (plan: PlanType) => number;
    airportWindow: (plan: PlanType) => 720 | 240;
    aiGenerationsPerMonth: (plan: PlanType) => number;
    fileSizeLimit: (plan: PlanType) => number;
};
/**
 * Middleware to check if user can resolve more flights for a trip
 */
export declare function checkFlightResolveLimit(req: Request, tripId: string): Promise<boolean>;
/**
 * Middleware to check current month usage against limits
 */
export declare function checkMonthlyUsageLimit(req: Request, usageType: 'aiGenerations' | 'flightResolves' | 'airportQueries'): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
}>;
//# sourceMappingURL=entitlement.d.ts.map