/**
 * Get or create usage meter for current month
 * Returns the UsageMeter row for the current UTC YYYY-MM monthKey
 */
export declare function upsertMonthlyUsage(subjectId: string): Promise<{
    id: string;
    subjectId: string;
    monthKey: string;
    aiGenerations: number;
    flightResolves: number;
    airportQueries: number;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Increment usage counters for a subject
 * Updates the current month's usage meter with the provided increments
 */
export declare function incrUsage(subjectId: string, patch: Partial<{
    aiGenerations: number;
    flightResolves: number;
    airportQueries: number;
}>): Promise<{
    id: string;
    subjectId: string;
    monthKey: string;
    aiGenerations: number;
    flightResolves: number;
    airportQueries: number;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * Record provider usage for billing/tracking
 * Creates a new ProviderUsage record
 */
export declare function recordProviderUsage(data: {
    provider: string;
    endpoint: string;
    units: number;
    costCents: number;
    subjectId?: string;
}): Promise<{
    id: string;
    provider: string;
    subjectId: string | null;
    createdAt: Date;
    endpoint: string;
    units: number;
    costCents: number;
}>;
//# sourceMappingURL=usage.d.ts.map