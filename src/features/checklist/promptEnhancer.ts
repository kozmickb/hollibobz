/**
 * Checklist format instruction to append to itinerary-related prompts
 */
export const CHECKLIST_FORMAT_INSTRUCTION = `

Return two parts:
1) A short readable trip overview for humans.
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
- Limit to max 6 sections, and 5-8 items per section.
- Items must be concrete actions or packing items, not generic advice.
- If children are in the group, include at least one family/child-focused item.
- If duration and date are provided, tailor packing to weather and trip length.
- If public transport info is provided, include a transport/setup section (cards, apps, passes).`;

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
 * Enhances a prompt with checklist formatting instructions if it appears to be an itinerary request
 */
export function enhancePromptForChecklist(prompt: string): string {
  if (isItineraryRequest(prompt)) {
    return prompt + CHECKLIST_FORMAT_INSTRUCTION;
  }
  return prompt;
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
    return userPrompt;
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
  if ((context?.children ?? 0) > 0) {
    lines.push(`- Include at least one family/children section with age-appropriate items.`);
  }

  lines.push(`\n${CHECKLIST_FORMAT_INSTRUCTION}`);

  return lines.join('\n');
}
