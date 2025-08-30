/**
 * Utility for fetching destination background images for timer cards
 * Provides beautiful background images while maintaining text readability
 */

// Destination image mapping for common destinations
const destinationImageMap: Record<string, string> = {
  // European Cities
  'paris': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800&h=400&fit=crop&q=80', // Eiffel Tower
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=400&fit=crop&q=80', // Big Ben & Thames
  'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&h=400&fit=crop&q=80', // Colosseum
  'barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=400&fit=crop&q=80', // Sagrada Familia
  'amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=400&fit=crop&q=80', // Canals
  'berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800&h=400&fit=crop&q=80', // Brandenburg Gate
  'prague': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=400&fit=crop&q=80', // Prague Castle
  'vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800&h=400&fit=crop&q=80', // St. Stephen's Cathedral
  'budapest': 'https://images.unsplash.com/photo-1549877452-9c387954fbc2?w=800&h=400&fit=crop&q=80', // Parliament Building
  'bucharest': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop&q=80', // Palace of the Parliament
  'zurich': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&h=400&fit=crop&q=80', // Lake Zurich
  'geneva': 'https://images.unsplash.com/photo-1551009175-8a68da93d5f9?w=800&h=400&fit=crop&q=80', // Lake Geneva

  // Asian Cities
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=400&fit=crop&q=80', // Tokyo skyline
  'singapore': 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=400&fit=crop&q=80', // Marina Bay Sands
  'bangkok': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80', // Bangkok temples

  // North American Cities
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=400&fit=crop&q=80', // Manhattan skyline
  'toronto': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=400&fit=crop&q=80', // Toronto skyline
  'vancouver': 'https://images.unsplash.com/photo-1559511260-66a654ae982a?w=800&h=400&fit=crop&q=80', // Stanley Park
  'mexico city': 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=800&h=400&fit=crop&q=80', // Mexico City cathedral

  // South American Cities
  'rio de janeiro': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop&q=80', // Christ the Redeemer
  'buenos aires': 'https://images.unsplash.com/photo-1573802844175-0ec2b7a6b2b0?w=800&h=400&fit=crop&q=80', // Buenos Aires architecture

  // Middle Eastern Cities
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop&q=80', // Burj Khalifa
  'abu dhabi': 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&h=400&fit=crop&q=80', // Abu Dhabi skyline

  // Oceania Cities
  'sydney': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80', // Sydney Opera House
  'melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566218148?w=800&h=400&fit=crop&q=80', // Melbourne skyline

  // Countries (general)
  'switzerland': 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&h=400&fit=crop&q=80', // Swiss Alps

  // Additional popular destinations
  'copenhagen': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&h=400&fit=crop&q=80', // Copenhagen harbor
  'stockholm': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=800&h=400&fit=crop&q=80', // Stockholm skyline
  'oslo': 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=400&fit=crop&q=80', // Oslo fjord
  'milan': 'https://images.unsplash.com/photo-1458906931852-47d88574a008?w=800&h=400&fit=crop&q=80', // Milan cathedral
  'florence': 'https://images.unsplash.com/photo-1543428459-84d2459afc60?w=800&h=400&fit=crop&q=80', // Florence architecture
  'venice': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&h=400&fit=crop&q=80', // Venice canals
  'munich': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=400&fit=crop&q=80', // Munich skyline
  'hamburg': 'https://images.unsplash.com/photo-1551798507-50d1e3e4db7f?w=800&h=400&fit=crop&q=80', // Hamburg harbor
  'warsaw': 'https://images.unsplash.com/photo-1561649664-0b9c7a6e8b9b?w=800&h=400&fit=crop&q=80', // Warsaw old town
  'kiev': 'https://images.unsplash.com/photo-1564473456986-49a7b7f84b8?w=800&h=400&fit=crop&q=80', // Kiev architecture

  // Common abbreviations and variations
  'ny': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=400&fit=crop&q=80',
  'nyc': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=400&fit=crop&q=80',
  'la': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5d0e1?w=800&h=400&fit=crop&q=80',
  'los angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5d0e1?w=800&h=400&fit=crop&q=80',
  'sf': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=400&fit=crop&q=80',
  'san francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=400&fit=crop&q=80',
  'miami': 'https://images.unsplash.com/photo-1535498730771-e735b998cd64?w=800&h=400&fit=crop&q=80',
  'chicago': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=400&fit=crop&q=80',
  'boston': 'https://images.unsplash.com/photo-1509228627152-72ae3ae6848d?w=800&h=400&fit=crop&q=80',
  'seattle': 'https://images.unsplash.com/photo-1502175353174-a7a70e0bbd5f?w=800&h=400&fit=crop&q=80',
  'montreal': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=400&fit=crop&q=80',
  'calgary': 'https://images.unsplash.com/photo-1551798507-50d1e3e4db7f?w=800&h=400&fit=crop&q=80',
  'edmonton': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80',
  'ottawa': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=800&h=400&fit=crop&q=80',
  'quebec': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=400&fit=crop&q=80',
};

// Fallback images for destinations not in the map - diverse travel scenery
const fallbackImages = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop&q=80', // Mountain landscape
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80', // Ocean sunset
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=400&fit=crop&q=80', // Forest path
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop&q=80', // Desert landscape
  'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&h=400&fit=crop&q=80', // City lights
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80', // Beach
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop&q=80', // Mountains
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80', // Coastal
];

/**
 * Get a destination background image URL for a given destination name
 * @param destinationName - The destination name (case-insensitive)
 * @returns string - Image URL for the destination background
 */
export function getDestinationImage(destinationName: string): string {
  if (!destinationName) {
    return fallbackImages[0];
  }

  const normalizedName = destinationName.toLowerCase().trim();

  // Check for exact matches first
  if (destinationImageMap[normalizedName]) {
    return destinationImageMap[normalizedName];
  }

  // Check for partial matches
  for (const [key, imageUrl] of Object.entries(destinationImageMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return imageUrl;
    }
  }

  // If no match found, use a fallback based on destination name hash
  const hash = normalizedName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbackImages[hash % fallbackImages.length];
}

/**
 * Get a destination background image with blur effect for better text readability
 * @param destinationName - The destination name
 * @param blurAmount - Blur amount (0-10, default 2)
 * @returns string - Image URL with blur parameter
 */
export function getDestinationImageWithBlur(destinationName: string, blurAmount: number = 2): string {
  const baseUrl = getDestinationImage(destinationName);
  return `${baseUrl}&blur=${blurAmount}`;
}

/**
 * Format destination name for display (proper title case)
 * @param destinationName - The destination name to format
 * @returns string - Properly formatted destination name
 */
export function formatDestinationName(destinationName: string): string {
  if (!destinationName) return '';

  return destinationName
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .split(',')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(',');
}

/**
 * Hook to preload destination images for better performance
 * @param destinations - Array of destination names
 */
export function preloadDestinationImages(destinations: string[]): void {
  destinations.forEach(destination => {
    const img = new Image();
    img.src = getDestinationImage(destination);
  });
}

/**
 * Generate a gradient overlay color based on destination for better text contrast
 * @param destinationName - The destination name
 * @returns string - CSS gradient string for overlay
 */
export function getDestinationGradientOverlay(destinationName: string): string {
  const hash = destinationName.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
    'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(6,182,212,0.1) 100%)',
    'linear-gradient(135deg, rgba(244,114,182,0.2) 0%, rgba(219,39,119,0.1) 100%)',
    'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.1) 100%)',
    'linear-gradient(135deg, rgba(34,197,169,0.2) 0%, rgba(20,184,166,0.1) 100%)',
  ];

  return colors[hash % colors.length];
}
