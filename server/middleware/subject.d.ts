import { Request } from 'express';
declare global {
    namespace Express {
        interface Request {
            subjectId?: string;
        }
    }
}
/**
 * Get subject ID from request
 * Reads x-subject-id header, or derives stable hash from IP and user agent if missing
 */
export declare function getSubjectId(req: Request): string;
/**
 * Middleware to attach subjectId to request
 */
export declare function attachSubjectId(req: Request, res: any, next: any): void;
//# sourceMappingURL=subject.d.ts.map