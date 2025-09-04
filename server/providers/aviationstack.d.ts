/**
 * Search for flights using AviationStack API
 * Note: AviationStack has very strict limits (20 calls/month), so this should only be used as a fallback
 */
export declare function searchFlightsAviationStack(origin: string, destination: string, date?: Date, options?: {
    limit?: number;
    flight_status?: string;
}): Promise<any[]>;
/**
 * Get AviationStack cache statistics
 */
export declare function getAviationStackCacheStats(): {
    size: number;
    entries: string[];
    nextExpiry?: Date;
};
/**
 * Clear AviationStack cache (use sparingly due to API limits)
 */
export declare function clearAviationStackCache(): void;
/**
 * Check if AviationStack API is configured and available
 */
export declare function isAviationStackAvailable(): boolean;
//# sourceMappingURL=aviationstack.d.ts.map