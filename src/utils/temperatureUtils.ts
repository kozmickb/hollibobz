/**
 * Temperature utility functions for consistent temperature intelligence across the app
 */

export interface TemperatureEstimate {
  seasonal: string;
  description: string;
  recommendedClothing?: string[];
}

/**
 * Get intelligent temperature estimate for a destination and trip date
 */
export function getTemperatureEstimate(destination: string, baseTemp: string, tripDate?: Date): TemperatureEstimate {
  if (!tripDate) {
    return {
      seasonal: baseTemp,
      description: 'Year-round average',
    };
  }

  const month = tripDate.getMonth(); // 0-11
  const dest = destination.toLowerCase();

  // Bucharest/Romania specific temperature patterns
  if (dest.includes('bucharest') || dest.includes('romania')) {
    if (month >= 5 && month <= 8) { // Summer (Jun-Sep)
      return {
        seasonal: '20-30°C',
        description: 'Summer - Warm and pleasant',
        recommendedClothing: ['Light clothing', 'Sunscreen', 'Comfortable walking shoes']
      };
    } else if (month >= 11 || month <= 1) { // Winter (Dec-Feb)
      return {
        seasonal: '-5-5°C',
        description: 'Winter - Cold and snowy',
        recommendedClothing: ['Heavy winter coat', 'Warm boots', 'Hat and gloves', 'Thermal layers']
      };
    } else if (month >= 2 && month <= 4) { // Spring (Mar-May)
      return {
        seasonal: '5-15°C',
        description: 'Spring - Mild and variable',
        recommendedClothing: ['Light jacket', 'Layers', 'Comfortable shoes']
      };
    } else { // Fall (Oct-Nov)
      return {
        seasonal: '5-15°C',
        description: 'Fall - Cool and colorful',
        recommendedClothing: ['Light jacket', 'Long sleeves', 'Comfortable walking shoes']
      };
    }
  }

  // Abu Dhabi specific temperature patterns
  if (dest.includes('abu dhabi')) {
    if (month >= 4 && month <= 9) { // Summer (May-Oct)
      return {
        seasonal: '30-45°C',
        description: 'Summer - Very hot and dry',
        recommendedClothing: ['Light, breathable clothing', 'Sunscreen', 'Light hat', 'Sandals']
      };
    } else { // Winter (Nov-Apr)
      return {
        seasonal: '15-25°C',
        description: 'Winter - Mild and pleasant',
        recommendedClothing: ['Light layers', 'Light jacket', 'Comfortable shoes']
      };
    }
  }

  // Dubai similar to Abu Dhabi
  if (dest.includes('dubai')) {
    if (month >= 4 && month <= 9) {
      return {
        seasonal: '32-48°C',
        description: 'Summer - Extremely hot',
        recommendedClothing: ['Light, breathable clothing', 'Sunscreen', 'Light hat', 'Light shoes']
      };
    } else {
      return {
        seasonal: '18-28°C',
        description: 'Winter - Mild and comfortable',
        recommendedClothing: ['Light layers', 'Light jacket', 'Comfortable shoes']
      };
    }
  }

  // European destinations with continental climate
  if (dest.includes('paris') || dest.includes('london') || dest.includes('berlin') ||
      dest.includes('warsaw') || dest.includes('prague')) {
    if (month >= 5 && month <= 8) { // Summer
      const tempMatch = baseTemp.match(/(\d+)-(\d+)/);
      if (tempMatch) {
        const avg = (parseInt(tempMatch[1]) + parseInt(tempMatch[2])) / 2;
        return {
          seasonal: `${Math.round(avg + 5)}-${Math.round(avg + 10)}°C`,
          description: 'Summer - Warm and pleasant',
          recommendedClothing: ['Light clothing', 'Sunscreen', 'Comfortable shoes']
        };
      }
    } else if (month >= 10 || month <= 2) { // Winter
      const tempMatch = baseTemp.match(/(\d+)-(\d+)/);
      if (tempMatch) {
        const avg = (parseInt(tempMatch[1]) + parseInt(tempMatch[2])) / 2;
        return {
          seasonal: `${Math.round(avg - 10)}-${Math.round(avg - 5)}°C`,
          description: 'Winter - Cold and crisp',
          recommendedClothing: ['Warm coat', 'Boots', 'Hat and gloves', 'Thermal layers']
        };
      }
    }
  }

  // Mediterranean destinations
  if (dest.includes('rome') || dest.includes('barcelona') || dest.includes('athens')) {
    if (month >= 5 && month <= 9) { // Summer
      return {
        seasonal: baseTemp.replace(/(\d+)-(\d+)/, (match, min, max) => {
          return `${Math.round(parseInt(min) + 5)}-${Math.round(parseInt(max) + 5)}°C`;
        }),
        description: 'Summer - Warm Mediterranean',
        recommendedClothing: ['Light clothing', 'Sunscreen', 'Sandals']
      };
    } else if (month >= 11 || month <= 2) { // Winter
      return {
        seasonal: baseTemp.replace(/(\d+)-(\d+)/, (match, min, max) => {
          return `${Math.round(parseInt(min) - 5)}-${Math.round(parseInt(max) - 5)}°C`;
        }),
        description: 'Winter - Mild Mediterranean',
        recommendedClothing: ['Light jacket', 'Comfortable layers', 'Closed shoes']
      };
    }
  }

  // Default fallback
  return {
    seasonal: baseTemp,
    description: 'Year-round average',
  };
}

/**
 * Get clothing recommendations based on temperature
 */
export function getClothingRecommendation(temperature: string): string[] {
  const tempMatch = temperature.match(/(\d+)-(\d+)/);
  if (!tempMatch) return ['Comfortable clothing for the weather'];

  const avgTemp = (parseInt(tempMatch[1]) + parseInt(tempMatch[2])) / 2;

  if (avgTemp >= 30) {
    return ['Light, breathable clothing', 'Sunscreen', 'Light hat', 'Sandals', 'Light fabrics'];
  } else if (avgTemp >= 20) {
    return ['Light clothing', 'Sunscreen', 'Comfortable shoes', 'Light layers'];
  } else if (avgTemp >= 10) {
    return ['Light jacket', 'Long sleeves', 'Comfortable walking shoes', 'Layers'];
  } else if (avgTemp >= 0) {
    return ['Warm coat', 'Warm boots', 'Hat and gloves', 'Thermal layers', 'Warm scarf'];
  } else {
    return ['Heavy winter coat', 'Warm boots', 'Thick hat and gloves', 'Thermal layers', 'Warm scarf', 'Insulated clothing'];
  }
}
