/**
 * Utility for fetching destination background images for timer cards
 * Provides beautiful background images while maintaining text readability
 *
 * IMPORTANT: When updating image URLs, ensure they:
 * 1. Are from Unsplash (or other reliable source)
 * 2. Have proper dimensions (800x400 recommended)
 * 3. Are actually representative of the destination
 * 4. Are high-quality and appropriate for the app
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
  'bucharest': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=400&fit=crop&q=80', // Palace of the Parliament - Bucharest landmark
  'zurich': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=800&h=400&fit=crop&q=80', // Lake Zurich
  'geneva': 'https://images.unsplash.com/photo-1551009175-8a68da93d5f9?w=800&h=400&fit=crop&q=80', // Lake Geneva

  // Asian Cities
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=400&fit=crop&q=80', // Tokyo skyline
  'singapore': 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&h=400&fit=crop&q=80', // Marina Bay Sands
  'bangkok': 'https://images.unsplash.com/photo-1563492065-c88d7d5eebdf?w=800&h=400&fit=crop&q=80', // Bangkok temples and city

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
  'abu dhabi': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop&q=80', // Abu Dhabi skyline - Emirates Palace

  // Oceania Cities
  'sydney': 'https://images.unsplash.com/photo-1506374322306-3fd1beb1fc15?w=800&h=400&fit=crop&q=80', // Sydney Opera House and Harbor Bridge
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
  'edmonton': 'https://images.unsplash.com/photo-1590767725853-e9f0bb8a18f5?w=800&h=400&fit=crop&q=80',
  'ottawa': 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?w=800&h=400&fit=crop&q=80',
  'quebec': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&h=400&fit=crop&q=80',
};

// Fallback images for destinations not in the map - diverse travel scenery
const fallbackImages = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop&q=80', // Mountain landscape
  'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=400&fit=crop&q=80', // Forest path
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=400&fit=crop&q=80', // Desert landscape
  'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&h=400&fit=crop&q=80', // City lights
  'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800&h=400&fit=crop&q=80', // Tropical beach
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&q=80', // Ocean sunset
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&q=80', // Historic architecture
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=400&fit=crop&q=80', // Scenic vista
];

/**
 * Validate that an image URL is properly formatted
 */
function validateImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' &&
           (urlObj.hostname.includes('unsplash.com') || urlObj.hostname.includes('pexels.com'));
  } catch {
    return false;
  }
}

/**
 * Log warning for invalid image URLs in development
 */
function logInvalidImageUrl(destination: string, url: string) {
  if (__DEV__) {
    console.warn(`[DestinationImages] Invalid image URL for "${destination}": ${url}`);
  }
}

/**
 * Get a destination background image URL for a given destination name
 * @param destinationName - The destination name (case-insensitive)
 * @returns string - Image URL for the destination background
 */
