import { QuickFact } from './meta';

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

// AI-powered quick facts generation
export async function generateQuickFacts(destination: string): Promise<QuickFact[]> {
  const openaiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
  
  if (!openaiKey) {
    console.log('No OpenAI key available, using enhanced defaults for', destination);
    return getEnhancedDefaultFacts(destination);
  }

  try {
    const prompt = `Generate 4 specific travel quick facts for ${destination}. Respond with ONLY a JSON array of objects with "label" and "value" keys. Keep values concise (under 40 characters each). Include:
1. Currency (actual currency name and symbol)
2. Language (actual language(s) spoken)
3. Best months (specific months for weather/crowds)
4. Getting around (specific transport options)

Example format:
[
  {"label": "Currency", "value": "Euro (€)"},
  {"label": "Language", "value": "Spanish, some English"},
  {"label": "Best months", "value": "Apr-Jun, Sep-Oct"},
  {"label": "Getting around", "value": "Metro, buses, walking"}
]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // More cost-effective than gpt-4o-mini
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 150, // Reduced for cost savings
      }),
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim();
    
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Clean the AI response before parsing
    const cleanedContent = cleanAIResponse(content);

    // Parse JSON response
    const facts = JSON.parse(cleanedContent) as QuickFact[];
    
    // Validate the response has the right structure
    if (Array.isArray(facts) && facts.length >= 4) {
      return facts.slice(0, 4); // Ensure we only take 4 facts
    } else {
      throw new Error('Invalid AI response format');
    }
    
  } catch (error) {
    console.log('Failed to generate AI quick facts for', destination, ':', error);
    return getEnhancedDefaultFacts(destination);
  }
}

// Enhanced default facts with basic destination logic
function getEnhancedDefaultFacts(destination: string): QuickFact[] {
  const dest = destination.toLowerCase();
  
  // Basic heuristics for common destinations
  const euroDestinations = ['paris', 'rome', 'madrid', 'barcelona', 'amsterdam', 'berlin', 'vienna', 'prague', 'lisbon', 'dublin'];
  const poundDestinations = ['london', 'edinburgh', 'glasgow', 'manchester', 'liverpool', 'bristol'];
  const dollarDestinations = ['new york', 'los angeles', 'chicago', 'san francisco', 'miami', 'las vegas'];
  
  let currency = 'Local currency';
  let language = 'Local language';
  
  if (euroDestinations.some(city => dest.includes(city))) {
    currency = 'Euro (€)';
  } else if (poundDestinations.some(city => dest.includes(city))) {
    currency = 'British Pound (£)';
  } else if (dollarDestinations.some(city => dest.includes(city))) {
    currency = 'US Dollar ($)';
  }
  
  if (poundDestinations.some(city => dest.includes(city))) {
    language = 'English';
  } else if (dest.includes('spain') || dest.includes('madrid') || dest.includes('barcelona')) {
    language = 'Spanish, some English';
  } else if (dest.includes('france') || dest.includes('paris')) {
    language = 'French, some English';
  } else if (dest.includes('germany') || dest.includes('berlin')) {
    language = 'German, English common';
  } else if (dest.includes('italy') || dest.includes('rome')) {
    language = 'Italian, some English';
  }

  return [
    { label: 'Currency', value: currency },
    { label: 'Language', value: language },
    { label: 'Best months', value: 'Apr-Jun, Sep-Oct' },
    { label: 'Getting around', value: 'Public transport, walking' },
  ];
}
