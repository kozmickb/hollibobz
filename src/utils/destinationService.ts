// Note: Destination type removed as per simplified requirements
import { getOpenAIChatResponse } from "../api/chat-service";

/**
 * Clean AI response text by removing hashtags, asterisks, and other formatting artifacts
 * @param text - The raw AI response text
 * @returns Cleaned text without formatting artifacts
 */
function cleanAIResponse(text: string): string {
  if (!text) return text;
  
  return text
    // Remove hashtags (words starting with #)
    .replace(/#\w+/g, '')
    // Remove asterisks used for emphasis/bold
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Remove underscores used for emphasis/italic
    .replace(/_/g, '')
    // Remove multiple spaces that might be left after cleaning
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim();
}

// Common destination name variations and corrections
const destinationCorrections: Record<string, string> = {
  "ny": "New York City, USA",
  "nyc": "New York City, USA",
  "la": "Los Angeles, USA",
  "sf": "San Francisco, USA",
  "london": "London, England",
  "paris": "Paris, France",
  "tokyo": "Tokyo, Japan",
  "rome": "Rome, Italy",
  "barcelona": "Barcelona, Spain",
  "amsterdam": "Amsterdam, Netherlands",
  "dubai": "Dubai, UAE",
  "sydney": "Sydney, Australia",
  "bali": "Bali, Indonesia",
  "thailand": "Bangkok, Thailand",
  "greece": "Athens, Greece",
  "egypt": "Cairo, Egypt",
  "morocco": "Marrakech, Morocco",
  "india": "New Delhi, India",
  "china": "Beijing, China",
  "brazil": "Rio de Janeiro, Brazil",
};

function normalizeDestinationName(input: string): string {
  const normalized = input.toLowerCase().trim();
  return destinationCorrections[normalized] || input;
}

function validateDestinationExists(destinationName: string): boolean {
  const commonDestinations = [
    "paris", "london", "tokyo", "new york", "rome", "barcelona", "amsterdam",
    "dubai", "sydney", "bali", "thailand", "greece", "egypt", "morocco",
    "india", "china", "brazil", "italy", "spain", "france", "england",
    "japan", "australia", "indonesia", "netherlands", "uae"
  ];
  
  const normalized = destinationName.toLowerCase();
  return commonDestinations.some(dest => 
    normalized.includes(dest) || dest.includes(normalized)
  );
}

export async function getDestinationInfo(destinationName: string): Promise<Destination | null> {
  try {
    // Normalize and validate destination name
    const normalizedName = normalizeDestinationName(destinationName);
    
    if (!validateDestinationExists(normalizedName)) {
      throw new Error("Destination not recognized");
    }

    const prompt = `You are a travel expert. Provide detailed information about ${normalizedName} in the following JSON format. Be very specific about the destination and ensure all information is accurate and relevant to this exact location:

{
  "name": "Exact City Name, Country",
  "country": "Full Country Name",
  "images": [
    "https://images.unsplash.com/photo-specific-to-${normalizedName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}",
    "https://images.unsplash.com/photo-landmark-${normalizedName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}",
    "https://images.unsplash.com/photo-culture-${normalizedName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}"
  ],
  "facts": [
    "Specific historical fact about ${normalizedName}",
    "Unique cultural aspect of ${normalizedName}",
    "Interesting geographical fact about ${normalizedName}",
    "Famous landmark or attraction in ${normalizedName}",
    "Local cuisine specialty of ${normalizedName}",
    "Weather or climate fact about ${normalizedName}",
    "Population or demographic fact about ${normalizedName}",
    "Economic or industry fact about ${normalizedName}",
    "Art, music, or literature connection to ${normalizedName}",
    "Transportation or infrastructure fact about ${normalizedName}",
    "Festival or celebration unique to ${normalizedName}",
    "Architecture style characteristic of ${normalizedName}",
    "Natural wonder or park in ${normalizedName}",
    "Sports or recreation popular in ${normalizedName}",
    "Language or dialect spoken in ${normalizedName}",
    "Currency used in ${normalizedName}",
    "Time zone of ${normalizedName}",
    "Best time to visit ${normalizedName}",
    "Shopping district or market in ${normalizedName}",
    "Nightlife characteristic of ${normalizedName}",
    "Educational institution famous in ${normalizedName}",
    "Transportation hub in ${normalizedName}",
    "Local tradition unique to ${normalizedName}",
    "Environmental or sustainability fact about ${normalizedName}",
    "Technology or innovation from ${normalizedName}",
    "Film or TV show set in ${normalizedName}",
    "Museum or gallery famous in ${normalizedName}",
    "Religious or spiritual site in ${normalizedName}",
    "Local wildlife found in ${normalizedName}",
    "Geological formation near ${normalizedName}",
    "Historical event that occurred in ${normalizedName}",
    "Famous person born in ${normalizedName}",
    "Local craft or artisan tradition in ${normalizedName}",
    "Unique building or structure in ${normalizedName}",
    "Local transportation method in ${normalizedName}",
    "Seasonal event in ${normalizedName}",
    "Local beverage popular in ${normalizedName}",
    "Street food specialty of ${normalizedName}",
    "Local music genre from ${normalizedName}",
    "Traditional clothing of ${normalizedName}",
    "Local dance style from ${normalizedName}",
    "Unique law or custom in ${normalizedName}",
    "Local flower or plant native to ${normalizedName}",
    "Traditional game played in ${normalizedName}",
    "Local handicraft from ${normalizedName}",
    "Unique geographical feature of ${normalizedName}",
    "Local legend or myth from ${normalizedName}",
    "Traditional medicine practice in ${normalizedName}",
    "Local fishing or farming tradition in ${normalizedName}",
    "Unique architectural detail in ${normalizedName}"
  ],
  "thingsToDo": [
    "Visit the most famous landmark in ${normalizedName}",
    "Try authentic local cuisine at traditional restaurants",
    "Explore the historic district or old town",
    "Take a guided walking tour",
    "Visit the main museum or cultural center",
    "Experience local nightlife and entertainment",
    "Shop at local markets or boutiques",
    "Take day trips to nearby attractions",
    "Enjoy outdoor activities specific to the region",
    "Attend local festivals or cultural events",
    "Visit religious or spiritual sites",
    "Take photography tours of scenic spots",
    "Experience local transportation methods",
    "Visit parks or natural areas",
    "Take cooking classes for local cuisine",
    "Explore art galleries and studios",
    "Visit local beaches or waterfront areas",
    "Take boat tours or water activities",
    "Visit observation decks or viewpoints",
    "Experience local spa or wellness treatments"
  ]
}

IMPORTANT: 
- Use real Unsplash URLs with specific search terms related to ${normalizedName}
- All facts must be specific, accurate, and educational about ${normalizedName}
- Provide exactly 50 facts for the daily rotation feature
- Ensure activities are actually available in ${normalizedName}
- Double-check that all information is current and accurate`;

    const response = await getOpenAIChatResponse(prompt);

    // Try to parse the JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const destinationData = JSON.parse(jsonMatch[0]);
      
      // Enhanced validation
      if (
        destinationData.name &&
        destinationData.country &&
        Array.isArray(destinationData.images) &&
        destinationData.images.length >= 3 &&
        Array.isArray(destinationData.facts) &&
        destinationData.facts.length >= 20 &&
        Array.isArray(destinationData.thingsToDo) &&
        destinationData.thingsToDo.length >= 10
      ) {
        // Validate images are proper URLs
        const validImages = destinationData.images.filter((img: string) => 
          img.startsWith("https://") && img.includes("unsplash.com")
        );
        
        if (validImages.length >= 2) {
          destinationData.images = validImages;
          return destinationData;
        }
      }
    }

    // Enhanced fallback with destination-specific data
    return createFallbackDestination(normalizedName);
  } catch (error) {
    console.error("Error fetching destination info:", error);
    return createFallbackDestination(destinationName);
  }
}

