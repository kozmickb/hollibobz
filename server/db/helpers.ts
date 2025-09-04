import { prisma } from './index';

/**
 * Helper function to upsert UsageMeter by subjectId and monthKey
 * Creates a new record if it doesn't exist, updates if it does
 */
export async function upsertUsageMeter(
  subjectId: string,
  monthKey: string,
  updates: {
    aiGenerations?: number;
    flightResolves?: number;
    airportQueries?: number;
  }
) {
  try {
    const result = await prisma.usageMeter.upsert({
      where: {
        subjectId_monthKey: {
          subjectId,
          monthKey,
        },
      },
      update: {
        aiGenerations: {
          increment: updates.aiGenerations || 0,
        },
        flightResolves: {
          increment: updates.flightResolves || 0,
        },
        airportQueries: {
          increment: updates.airportQueries || 0,
        },
        updatedAt: new Date(),
      },
      create: {
        subjectId,
        monthKey,
        aiGenerations: updates.aiGenerations || 0,
        flightResolves: updates.flightResolves || 0,
        airportQueries: updates.airportQueries || 0,
      },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error upserting UsageMeter:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Helper function to insert ProviderUsage rows
 */
export async function insertProviderUsage(
  data: {
    provider: string;
    endpoint: string;
    units: number;
    costCents: number;
    subjectId?: string;
  }
) {
  try {
    const result = await prisma.providerUsage.create({
      data: {
        provider: data.provider,
        endpoint: data.endpoint,
        units: data.units,
        costCents: data.costCents,
        subjectId: data.subjectId,
      },
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error inserting ProviderUsage:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Helper function to get current month key in YYYY-MM format
 */
export function getCurrentMonthKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Helper function to get month key for a specific date
 */
export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Helper function to check if a trial is active
 */
export async function isTrialActive(subjectId: string): Promise<boolean> {
  try {
    const trial = await prisma.trial.findUnique({
      where: { subjectId },
    });

    if (!trial) {
      return false;
    }

    const now = new Date();
    return trial.startedAt <= now && trial.endsAt > now;
  } catch (error) {
    console.error('Error checking trial status:', error);
    return false;
  }
}

/**
 * Helper function to get usage summary for a subject in a month
 */
export async function getUsageSummary(subjectId: string, monthKey: string) {
  try {
    const usage = await prisma.usageMeter.findUnique({
      where: {
        subjectId_monthKey: {
          subjectId,
          monthKey,
        },
      },
    });

    return {
      success: true,
      data: usage || {
        subjectId,
        monthKey,
        aiGenerations: 0,
        flightResolves: 0,
        airportQueries: 0,
      },
    };
  } catch (error) {
    console.error('Error getting usage summary:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
