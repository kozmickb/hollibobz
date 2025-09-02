/*
IMPORTANT NOTICE: DO NOT REMOVE
This service provides destination-specific travel information including currency, languages, climate, transportation, and timezone data.
*/

export interface DestinationInfo {
  currency: string;
  languages: string[];
  bestMonths: string[];
  transportation: string[];
  temperature: string;
  timezone: string;
  population?: string;
  capital?: string;
  emergencyNumber?: string;
  // Optional metadata for matching/validation UX
  matchType?: 'exact' | 'partial' | 'fuzzy' | 'default';
  suggestedName?: string; // canonical destination used when not an exact match
}

// Destination data mapping
const destinationData: Record<string, DestinationInfo> = {
  'paris': {
    currency: 'Euro (EUR)',
    languages: ['French', 'English'],
    bestMonths: ['Apr', 'May', 'Jun', 'Sep', 'Oct'],
    transportation: ['Metro', 'Bus', 'Train', 'Taxi'],
    temperature: '8-25°C',
    timezone: 'CET (UTC+1)',
    population: '2.1M',
    capital: 'Paris',
    emergencyNumber: '112'
  },
  'london': {
    currency: 'British Pound (GBP)',
    languages: ['English'],
    bestMonths: ['Mar', 'Apr', 'May', 'Jun', 'Sep'],
    transportation: ['Underground', 'Bus', 'Train', 'Taxi'],
    temperature: '5-23°C',
    timezone: 'GMT/BST (UTC+0/+1)',
    population: '8.9M',
    capital: 'London',
    emergencyNumber: '999'
  },
  'new york': {
    currency: 'US Dollar (USD)',
    languages: ['English', 'Spanish'],
    bestMonths: ['Apr', 'May', 'Jun', 'Sep', 'Oct'],
    transportation: ['Subway', 'Bus', 'Taxi', 'Uber'],
    temperature: '-2-30°C',
    timezone: 'EST/EDT (UTC-5/-4)',
    population: '8.8M',
    capital: 'Albany',
    emergencyNumber: '911'
  },
  'tokyo': {
    currency: 'Japanese Yen (JPY)',
    languages: ['Japanese', 'English'],
    bestMonths: ['Mar', 'Apr', 'May', 'Oct', 'Nov'],
    transportation: ['Metro', 'Train', 'Bus', 'Taxi'],
    temperature: '5-30°C',
    timezone: 'JST (UTC+9)',
    population: '13.9M',
    capital: 'Tokyo',
    emergencyNumber: '110'
  },
  'rome': {
    currency: 'Euro (EUR)',
    languages: ['Italian', 'English'],
    bestMonths: ['Apr', 'May', 'Jun', 'Sep', 'Oct'],
    transportation: ['Metro', 'Bus', 'Train', 'Taxi'],
    temperature: '8-30°C',
    timezone: 'CET (UTC+1)',
    population: '2.8M',
    capital: 'Rome',
    emergencyNumber: '112'
  },
  'barcelona': {
    currency: 'Euro (EUR)',
    languages: ['Spanish', 'Catalan', 'English'],
    bestMonths: ['Apr', 'May', 'Jun', 'Sep', 'Oct'],
    transportation: ['Metro', 'Bus', 'Train', 'Taxi'],
    temperature: '10-30°C',
    timezone: 'CET (UTC+1)',
    population: '1.6M',
    capital: 'Madrid',
    emergencyNumber: '112'
  },
  'amsterdam': {
    currency: 'Euro (EUR)',
    languages: ['Dutch', 'English'],
    bestMonths: ['Apr', 'May', 'Jun', 'Sep'],
    transportation: ['Tram', 'Bus', 'Bike', 'Train'],
    temperature: '2-22°C',
    timezone: 'CET (UTC+1)',
    population: '821K',
    capital: 'Amsterdam',
    emergencyNumber: '112'
  },
  'berlin': {
    currency: 'Euro (EUR)',
    languages: ['German', 'English'],
    bestMonths: ['May', 'Jun', 'Jul', 'Aug', 'Sep'],
    transportation: ['U-Bahn', 'S-Bahn', 'Bus', 'Tram'],
    temperature: '-2-25°C',
    timezone: 'CET (UTC+1)',
    population: '3.6M',
    capital: 'Berlin',
    emergencyNumber: '112'
  },
  'prague': {
    currency: 'Czech Koruna (CZK)',
    languages: ['Czech', 'English'],
    bestMonths: ['Apr', 'May', 'Jun', 'Sep', 'Oct'],
    transportation: ['Metro', 'Tram', 'Bus', 'Taxi'],
    temperature: '-5-25°C',
    timezone: 'CET (UTC+1)',
    population: '1.3M',
    capital: 'Prague',
    emergencyNumber: '112'
  },
  'vienna': {
    currency: 'Euro (EUR)',
    languages: ['German', 'English'],
    bestMonths: ['Apr', 'May', 'Jun', 'Sep', 'Oct'],
    transportation: ['U-Bahn', 'Tram', 'Bus', 'Train'],
    temperature: '-5-25°C',
    timezone: 'CET (UTC+1)',
    population: '1.9M',
    capital: 'Vienna',
    emergencyNumber: '112'
  },
  'budapest': {
    currency: 'Hungarian Forint (HUF)',
    languages: ['Hungarian', 'English'],
    bestMonths: ['Apr', 'May', 'Jun', 'Sep', 'Oct'],
    transportation: ['Metro', 'Tram', 'Bus', 'Taxi'],
    temperature: '-5-30°C',
    timezone: 'CET (UTC+1)',
    population: '1.7M',
    capital: 'Budapest',
    emergencyNumber: '112'
  },
  'dubai': {
    currency: 'UAE Dirham (AED)',
    languages: ['Arabic', 'English'],
    bestMonths: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    transportation: ['Metro', 'Bus', 'Taxi', 'Tram'],
    temperature: '15-45°C',
    timezone: 'GST (UTC+4)',
    population: '3.3M',
    capital: 'Abu Dhabi',
    emergencyNumber: '999'
  },
  'abu dhabi': {
    currency: 'UAE Dirham (AED)',
    languages: ['Arabic', 'English'],
    bestMonths: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    transportation: ['Metro', 'Bus', 'Taxi', 'Tram'],
    temperature: '15-45°C',
    timezone: 'GST (UTC+4)',
    population: '1.5M',
    capital: 'Abu Dhabi',
    emergencyNumber: '999'
  },
  'singapore': {
    currency: 'Singapore Dollar (SGD)',
    languages: ['English', 'Mandarin', 'Malay', 'Tamil'],
    bestMonths: ['Feb', 'Mar', 'Jul', 'Aug'],
    transportation: ['MRT', 'Bus', 'Taxi', 'Grab'],
    temperature: '25-32°C',
    timezone: 'SGT (UTC+8)',
    population: '5.7M',
    capital: 'Singapore',
    emergencyNumber: '995'
  },
  'bangkok': {
    currency: 'Thai Baht (THB)',
    languages: ['Thai', 'English'],
    bestMonths: ['Nov', 'Dec', 'Jan', 'Feb'],
    transportation: ['BTS', 'MRT', 'Bus', 'Tuk-tuk'],
    temperature: '25-35°C',
    timezone: 'ICT (UTC+7)',
    population: '8.3M',
    capital: 'Bangkok',
    emergencyNumber: '191'
  },
  'sydney': {
    currency: 'Australian Dollar (AUD)',
    languages: ['English'],
    bestMonths: ['Sep', 'Oct', 'Nov', 'Dec', 'Mar'],
    transportation: ['Train', 'Bus', 'Ferry', 'Light Rail'],
    temperature: '8-26°C',
    timezone: 'AEST/AEDT (UTC+10/+11)',
    population: '5.3M',
    capital: 'Canberra',
    emergencyNumber: '000'
  },
  'melbourne': {
    currency: 'Australian Dollar (AUD)',
    languages: ['English'],
    bestMonths: ['Mar', 'Apr', 'May', 'Sep', 'Oct', 'Nov'],
    transportation: ['Train', 'Tram', 'Bus', 'Taxi'],
    temperature: '6-26°C',
    timezone: 'AEST/AEDT (UTC+10/+11)',
    population: '5.1M',
    capital: 'Canberra',
    emergencyNumber: '000'
  },
  'toronto': {
    currency: 'Canadian Dollar (CAD)',
    languages: ['English', 'French'],
    bestMonths: ['May', 'Jun', 'Jul', 'Aug', 'Sep'],
    transportation: ['Subway', 'Bus', 'Streetcar', 'Taxi'],
    temperature: '-10-25°C',
    timezone: 'EST/EDT (UTC-5/-4)',
    population: '2.9M',
    capital: 'Ottawa',
    emergencyNumber: '911'
  },
  'vancouver': {
    currency: 'Canadian Dollar (CAD)',
    languages: ['English'],
    bestMonths: ['May', 'Jun', 'Jul', 'Aug', 'Sep'],
    transportation: ['SkyTrain', 'Bus', 'SeaBus', 'Taxi'],
    temperature: '3-22°C',
    timezone: 'PST/PDT (UTC-8/-7)',
    population: '675K',
    capital: 'Victoria',
    emergencyNumber: '911'
  },
  'mexico city': {
    currency: 'Mexican Peso (MXN)',
    languages: ['Spanish', 'English'],
    bestMonths: ['Mar', 'Apr', 'May', 'Oct', 'Nov'],
    transportation: ['Metro', 'Bus', 'Metrobús', 'Taxi'],
    temperature: '6-28°C',
    timezone: 'CST/CDT (UTC-6/-5)',
    population: '9.2M',
    capital: 'Mexico City',
    emergencyNumber: '911'
  },
  'rio de janeiro': {
    currency: 'Brazilian Real (BRL)',
    languages: ['Portuguese', 'English'],
    bestMonths: ['Mar', 'Apr', 'May', 'Sep', 'Oct', 'Nov'],
    transportation: ['Metro', 'Bus', 'VLT', 'Taxi'],
    temperature: '18-30°C',
    timezone: 'BRT/BRST (UTC-3/-2)',
    population: '6.7M',
    capital: 'Brasília',
    emergencyNumber: '190'
  },
  'buenos aires': {
    currency: 'Argentine Peso (ARS)',
    languages: ['Spanish', 'English'],
    bestMonths: ['Mar', 'Apr', 'May', 'Sep', 'Oct', 'Nov'],
    transportation: ['Subte', 'Bus', 'Train', 'Taxi'],
    temperature: '8-30°C',
    timezone: 'ART (UTC-3)',
    population: '3.1M',
    capital: 'Buenos Aires',
    emergencyNumber: '911'
  },
  'switzerland': {
    currency: 'Swiss Franc (CHF)',
    languages: ['German', 'French', 'Italian', 'Romansh'],
    bestMonths: ['Jun', 'Jul', 'Aug', 'Sep'],
    transportation: ['Train', 'Bus', 'Cable Car', 'Boat'],
    temperature: '5-25°C',
    timezone: 'CET (UTC+1)',
    population: '8.7M',
    capital: 'Bern',
    emergencyNumber: '112'
  },
  'zurich': {
    currency: 'Swiss Franc (CHF)',
    languages: ['German', 'French', 'Italian'],
    bestMonths: ['Jun', 'Jul', 'Aug', 'Sep'],
    transportation: ['Train', 'Bus', 'Tram', 'Boat'],
    temperature: '5-25°C',
    timezone: 'CET (UTC+1)',
    population: '415K',
    capital: 'Bern',
    emergencyNumber: '112'
  },
  'geneva': {
    currency: 'Swiss Franc (CHF)',
    languages: ['French', 'German', 'Italian'],
    bestMonths: ['Jun', 'Jul', 'Aug', 'Sep'],
    transportation: ['Train', 'Bus', 'Tram', 'Boat'],
    temperature: '5-25°C',
    timezone: 'CET (UTC+1)',
    population: '203K',
    capital: 'Bern',
    emergencyNumber: '112'
  }
  ,
  'bucharest': {
    currency: 'Romanian Leu (RON)',
    languages: ['Romanian', 'English'],
    bestMonths: ['Apr', 'May', 'Sep', 'Oct'],
    transportation: ['Metro', 'Bus', 'Tram', 'Taxi'],
    temperature: '-5-30°C', // Updated to reflect Bucharest's continental climate
    timezone: 'EET/EEST (UTC+2/+3)',
    population: '1.7M',
    capital: 'Bucharest',
    emergencyNumber: '112'
  }
};

