import { prisma } from './index';
/**
 * Get or create usage meter for current month
 * Returns the UsageMeter row for the current UTC YYYY-MM monthKey
 */
export async function upsertMonthlyUsage(subjectId) {
    const monthKey = getCurrentMonthKey();
    return await prisma.usageMeter.upsert({
        where: {
            subjectId_monthKey: {
                subjectId,
                monthKey,
            },
        },
        update: {
            updatedAt: new Date(),
        },
        create: {
            subjectId,
            monthKey,
            aiGenerations: 0,
            flightResolves: 0,
            airportQueries: 0,
        },
    });
}
/**
 * Increment usage counters for a subject
 * Updates the current month's usage meter with the provided increments
 */
export async function incrUsage(subjectId, patch) {
    const monthKey = getCurrentMonthKey();
    return await prisma.usageMeter.upsert({
        where: {
            subjectId_monthKey: {
                subjectId,
                monthKey,
            },
        },
        update: {
            aiGenerations: patch.aiGenerations ? { increment: patch.aiGenerations } : undefined,
            flightResolves: patch.flightResolves ? { increment: patch.flightResolves } : undefined,
            airportQueries: patch.airportQueries ? { increment: patch.airportQueries } : undefined,
            updatedAt: new Date(),
        },
        create: {
            subjectId,
            monthKey,
            aiGenerations: patch.aiGenerations || 0,
            flightResolves: patch.flightResolves || 0,
            airportQueries: patch.airportQueries || 0,
        },
    });
}
/**
 * Record provider usage for billing/tracking
 * Creates a new ProviderUsage record
 */
export async function recordProviderUsage(data) {
    return await prisma.providerUsage.create({
        data: {
            provider: data.provider,
            endpoint: data.endpoint,
            units: data.units,
            costCents: data.costCents,
            subjectId: data.subjectId,
        },
    });
}
/**
 * Get current month key in YYYY-MM format (UTC)
 */
function getCurrentMonthKey() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}
//# sourceMappingURL=usage.js.map