export type QuickFact = { label: string; value: string };
export type FAQ = { id: string; title: string; query: string };

export type DestinationMeta = {
  destination: string;
  imageUrl?: string;       // remote backdrop url
  quickFacts: QuickFact[];
  faqs: FAQ[];
  cachedAtISO: string;
};

// Template facts/FAQs used when we do not have anything cached.
// Note: Quick Facts will be populated by AI or enhanced defaults - these are just fallbacks
export function buildDefaultMeta(destination: string): DestinationMeta {
  const d = destination.trim();
  // Start with empty quick facts - they'll be populated by generateQuickFacts
  const quickFacts: QuickFact[] = [];

  const faqs: FAQ[] = [
    { id: "top-sights", title: `Top sights in ${d}`, query: `What are the must-see sights in ${d}? Group them by area with realistic walking times and opening hours.` },
    { id: "getting-around", title: "Best way to get around", query: `What's the best way to get around ${d}? Include costs for day passes, metro cards, and when to use taxis vs public transport.` },
    { id: "family", title: "Family-friendly picks", query: `What are the best family-friendly activities in ${d} for mixed ages? Include indoor options for bad weather and any booking requirements.` },
    { id: "food", title: "Food & local dishes", query: `What should I eat in ${d}? What are the signature local dishes and best areas for food? Suggest restaurants for different budget levels.` },
    { id: "safety", title: "Safety & areas", query: `What safety tips should I know for ${d}? Are there areas to avoid at night? What are common tourist scams and emergency numbers?` },
    { id: "day-trips", title: "Day-trip ideas", query: `What are good day-trip ideas from ${d}? Include travel times, how to get there, and realistic timing for each trip.` },
  ];

  return { destination: d, quickFacts, faqs, cachedAtISO: new Date().toISOString() };
}
