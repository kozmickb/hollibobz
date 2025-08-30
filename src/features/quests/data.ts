export interface Quest {
  id: string;
  title: string;
  description: string;
  seedQuery: string;
  rewardXP: number;
}

export const QUESTS: Quest[] = [
  {
    id: 'explore-destination',
    title: 'Destination Explorer',
    description: 'Ask Holly Bobz about the top attractions in your destination',
    seedQuery: 'What are the top 5 must-see attractions in {destination}? Include opening hours and entry fees.',
    rewardXP: 10
  },
  {
    id: 'local-cuisine',
    title: 'Local Foodie',
    description: 'Discover local cuisine and dining recommendations',
    seedQuery: 'What are the best local dishes to try in {destination}? Recommend 3 authentic restaurants with typical prices.',
    rewardXP: 8
  },
  {
    id: 'transport-guide',
    title: 'Transport Master',
    description: 'Learn about getting around your destination',
    seedQuery: 'What\'s the best way to get around {destination}? Include public transport options, costs, and tips for tourists.',
    rewardXP: 6
  },
  {
    id: 'hidden-gems',
    title: 'Hidden Gems Hunter',
    description: 'Find off-the-beaten-path locations',
    seedQuery: 'What are some hidden gems or lesser-known spots in {destination} that tourists often miss?',
    rewardXP: 12
  },
  {
    id: 'budget-tips',
    title: 'Budget Traveller',
    description: 'Get money-saving tips for your trip',
    seedQuery: 'What are the best budget-friendly tips for visiting {destination}? Include free activities and money-saving hacks.',
    rewardXP: 7
  },
  {
    id: 'cultural-insights',
    title: 'Cultural Explorer',
    description: 'Learn about local customs and culture',
    seedQuery: 'What should I know about local customs and culture in {destination}? Any etiquette tips for visitors?',
    rewardXP: 9
  },
  {
    id: 'day-itinerary',
    title: 'Itinerary Planner',
    description: 'Get a detailed day-by-day itinerary',
    seedQuery: 'Create a detailed 3-day itinerary for {destination} with realistic timings and transport between sights.',
    rewardXP: 15
  }
];

export function getQuestsForDestination(destination: string): Quest[] {
  return QUESTS.map(quest => ({
    ...quest,
    seedQuery: quest.seedQuery.replace(/{destination}/g, destination)
  }));
}

export function getQuestById(id: string): Quest | undefined {
  return QUESTS.find(quest => quest.id === id);
}
