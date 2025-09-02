/**
 * Weather service for fetching current temperature and weather conditions
 */

export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  lastUpdated: Date;
}

/**
 * Get current weather for a destination
 * Note: This is a mock implementation. In production, you'd integrate with a weather API
 */
export async function getCurrentWeather(destination: string): Promise<WeatherData | null> {
  try {
    // Mock weather data based on destination with seasonal variations
    const currentMonth = new Date().getMonth(); // 0-11
    const isSummer = currentMonth >= 4 && currentMonth <= 9; // May-Oct

    const mockWeather: Record<string, WeatherData> = {
      'abu dhabi': {
        temp: isSummer ? 38 : 22, // Hot summer, mild winter
        condition: isSummer ? 'Sunny' : 'Clear',
        humidity: isSummer ? 45 : 70,
        windSpeed: 15,
        lastUpdated: new Date()
      },
      'dubai': {
        temp: isSummer ? 40 : 24, // Even hotter than Abu Dhabi
        condition: isSummer ? 'Sunny' : 'Clear',
        humidity: isSummer ? 40 : 65,
        windSpeed: 18,
        lastUpdated: new Date()
      },
      'bucharest': {
        temp: isSummer ? 25 : 2, // Warm summer, cold winter
        condition: isSummer ? 'Sunny' : 'Snow',
        humidity: isSummer ? 60 : 80,
        windSpeed: isSummer ? 8 : 12,
        lastUpdated: new Date()
      },
      'paris': {
        temp: 18,
        condition: 'Cloudy',
        humidity: 70,
        windSpeed: 8,
        lastUpdated: new Date()
      },
      'london': {
        temp: 15,
        condition: 'Rainy',
        humidity: 80,
        windSpeed: 10,
        lastUpdated: new Date()
      },
      'new york': {
        temp: 22,
        condition: 'Partly Cloudy',
        humidity: 55,
        windSpeed: 14,
        lastUpdated: new Date()
      }
    };

    // Normalize destination name
    const normalized = destination.toLowerCase().trim();

    // Return mock data if available
    if (mockWeather[normalized]) {
      return mockWeather[normalized];
    }

    // Generate semi-realistic weather based on typical conditions
    let baseTemp: number;
    let condition: string;

    if (normalized.includes('dubai') || normalized.includes('abu')) {
      // UAE destinations - very hot in summer, mild in winter
      baseTemp = isSummer ? 38 : 22;
      condition = isSummer ? 'Sunny' : 'Clear';
    } else if (normalized.includes('bucharest') || normalized.includes('romania')) {
      // Bucharest - continental climate, cold winters, warm summers
      baseTemp = isSummer ? 25 : 2;
      condition = isSummer ? 'Sunny' : 'Snow';
    } else if (normalized.includes('paris') || normalized.includes('london') ||
               normalized.includes('berlin') || normalized.includes('warsaw')) {
      // Western/Central European cities
      baseTemp = isSummer ? 24 : 8;
      condition = isSummer ? 'Sunny' : 'Cloudy';
    } else if (normalized.includes('tokyo')) {
      // Tokyo
      baseTemp = isSummer ? 28 : 8;
      condition = isSummer ? 'Humid' : 'Clear';
    } else if (normalized.includes('rome') || normalized.includes('barcelona')) {
      // Mediterranean cities
      baseTemp = isSummer ? 28 : 12;
      condition = isSummer ? 'Sunny' : 'Mild';
    } else {
      // Generic
      baseTemp = 20;
      condition = 'Clear';
    }

    return {
      temp: baseTemp + Math.floor(Math.random() * 6) - 3, // +/- 3 degrees variance
      condition,
      humidity: 60,
      windSpeed: 10,
      lastUpdated: new Date()
    };

  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

/**
 * Format temperature for display
 */
export function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`;
}

/**
 * Get weather icon based on condition
 */
export function getWeatherIcon(condition: string): string {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
    return 'sunny';
  } else if (lowerCondition.includes('cloud')) {
    return 'partly-sunny';
  } else if (lowerCondition.includes('rain')) {
    return 'rainy';
  } else {
    return 'thermometer';
  }
}
