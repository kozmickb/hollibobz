import { Trip, ChecklistDoc } from "../entities/trip";

/**
 * Generate a unique trip ID using crypto.randomUUID or fallback
 */
export function generateTripId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older environments
  return 'trip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Create a new trip from checklist data
 */
export function createTripFromChecklist(doc: ChecklistDoc, existingTripId?: string): Trip {
  const tripId = existingTripId || generateTripId();
  
  return {
    id: tripId,
    title: doc.tripTitle || 'My Trip',
    createdAt: new Date().toISOString(),
    checklist: doc,
  };
}

/**
 * Extract a meaningful title from a prompt or use default
 */
export function extractTripTitleFromPrompt(prompt: string): string {
  // Look for destination names, trip types, etc.
  const lowerPrompt = prompt.toLowerCase();
  
  // Try to extract destination
  const destinationMatch = prompt.match(/(?:trip to|visit|travel to|going to|plan.*for)\s+([A-Z][a-zA-Z\s,]+?)(?:\s|$|[.!?])/i);
  if (destinationMatch) {
    const destination = destinationMatch[1].trim();
    return `Trip to ${destination}`;
  }
  
  // Try to extract trip type
  if (lowerPrompt.includes('honeymoon')) return 'Honeymoon Trip';
  if (lowerPrompt.includes('business')) return 'Business Trip';
  if (lowerPrompt.includes('family')) return 'Family Trip';
  if (lowerPrompt.includes('solo')) return 'Solo Trip';
  if (lowerPrompt.includes('weekend')) return 'Weekend Getaway';
  
  return 'My Trip';
}