/**
 * Get destination information by name
 * @param destinationName - The name of the destination (case-insensitive)
 * @returns Promise<DestinationInfo> - The destination information
 */
export const getDestinationInfo = async (destinationName: string): Promise<DestinationInfo> => {
  // Helper: strip accents/diacritics
  const stripDiacritics = (s: string) => s
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .replace(/['’`-]/g, '')
    .toLowerCase()
    .trim();

  // Normalize the destination name
  const normalizedName = stripDiacritics(destinationName);

  const keys = Object.keys(destinationData);

  // Common aliases/misspellings → canonical keys
  const aliasMap: Record<string, string> = {
    'abudhabi': 'abu dhabi',
    'abu dhabi': 'abu dhabi',
    'abu-dhabi': 'abu dhabi',
    'abu dabi': 'abu dhabi',
    'abu dabee': 'abu dhabi',
    'abhu dhabi': 'abu dhabi',
    'abudhaby': 'abu dhabi',
    'abudhabyu': 'abu dhabi',
  };
  const aliasKey = aliasMap[normalizedName.replace(/\s+/g, ' ')];
  if (aliasKey && destinationData[aliasKey]) {
    return { ...destinationData[aliasKey], matchType: 'fuzzy', suggestedName: aliasKey };
  }
  console.log('Looking for destination:', normalizedName);
  console.log('Available destinations:', keys);

  // 1) Exact match
  if (destinationData[normalizedName]) {
    console.log('Found exact match for:', normalizedName);
    return { ...destinationData[normalizedName], matchType: 'exact', suggestedName: normalizedName };
  }

  // 2) Partial match (contains either way)
  const partialMatch = keys.find(key =>
    normalizedName.includes(stripDiacritics(key)) || stripDiacritics(key).includes(normalizedName)
  );
  if (partialMatch) {
    console.log('Found partial match:', partialMatch, 'for:', normalizedName);
    return { ...destinationData[partialMatch], matchType: 'partial', suggestedName: partialMatch };
  }

  // 3) Fuzzy match with Levenshtein distance
  const levenshtein = (a: string, b: string): number => {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,      // deletion
          dp[i][j - 1] + 1,      // insertion
          dp[i - 1][j - 1] + cost // substitution
        );
      }
    }
    return dp[m][n];
  };

  let bestKey = '';
  let bestScore = Number.POSITIVE_INFINITY;
  for (const key of keys) {
    const score = levenshtein(normalizedName, stripDiacritics(key));
    if (score < bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }
  // Second pass: compare without spaces to handle missing/extra spaces
  const nameNoSpace = normalizedName.replace(/\s+/g, '');
  for (const key of keys) {
    const keyNoSpace = stripDiacritics(key).replace(/\s+/g, '');
    const score = levenshtein(nameNoSpace, keyNoSpace);
    if (score < bestScore) {
      bestScore = score;
      bestKey = key;
    }
  }
  // Third pass: token-aware compare for two-word names (helps variants like "abu dabee")
  const nameTokens = normalizedName.split(/\s+/).filter(Boolean);
  if (nameTokens.length >= 2) {
    for (const key of keys) {
      const keyTokens = stripDiacritics(key).split(/\s+/).filter(Boolean);
      if (keyTokens.length >= 2) {
        const a1 = levenshtein(nameTokens[0], keyTokens[0]);
        const a2 = levenshtein(nameTokens[1], keyTokens[1]);
        const totalA = a1 + a2;
        if (totalA < bestScore) {
          bestScore = totalA;
          bestKey = key;
        }
        // Also try swapped just in case
        const b1 = levenshtein(nameTokens[0], keyTokens[1] || '');
        const b2 = levenshtein(nameTokens[1], keyTokens[0] || '');
        const totalB = b1 + b2;
        if (totalB < bestScore) {
          bestScore = totalB;
          bestKey = key;
        }
      }
    }
  }
  // Threshold: allow small typos relative to length (e.g., 40% of length or <= 3)
  const len = Math.max(1, normalizedName.length);
  const threshold = Math.max(3, Math.ceil(len * 0.4));
  if (bestKey && bestScore <= threshold) {
    console.log(`Fuzzy matched "${destinationName}" -> "${bestKey}" (distance=${bestScore})`);
    return { ...destinationData[bestKey], matchType: 'fuzzy', suggestedName: bestKey };
  }

  console.log('No match found for:', normalizedName, 'returning default data');
  
  // If not found, return default data with a note
  return {
    currency: 'Local Currency',
    languages: ['English', 'Local Language'],
    bestMonths: ['Year-round'],
    transportation: ['Various'],
    temperature: '15-25°C',
    timezone: 'Local Timezone',
    population: 'Unknown',
    capital: 'Unknown',
    emergencyNumber: 'Local Emergency',
    matchType: 'default'
  };
};

/**
 * Get a list of all available destinations
 * @returns string[] - Array of destination names
 */
export const getAvailableDestinations = (): string[] => {
  return Object.keys(destinationData);
};

/**
 * Search destinations by partial name
 * @param searchTerm - The search term
 * @returns string[] - Array of matching destination names
 */
export const searchDestinations = (searchTerm: string): string[] => {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  return Object.keys(destinationData).filter(destination => 
    destination.includes(normalizedSearch)
  );
};
