/**
 * Destination manager to handle setting current destinations with facts
 */

import { useHolidayStore } from '../state/holidayStore';
import { convertToDestinationWithFacts } from './destinationConverter';

/**
 * Set the current destination in the holiday store with AI-generated facts
 */
export async function setCurrentDestinationWithFacts(destinationName: string): Promise<void> {
  try {
    console.log('Setting current destination with facts for:', destinationName);

    const destination = await convertToDestinationWithFacts(destinationName);

    const holidayStore = useHolidayStore.getState();
    holidayStore.setDestination(destination);

    console.log('Current destination set successfully with facts:', destination.facts?.length || 0);

  } catch (error) {
    console.error('Error setting current destination:', error);
  }
}

/**
 * Hook to get current destination facts
 */
export function useCurrentDestinationFacts() {
  const { currentDestination, getTodaysFact } = useHolidayStore();

  const todaysFact = getTodaysFact();
  const allFacts = currentDestination?.facts || [];

  return {
    currentDestination,
    todaysFact,
    allFacts,
    hasFacts: allFacts.length > 0
  };
}

/**
 * Initialize destination facts when a timer is selected
 */
export async function initializeDestinationFactsForTimer(destinationName: string): Promise<void> {
  const { currentDestination } = useHolidayStore.getState();

  // Only set if we don't have a current destination or if it's different
  if (!currentDestination || currentDestination.name !== destinationName) {
    await setCurrentDestinationWithFacts(destinationName);
  }
}
