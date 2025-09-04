import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Extract subject ID from request headers or generate a fallback hash
 */
export function getSubjectId(req: Request): string {
  // Try to get from header first
  const headerSubjectId = req.headers['x-subject-id'] as string;
  if (headerSubjectId) {
    return headerSubjectId;
  }

  // Fallback: generate hash from IP + User-Agent for anonymous users
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  const fallbackId = crypto.createHash('md5').update(`${ip}-${userAgent}`).digest('hex');
  
  return `anon_${fallbackId}`;
}

/**
 * Check if user has paid entitlements
 * For now, returns false in development (free tier)
 * TODO: Integrate with RevenueCat when available
 */
export function assertEntitlement(req: Request): boolean {
  // In development, treat all users as free tier
  if (process.env.NODE_ENV === 'development') {
    return false;
  }

  // TODO: Implement RevenueCat integration
  // const subjectId = getSubjectId(req);
  // return await checkRevenueCatEntitlement(subjectId);
  
  return false;
}

/**
 * Check if user can resolve flights (free users limited to one per trip)
 */
export async function canResolveFlight(req: Request, tripId?: string): Promise<boolean> {
  const isPaid = assertEntitlement(req);
  
  if (isPaid) {
    return true; // Paid users have unlimited access
  }

  // Free users are limited to one resolved flight per trip
  // This is a simple implementation - in production you'd want to check the database
  if (!tripId) {
    return false; // Free users must provide tripId for tracking
  }

  // TODO: Implement database check for existing resolved flights per trip
  // const existingFlights = await getFlightSegmentsByTripId(tripId);
  // return existingFlights.length === 0;
  
  // For now, allow one flight per trip for free users
  return true;
}

/**
 * Middleware to enforce entitlements
 */
export function entitlementsMiddleware(req: Request, res: Response, next: NextFunction) {
  const subjectId = getSubjectId(req);
  const isPaid = assertEntitlement(req);
  
  // Add entitlements info to request for downstream use
  (req as any).entitlements = {
    subjectId,
    isPaid,
    canResolveFlight: isPaid, // Paid users can always resolve flights
  };
  
  next();
}

/**
 * Middleware to enforce flight resolution limits for free users
 */
export function flightResolutionLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const { tripId } = req.body;
  const entitlements = (req as any).entitlements;
  
  if (!entitlements) {
    return res.status(500).json({ error: 'Entitlements not initialized' });
  }
  
  if (entitlements.isPaid) {
    return next(); // Paid users have unlimited access
  }
  
  // Free users must provide tripId
  if (!tripId) {
    return res.status(400).json({ 
      error: 'Trip ID required for free users',
      message: 'Free users must provide tripId to track flight resolution limits'
    });
  }
  
  // TODO: Check database for existing resolved flights
  // For now, allow one flight per trip
  next();
}
