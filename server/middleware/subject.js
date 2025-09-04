import crypto from 'crypto';
/**
 * Get subject ID from request
 * Reads x-subject-id header, or derives stable hash from IP and user agent if missing
 */
export function getSubjectId(req) {
    // First, try to get from x-subject-id header
    const headerSubjectId = req.headers['x-subject-id'];
    if (headerSubjectId && headerSubjectId.trim()) {
        return headerSubjectId.trim();
    }
    // If no header, derive stable hash from IP and user agent
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    // Create a stable hash
    const hash = crypto
        .createHash('sha256')
        .update(`${ip}:${userAgent}`)
        .digest('hex')
        .substring(0, 16); // Use first 16 characters for shorter IDs
    return `anon_${hash}`;
}
/**
 * Middleware to attach subjectId to request
 */
export function attachSubjectId(req, res, next) {
    req.subjectId = getSubjectId(req);
    next();
}
//# sourceMappingURL=subject.js.map