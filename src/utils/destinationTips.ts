/**
 * Destination-specific travel tips and advice
 * Provides contextual, location-aware travel guidance
 */

export interface DestinationTip {
  tip: string;
  category: 'practical' | 'cultural' | 'safety' | 'experience';
  priority: 'essential' | 'recommended' | 'optional';
}

const destinationTips: Record<string, DestinationTip[]> = {
  // UAE Destinations
  'abu dhabi': [
    {
      tip: 'Visit the Grand Mosque - women must wear modest clothing and bring a scarf. Entry is free!',
      category: 'cultural',
      priority: 'essential'
    },
    {
      tip: 'Try traditional Emirati dishes like machboos (spiced rice with meat) at local restaurants',
      category: 'experience',
      priority: 'recommended'
    },
    {
      tip: 'Download the RTA app for easy taxi booking and bus schedules',
      category: 'practical',
      priority: 'essential'
    },
    {
      tip: 'During Ramadan, restaurants are closed during daylight - plan meals accordingly',
      category: 'cultural',
      priority: 'essential'
    },
    {
      tip: 'Stay hydrated and avoid outdoor activities during peak summer heat (May-September)',
      category: 'safety',
      priority: 'essential'
    }
  ],
  'dubai': [
    {
      tip: 'Visit Burj Khalifa at sunset for spectacular views - book tickets online to skip lines',
      category: 'experience',
      priority: 'recommended'
    },
    {
      tip: 'Use the Dubai Metro for affordable city transport - get a Nol card at any station',
      category: 'practical',
      priority: 'essential'
    },
    {
      tip: 'Try traditional Arabic coffee and dates at local cafes',
      category: 'cultural',
      priority: 'recommended'
    },
    {
      tip: 'Respect local customs - avoid public displays of affection and dress modestly',
      category: 'cultural',
      priority: 'essential'
    },
    {
      tip: 'Download the Dubai Police app for emergency services and safety information',
      category: 'safety',
      priority: 'recommended'
    }
  ],

  // European Cities
  'bucharest': [
    {
      tip: 'Visit Old Town (Lipscani district) for the best traditional Romanian architecture and dining',
      category: 'experience',
      priority: 'essential'
    },
    {
      tip: 'Try sarmale (cabbage rolls) and mici (grilled sausages) at local restaurants',
      category: 'experience',
      priority: 'recommended'
    },
    {
      tip: 'Use Uber or local taxi apps - avoid unofficial taxis for safety',
      category: 'practical',
      priority: 'essential'
    },
    {
      tip: 'Visit during summer for outdoor festivals and pleasant weather',
      category: 'experience',
      priority: 'recommended'
    },
    {
      tip: 'Learn basic Romanian phrases - locals appreciate the effort',
      category: 'cultural',
      priority: 'recommended'
    }
  ],
  'paris': [
    {
      tip: 'Get a Paris Museum Pass for skip-the-line access to major attractions',
      category: 'practical',
      priority: 'recommended'
    },
    {
      tip: 'Visit the Louvre early morning or late evening to avoid crowds',
      category: 'experience',
      priority: 'recommended'
    },
    {
      tip: 'Use the Paris Metro - get a Navigo pass for unlimited rides',
      category: 'practical',
      priority: 'essential'
    },
    {
      tip: 'Try croissants from local boulangeries, not tourist cafes',
      category: 'experience',
      priority: 'recommended'
    },
    {
      tip: 'Respect quiet hours after 10 PM in residential areas',
      category: 'cultural',
      priority: 'essential'
    }
  ],
  'london': [
    {
      tip: 'Get an Oyster card for unlimited Tube rides - saves money and time',
      category: 'practical',
      priority: 'essential'
    },
    {
      tip: 'Visit markets like Borough Market for authentic British food experiences',
      category: 'experience',
      priority: 'recommended'
    },
    {
      tip: 'Download the Citymapper app for the best public transport routes',
      category: 'practical',
      priority: 'recommended'
    },
    {
      tip: 'Try afternoon tea at a traditional hotel like The Ritz',
      category: 'experience',
      priority: 'recommended'
    },
    {
      tip: 'Carry an umbrella - London weather changes quickly',
      category: 'practical',
      priority: 'essential'
    }
  ],

  // Asian Cities
  'tokyo': [
    {
      tip: 'Download Hyperdia app for train schedules and route planning',
      category: 'practical',
      priority: 'essential'
    },
    {
      tip: 'Visit Tsukiji Outer Market for fresh sushi and street food',
      category: 'experience',
      priority: 'recommended'
    },
    {
      tip: 'Get a Japan Rail Pass for extensive train travel between cities',
      category: 'practical',
      priority: 'recommended'
    },
    {
      tip: 'Try convenience store meals - they\'re surprisingly good quality',
      category: 'experience',
      priority: 'recommended'
    },
    {
      tip: 'Bow when greeting people and saying thank you',
      category: 'cultural',
      priority: 'essential'
    }
  ],

  // Default tips for any destination
  'default': [
    {
      tip: 'Download offline maps and learn basic local phrases before your trip',
      category: 'practical',
      priority: 'essential'
    },
    {
      tip: 'Try local street food for authentic culinary experiences',
      category: 'experience',
      priority: 'recommended'
    },
    {
      tip: 'Use ride-sharing apps or official taxis for safe transportation',
      category: 'safety',
      priority: 'essential'
    },
    {
      tip: 'Respect local customs and dress codes at religious sites',
      category: 'cultural',
      priority: 'essential'
    },
    {
      tip: 'Stay hydrated and protect yourself from the sun',
      category: 'safety',
      priority: 'recommended'
    }
  ]
};

/**
 * Get destination-specific tips for a given location
 */
export function getDestinationTips(destination: string, maxTips: number = 3): DestinationTip[] {
  if (!destination) return destinationTips['default'].slice(0, maxTips);

  const normalizedDest = destination.toLowerCase().trim();

  // Try exact match first
  if (destinationTips[normalizedDest]) {
    return destinationTips[normalizedDest].slice(0, maxTips);
  }

  // Try partial matches
  const keys = Object.keys(destinationTips);
  for (const key of keys) {
    if (key !== 'default' && (normalizedDest.includes(key) || key.includes(normalizedDest))) {
      return destinationTips[key].slice(0, maxTips);
    }
  }

  // Fallback to default tips
  return destinationTips['default'].slice(0, maxTips);
}

/**
 * Get a random tip from the available destination tips
 */
export function getRandomDestinationTip(destination: string): DestinationTip {
  const tips = getDestinationTips(destination, 10);
  if (tips.length === 0) {
    return destinationTips['default'][0];
  }

  const randomIndex = Math.floor(Math.random() * tips.length);
  return tips[randomIndex];
}

/**
 * Get tips by category for a destination
 */
export function getDestinationTipsByCategory(
  destination: string,
  category: DestinationTip['category']
): DestinationTip[] {
  return getDestinationTips(destination, 10).filter(tip => tip.category === category);
}

/**
 * Get essential tips that every traveler should know for a destination
 */
export function getEssentialDestinationTips(destination: string): DestinationTip[] {
  return getDestinationTips(destination, 10).filter(tip => tip.priority === 'essential');
}