export function getDestinationImage(destinationName: string): string {
  if (!destinationName) {
    // console.log('[DestinationImages] Empty destination name provided');
    return fallbackImages[0];
  }

  const strip = (s: string) => s
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/['’`-]/g, '')
    .toLowerCase()
    .trim();

  const normalizedName = strip(destinationName).replace(/\s+/g, ' ');
  const keys = Object.keys(destinationImageMap);

  // First try exact case-insensitive match with original spacing
  const exactMatchKey = keys.find(key => 
    key.toLowerCase() === destinationName.toLowerCase()
  );
  
  if (exactMatchKey) {
    const url = destinationImageMap[exactMatchKey];
    if (!validateImageUrl(url)) {
      logInvalidImageUrl(destinationName, url);
      return fallbackImages[0];
    }
    return url;
  }

  // Temporarily disable debug logging to reduce console noise
  // console.log('[DestinationImages] 🔍 Processing destination:', {
  //   original: destinationName,
  //   normalized: normalizedName,
  //   hasExactMatch: !!destinationImageMap[normalizedName],
  //   totalKeys: keys.length
  // });

  // if (destinationImageMap[normalizedName]) {
  //   console.log('[DestinationImages] 🎯 Exact match found:', normalizedName, '->', destinationImageMap[normalizedName]);
  // } else {
  //   console.log('[DestinationImages] ❌ No exact match for:', normalizedName);
  //   console.log('[DestinationImages] 📋 Available keys starting with same letter:', keys.filter(k => k.startsWith(normalizedName[0])).slice(0, 10));
  // }

  // Alias map for common misspellings/variants
  const alias: Record<string, string> = {
    'abu dhabi': 'abu dhabi',
    'abudhabi': 'abu dhabi',
    'abu-dhabi': 'abu dhabi',
    'abu dabi': 'abu dhabi',
    'abu dabee': 'abu dhabi',
    'abhu dhabi': 'abu dhabi',
  };
  const aliased = alias[normalizedName];
  if (aliased && destinationImageMap[aliased]) {
    const url = destinationImageMap[aliased];
    // console.log('[DestinationImages] Found via alias mapping:', aliased, '->', url);
    if (!validateImageUrl(url)) {
      logInvalidImageUrl(destinationName, url);
      return fallbackImages[0];
    }
    return url;
  }

  // Exact match
  if (destinationImageMap[normalizedName]) {
    const url = destinationImageMap[normalizedName];
    // console.log('[DestinationImages] Found exact match:', normalizedName, '->', url);
    if (!validateImageUrl(url)) {
      logInvalidImageUrl(destinationName, url);
      return fallbackImages[0];
    }
    return url;
  }

  // console.log('[DestinationImages] No exact match, trying fuzzy match...');

  // Partial matching removed to avoid accidental mis-maps (e.g., very short inputs)

  // Fuzzy match (Levenshtein)
  const levenshtein = (a: string, b: string): number => {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return dp[m][n];
  };

  let bestKey = '';
  let best = Number.POSITIVE_INFINITY;
  for (const key of keys) {
    const score = levenshtein(normalizedName, strip(key));
    if (score < best) {
      best = score;
      bestKey = key;
    }
  }
  // Also compare names without spaces
  const nameNoSpace = normalizedName.replace(/\s+/g, '');
  for (const key of keys) {
    const score = levenshtein(nameNoSpace, strip(key).replace(/\s+/g, ''));
    if (score < best) {
      best = score;
      bestKey = key;
    }
  }
  const threshold = Math.max(3, Math.ceil(Math.max(1, normalizedName.length) * 0.4));
  if (bestKey && best <= threshold) {
    const url = destinationImageMap[bestKey];
    // console.log('[DestinationImages] 🔄 Found fuzzy match:', {
    //   original: destinationName,
    //   normalized: normalizedName,
    //   matched: bestKey,
    //   score: best,
    //   threshold: threshold,
    //   url: url.substring(0, 60) + '...'
    // });
    if (!validateImageUrl(url)) {
      logInvalidImageUrl(destinationName, url);
      return fallbackImages[0];
    }
    return url;
  } else if (bestKey) {
    // console.log('[DestinationImages] ❌ Fuzzy match failed - score too high:', {
    //   original: destinationName,
    //   normalized: normalizedName,
    //   bestMatch: bestKey,
    //   score: best,
    //   threshold: threshold
    // });
  }

  // Fallback: deterministic scenic image
  const hash = normalizedName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackUrl = fallbackImages[hash % fallbackImages.length];
  // console.log('[DestinationImages] 🖼️ Using fallback image for:', {
  //   original: destinationName,
  //   normalized: normalizedName,
  //   hash: hash,
  //   fallbackIndex: hash % fallbackImages.length,
  //   url: fallbackUrl.substring(0, 60) + '...'
  // });
  return fallbackUrl;
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
 * Test function to verify image mappings work correctly
 * Call this in development to ensure all destinations have valid images
 */
export function testImageMappings(): void {
  if (!__DEV__) return;

  // console.log('[DestinationImages] Testing image mappings...');

  const testDestinations = [
    'abu dhabi', 'Abu Dhabi', 'ABU DHABI',
    'paris', 'london', 'tokyo',
    'new york', 'los angeles', 'miami'
  ];

  testDestinations.forEach(destination => {
    const imageUrl = getDestinationImage(destination);
    // console.log(`✅ ${destination} → ${imageUrl}`);
  });

  // console.log('[DestinationImages] Test completed');
}

// Test Abu Dhabi specifically
export function testAbuDhabi(): void {
  // console.log('[DestinationImages] Testing Abu Dhabi specifically...');
  const result = getDestinationImage('Abu Dhabi');
  // console.log('Abu Dhabi result:', result);
}

// Comprehensive test function
export function testDestinationImages(): void {
  // console.log('[DestinationImages] Running comprehensive test...');

  const testCases = [
    'Abu Dhabi',
    'abu dhabi',
    'ABU DHABI',
    'Dubai',
    'London',
    'Paris',
    'New York',
    'Tokyo',
    'Sydney',
    'InvalidDestination123'
  ];

  testCases.forEach(destination => {
    // console.log(`\n[DestinationImages] Testing: "${destination}"`);
    const result = getDestinationImage(destination);
    // console.log(`[DestinationImages] Result: ${result}`);

    // Test if URL is accessible
    if (result && result !== fallbackImages[0]) {
      // checkImageAccessibility(result).then(isAccessible => {
      //   console.log(`[DestinationImages] URL accessible: ${isAccessible}`);
      // });
    }
  });

  // console.log('\n[DestinationImages] Comprehensive test completed');
}

// Simple synchronous test
export function quickTest(): string {
  // console.log('[DestinationImages] Quick test for Abu Dhabi...');
  const result = getDestinationImage('Abu Dhabi');
  // console.log('[DestinationImages] Quick test result:', result);
  return result;
}

/**
 * Hook to preload destination images for better performance
 * @param destinations - Array of destination names
 */
export function usePreloadDestinationImages(destinations: string[]): void {
  // This would be used in React components for preloading
  // For now, just export for future use
}

/**
 * Validate all destination images (for development)
 */
export function validateAllDestinationImages(): { valid: string[], invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  Object.entries(destinationImageMap).forEach(([destination, url]) => {
    if (validateImageUrl(url)) {
      valid.push(destination);
    } else {
      invalid.push(destination);
      logInvalidImageUrl(destination, url);
    }
  });

  // console.log(`[DestinationImages] Validation complete: ${valid.length} valid, ${invalid.length} invalid`);
  if (invalid.length > 0) {
    // console.log('[DestinationImages] Invalid destinations:', invalid);
  }

  return { valid, invalid };
}

/**
 * Check if an image URL is accessible (for debugging)
 */
export async function checkImageAccessibility(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    // console.log(`[DestinationImages] Error checking image: ${url}`, error);
    return false;
  }
}

/**
 * Validate and fix broken image URLs - DISABLED to prevent infinite loops
 */
export async function validateAndFixImages(): Promise<void> {
  // This function is disabled to prevent infinite loops in development
  // The HTTP requests were causing component re-renders
  console.log('[DestinationImages] Image validation disabled to prevent loops');
  return;
  
  // Original implementation commented out:
  // const brokenImages: string[] = [];
  // for (const [destination, url] of Object.entries(destinationImageMap)) {
  //   const isAccessible = await checkImageAccessibility(url);
  //   if (!isAccessible) {
  //     brokenImages.push(destination);
  //   }
  // }
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
