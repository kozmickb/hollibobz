import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

declare global {
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  // Use existing x-request-id header if provided, otherwise generate a new UUID
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  
  // Attach to request object for use in other middleware/routes
  req.requestId = requestId;
  
  // Set response header
  res.setHeader('x-request-id', requestId);
  
  next();
}
