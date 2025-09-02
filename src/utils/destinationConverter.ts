/**
 * Utility to convert between different destination formats and ensure facts are populated
 */

import { Destination } from '../state/holidayStore';
import { DestinationInfo } from '../api/destination-data';
import { getDestinationInfo as getAIDestinationInfo } from '../utils/destinationService';

/**
 * Convert DestinationInfo to Destination with AI-generated facts
 */
export async function convertToDestinationWithFacts(
  destinationName: string,
  destinationInfo?: DestinationInfo
): Promise<Destination> {
  try {
    // Try to get AI-generated destination with facts first
    const aiDestination = await getAIDestinationInfo(destinationName);

    if (aiDestination && aiDestination.facts && aiDestination.facts.length > 0) {
      console.log('Using AI-generated destination with facts for:', destinationName);
      return aiDestination;
    }

    // Fallback: Create destination from static data with default facts
    console.log('Using fallback destination creation for:', destinationName);

    const fallbackFacts = getFallbackFacts(destinationName);

    return {
      name: destinationName,
      country: destinationInfo?.capital || 'Unknown',
      images: [
        `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop&q=80`
      ],
      facts: fallbackFacts,
      thingsToDo: getFallbackThingsToDo(destinationName)
    };

  } catch (error) {
    console.error('Error converting destination:', error);

    // Ultimate fallback
    return {
      name: destinationName,
      country: 'Unknown',
      images: [
        `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop&q=80`
      ],
      facts: [
        `Welcome to ${destinationName}!`,
        `Explore the local culture and cuisine.`,
        `Check the weather before your trip.`,
        `Learn basic local phrases for better experiences.`
      ],
      thingsToDo: [
        'Visit local attractions',
        'Try local cuisine',
        'Explore neighborhoods',
        'Take photos of landmarks'
      ]
    };
  }
}

/**
 * Get fallback facts for destinations without AI-generated content
 */
function getFallbackFacts(destinationName: string): string[] {
  const baseFacts = [
    `Welcome to ${destinationName}!`,
    `Explore the local culture and cuisine.`,
    `Check the weather before your trip.`,
    `Learn basic local phrases for better experiences.`
  ];

  // Add destination-specific facts where possible
  const dest = destinationName.toLowerCase();

  if (dest.includes('paris')) {
    return [
      'Paris is known as the City of Light with over 2,000 years of history.',
      'The Eiffel Tower was originally intended to be temporary.',
      'Paris has over 130 museums, including the world-famous Louvre.',
      'French cuisine originated in Paris and includes classics like escargot and crème brûlée.'
    ];
  }

  if (dest.includes('london')) {
    return [
      'London has been a major settlement for over 2,000 years.',
      'The city has 32 boroughs plus the City of London.',
      'London\'s Underground is the oldest metro system in the world.',
      'The city hosted the modern Olympic Games three times.'
    ];
  }

  if (dest.includes('bucharest')) {
    return [
      'Bucharest is the capital and largest city of Romania.',
      'The city is known as "Little Paris" due to its elegant architecture.',
      'Bucharest has the second-largest administrative building in the world.',
      'The city has over 100 parks and gardens covering 8,000 hectares.'
    ];
  }

  if (dest.includes('abu dhabi')) {
    return [
      'Abu Dhabi is the capital of the United Arab Emirates.',
      'The Grand Mosque is one of the largest mosques in the world.',
      'Abu Dhabi has over 200 islands in its territorial waters.',
      'The city is home to the world\'s largest single collection of Ferrari cars.'
    ];
  }

  if (dest.includes('tokyo')) {
    return [
      'Tokyo is the most populous metropolitan area in the world.',
      'The city has over 160,000 restaurants serving every type of cuisine.',
      'Tokyo hosted the Summer Olympics in 1964 and 2020.',
      'The city has the world\'s busiest pedestrian crossing at Shibuya.'
    ];
  }

  return baseFacts;
}

/**
 * Get fallback things to do for destinations
 */
function getFallbackThingsToDo(destinationName: string): string[] {
  const baseActivities = [
    'Visit local attractions',
    'Try local cuisine',
    'Explore neighborhoods',
    'Take photos of landmarks'
  ];

  const dest = destinationName.toLowerCase();

  if (dest.includes('paris')) {
    return [
      'Visit the Eiffel Tower and take photos from different angles',
      'Explore the Louvre Museum and see the Mona Lisa',
      'Walk along the Seine River and visit Notre-Dame Cathedral',
      'Stroll through Montmartre and visit Sacré-Cœur Basilica'
    ];
  }

  if (dest.includes('bucharest')) {
    return [
      'Explore Old Town (Lipscani district) and its historic architecture',
      'Visit the Old Town (Lipscani district) for dining and nightlife',
      'See the Palace of the Parliament, the second-largest administrative building',
      'Walk through Cişmigiu Gardens, one of the oldest parks in the city'
    ];
  }

  if (dest.includes('abu dhabi')) {
    return [
      'Visit the Grand Mosque (free entry, modest dress required)',
      'Explore Yas Island and Ferrari World Abu Dhabi',
      'Take a traditional dhow cruise in the Arabian Gulf',
      'Visit the Abu Dhabi Louvre Museum'
    ];
  }

  return baseActivities;
}
