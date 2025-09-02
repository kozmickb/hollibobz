/**
 * Enhanced format instruction for all AI responses - provides better structure and specificity
 */
export const ENHANCED_RESPONSE_INSTRUCTION = `

IMPORTANT FORMATTING GUIDELINES:

1) RESPONSE STRUCTURE: Always provide direct, actionable answers. Use this format:
   "Here's your [specific request]:

   [Direct, specific answer with real venue names and locations]

   💡 You might also want to consider:
   • [Category 1] - brief description
   • [Category 2] - brief description
   • [Category 3] - brief description"

2) SPECIFICITY REQUIREMENTS:
   - NEVER use placeholders like "<confirm taxi company>", "<confirm cafe name>", "[insert address here]", "[specific coffee shop name]", or "[address]"
   - ALWAYS provide real, specific venue names and locations
   - For transportation: Use actual services like "Uber", "Bolt", "Careem", "local taxi", "public bus", "tram", "metro", etc.
   - For coffee shops/restaurants: Use real names like "Starbucks", "Costa Coffee", "local café chains", or research actual venues in the area
   - If you don't know exact venues, say "research coffee shops near [specific location]" rather than using placeholders
   - Provide approximate prices, distances, and travel times when possible

3) RESPONSE LENGTH:
   - Keep responses focused and actionable
   - Don't add unrelated suggestions unless directly relevant
   - Avoid ending with "Would you like me to..." unless it's a natural follow-up

4) LOCATION AWARENESS:
   - If the user mentions a specific hotel/area, provide recommendations for that exact location
   - Use real transportation options available in that city
   - Provide specific addresses or neighborhoods when possible

5) EXAMPLES OF GOOD RESPONSES:
   - ✅ "Take an Uber from Hilton Garden Inn to Endava offices (15-20 minutes, €25-35)"
   - ✅ "Visit Starbucks at 123 Main Street or Costa Coffee at 456 Oak Avenue near your hotel"
   - ❌ "Use [transport service] from [hotel] to [office] ([time], [cost])"
   - ❌ "Check out [coffee shop name] located at [address]"

6) AVOID THESE PATTERNS:
   - [insert address here]
   - [specific coffee shop name]
   - [another coffee shop name]
   - <confirm taxi company>
   - <confirm cafe name>`;

/**
 * Checklist format instruction to append to itinerary-related prompts
 */
export const CHECKLIST_FORMAT_INSTRUCTION = `

${ENHANCED_RESPONSE_INSTRUCTION}

For checklist/itinerary requests, also return two parts:
1) A short readable trip overview for humans following the structure above.
2) A strict JSON object named itinerary_json that matches:
{
  "tripTitle": "string",
  "sections": [
    { "title": "string", "items": ["string", "..."] }
  ]
}
Rules:
- Put ONLY the JSON object in a single fenced code block marked json.
- No comments or trailing text inside the code block.
- Use null only if absolutely needed, otherwise omit fields.
- Keep sections destination-specific and actionable.
- Limit to max 3-4 sections for the initial response, and 3-5 items per section.
- Items must be concrete actions or packing items, not generic advice.
- If children are in the group, include at least one family/child-focused item.
- If duration and date are provided, tailor packing to weather and trip length.
- If public transport info is provided, include a transport/setup section (cards, apps, passes).
- ALWAYS be specific about venue names, addresses, and exact locations when mentioned.`;

/**
 * Keywords that suggest the user is asking for an itinerary
 */
const ITINERARY_KEYWORDS = [
  'itinerary',
  'schedule',
  'plan',
  'agenda',
  'checklist',
  'day by day',
  'things to do',
  'activities',
  'trip plan',
  'travel plan',
  'visit',
  'sightseeing',
  'tour'
];

/**
 * Checks if a prompt appears to be requesting an itinerary
 */
export function isItineraryRequest(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase();
  return ITINERARY_KEYWORDS.some(keyword => lowerPrompt.includes(keyword));
}

/**
 * Enhances a prompt with formatting instructions for better AI responses
 */
export function enhancePromptForChecklist(prompt: string): string {
  if (isItineraryRequest(prompt)) {
    return prompt + CHECKLIST_FORMAT_INSTRUCTION;
  }
  // Apply enhanced formatting to ALL prompts for better response quality
  return prompt + ENHANCED_RESPONSE_INSTRUCTION;
}

// New: Build a richer prompt using trip context and destination info
import type { DestinationInfo } from '../../api/destination-data';

export function buildChecklistPrompt(
  userPrompt: string,
  context?: {
    destination?: string;
    dateISO?: string;
    duration?: number;
    adults?: number;
    children?: number;
  },
  destinationInfo?: DestinationInfo
): string {
  if (!isItineraryRequest(userPrompt)) {
    // Apply enhanced formatting even for non-itinerary requests
    return userPrompt + ENHANCED_RESPONSE_INSTRUCTION;
  }

  const lines: string[] = [];
  lines.push(userPrompt.trim());

  // Trip context
  if (context?.destination || context?.dateISO || context?.duration || context?.adults !== undefined || context?.children !== undefined) {
    lines.push('\n\nTrip context:');
    if (context.destination) lines.push(`- Destination: ${context.destination}`);
    if (context.dateISO) lines.push(`- Trip date: ${context.dateISO}`);
    if (context.duration) lines.push(`- Duration: ${context.duration} day(s)`);
    if (context.adults !== undefined) lines.push(`- Adults: ${context.adults}`);
    if (context.children !== undefined) lines.push(`- Children: ${context.children}`);
  }

  // Destination info
  if (destinationInfo) {
    lines.push('\nDestination details:');
    if (destinationInfo.currency) lines.push(`- Currency: ${destinationInfo.currency}`);
    if (destinationInfo.languages?.length) lines.push(`- Languages: ${destinationInfo.languages.join(', ')}`);
    if (destinationInfo.bestMonths?.length) lines.push(`- Best months: ${destinationInfo.bestMonths.join(', ')}`);
    if (destinationInfo.transportation?.length) lines.push(`- Transport: ${destinationInfo.transportation.join(', ')}`);
    if (destinationInfo.temperature) lines.push(`- Typical temperature: ${destinationInfo.temperature}`);
    if (destinationInfo.timezone) lines.push(`- Timezone: ${destinationInfo.timezone}`);
  }

  // Destination-specific guidance
  lines.push(`\nInstructions to tailor the checklist:`);
  lines.push(`- Use section titles that are specific to ${context?.destination || 'the destination'} (e.g., "Packing for ${context?.destination || 'the trip'} in ${context?.dateISO || 'this season'}", "Transport in ${context?.destination || 'city'}", "Cultural Etiquette").`);
  lines.push(`- Include destination-specific items (e.g., local power adapters, transit cards, dress code considerations).`);
  lines.push(`- ALWAYS be specific about venue names, addresses, and exact locations when mentioned.`);
  lines.push(`- If the user mentions a hotel, neighborhood, or specific area, provide concrete recommendations for that exact location.`);
  if ((context?.children ?? 0) > 0) {
    lines.push(`- Include at least one family/children section with age-appropriate items.`);
  }

  lines.push(`\n${CHECKLIST_FORMAT_INSTRUCTION}`);

  return lines.join('\n');
}
