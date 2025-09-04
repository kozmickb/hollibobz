/**
 * Helper function to upsert UsageMeter by subjectId and monthKey
 * Creates a new record if it doesn't exist, updates if it does
 */
export declare function upsertUsageMeter(subjectId: string, monthKey: string, updates: {
    aiGenerations?: number;
    flightResolves?: number;
    airportQueries?: number;
}): Promise<{
    success: boolean;
    data: {
        id: string;
        subjectId: string;
        monthKey: string;
        aiGenerations: number;
        flightResolves: number;
        airportQueries: number;
        createdAt: Date;
        updatedAt: Date;
    };
    error?: undefined;
} | {
    success: boolean;
    error: string;
    data?: undefined;
}>;
/**
 * Helper function to insert ProviderUsage rows
 */
export declare function insertProviderUsage(data: {
    provider: string;
    endpoint: string;
    units: number;
    costCents: number;
    subjectId?: string;
}): Promise<{
    success: boolean;
    data: {
        id: string;
        provider: string;
        subjectId: string | null;
        createdAt: Date;
        endpoint: string;
        units: number;
        costCents: number;
    };
    error?: undefined;
} | {
    success: boolean;
    error: string;
    data?: undefined;
}>;
/**
 * Helper function to get current month key in YYYY-MM format
 */
export declare function getCurrentMonthKey(): string;
/**
 * Helper function to get month key for a specific date
 */
export declare function getMonthKey(date: Date): string;
/**
 * Helper function to check if a trial is active
 */
export declare function isTrialActive(subjectId: string): Promise<boolean>;
/**
 * Helper function to get usage summary for a subject in a month
 */
export declare function getUsageSummary(subjectId: string, monthKey: string): Promise<{
    success: boolean;
    data: {
        id: string;
        subjectId: string;
        monthKey: string;
        aiGenerations: number;
        flightResolves: number;
        airportQueries: number;
        createdAt: Date;
        updatedAt: Date;
    } | {
        subjectId: string;
        monthKey: string;
        aiGenerations: number;
        flightResolves: number;
        airportQueries: number;
    };
    error?: undefined;
} | {
    success: boolean;
    error: string;
    data?: undefined;
}>;
//# sourceMappingURL=helpers.d.ts.map