function createFallbackDestination(destinationName: string): Destination {
  return {
    name: destinationName,
    country: "Unknown",
    images: [
      `https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&q=80`,
      `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&q=80`,
      `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&q=80`,
    ],
    facts: [
      `${destinationName} is a popular travel destination`,
      "Rich in culture and history",
      "Known for its beautiful landscapes",
      "Offers unique local cuisine",
      "Has fascinating architecture",
      "Features vibrant local markets",
      "Known for friendly locals",
      "Offers great photo opportunities",
      "Has interesting museums",
      "Features beautiful parks",
      "Known for its festivals",
      "Offers unique shopping experiences",
      "Has great public transportation",
      "Features stunning viewpoints",
      "Known for its nightlife",
      "Offers outdoor activities",
      "Has historical significance",
      "Features local art scenes",
      "Known for its weather",
      "Offers cultural experiences",
      "Has unique traditions",
      "Features local crafts",
      "Known for its music scene",
      "Offers adventure activities",
      "Has beautiful sunsets",
      "Features local wildlife",
      "Known for its hospitality",
      "Offers wellness experiences",
      "Has unique geography",
      "Features local legends",
      "Known for its festivals",
      "Offers educational tours",
      "Has scenic routes",
      "Features local beverages",
      "Known for its street art",
      "Offers boat tours",
      "Has historic districts",
      "Features local dances",
      "Known for its gardens",
      "Offers cultural workshops",
      "Has unique buildings",
      "Features local sports",
      "Known for its beaches",
      "Offers mountain views",
      "Has vibrant neighborhoods",
      "Features local theaters",
      "Known for its bridges",
      "Offers river activities",
      "Has cultural centers",
      "Features seasonal events"
    ],
    thingsToDo: [
      "Explore local attractions",
      "Try traditional cuisine",
      "Visit museums and landmarks",
      "Take walking tours",
      "Shop at local markets",
      "Experience nightlife",
      "Visit parks and gardens",
      "Take photography tours",
      "Enjoy outdoor activities",
      "Attend cultural events",
      "Visit historical sites",
      "Take boat tours",
      "Explore art galleries",
      "Try local transportation",
      "Visit observation points",
      "Take cooking classes",
      "Explore neighborhoods",
      "Visit beaches or lakes",
      "Take day trips",
      "Experience local festivals"
    ],
  };
}

export function suggestDestinations(input: string): string[] {
  const suggestions = [
    "Paris, France", "London, England", "Tokyo, Japan", "New York City, USA",
    "Rome, Italy", "Barcelona, Spain", "Amsterdam, Netherlands", "Dubai, UAE",
    "Sydney, Australia", "Bali, Indonesia", "Bangkok, Thailand", "Athens, Greece",
    "Cairo, Egypt", "Marrakech, Morocco", "New Delhi, India", "Beijing, China",
    "Rio de Janeiro, Brazil", "Istanbul, Turkey", "Prague, Czech Republic",
    "Vienna, Austria", "Budapest, Hungary", "Lisbon, Portugal", "Berlin, Germany",
    "Copenhagen, Denmark", "Stockholm, Sweden", "Oslo, Norway", "Helsinki, Finland",
    "Reykjavik, Iceland", "Dublin, Ireland", "Edinburgh, Scotland", "Zurich, Switzerland"
  ];
  
  if (!input.trim()) return suggestions.slice(0, 5);
  
  const filtered = suggestions.filter(dest => 
    dest.toLowerCase().includes(input.toLowerCase())
  );
  
  return filtered.length > 0 ? filtered.slice(0, 5) : suggestions.slice(0, 5);
}