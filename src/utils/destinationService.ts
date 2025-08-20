import { Destination } from "../state/holidayStore";
import { getOpenAIChatResponse } from "../api/chat-service";

export async function getDestinationInfo(destinationName: string): Promise<Destination | null> {
  try {
    const prompt = `Please provide information about ${destinationName} in the following JSON format:
{
  "name": "City, Country",
  "country": "Country Name",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "facts": ["Interesting fact 1", "Interesting fact 2", "Interesting fact 3"],
  "thingsToDo": ["Activity 1", "Activity 2", "Activity 3"]
}

For images, use high-quality Unsplash URLs that show the destination. Make sure the JSON is valid and contains real, interesting information about the destination.`;

    const response = await getOpenAIChatResponse(prompt);

    // Try to parse the JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const destinationData = JSON.parse(jsonMatch[0]);
      
      // Validate the structure
      if (
        destinationData.name &&
        destinationData.country &&
        Array.isArray(destinationData.images) &&
        Array.isArray(destinationData.facts) &&
        Array.isArray(destinationData.thingsToDo)
      ) {
        return destinationData;
      }
    }

    // Fallback with mock data if parsing fails
    return {
      name: destinationName,
      country: "Unknown",
      images: [
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      ],
      facts: [
        `${destinationName} is a popular travel destination`,
        "Rich in culture and history",
        "Known for its beautiful landscapes",
      ],
      thingsToDo: [
        "Explore local attractions",
        "Try traditional cuisine",
        "Visit museums and landmarks",
      ],
    };
  } catch (error) {
    console.error("Error fetching destination info:", error);
    return null;
  }
}