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
- Use null only if absolutely needed, otherwise omit fields.`;

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
