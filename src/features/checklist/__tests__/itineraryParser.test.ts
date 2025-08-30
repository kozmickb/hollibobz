import { extractJsonBlock } from '../itineraryParser';

describe('extractJsonBlock', () => {
  it('should extract JSON from a fenced code block', () => {
    const text = `Here's your itinerary:

\`\`\`json
{
  "tripTitle": "Weekend in Paris",
  "sections": [
    {
      "title": "Day 1",
      "items": ["Visit Eiffel Tower", "Lunch at café"]
    }
  ]
}
\`\`\`

Enjoy your trip!`;

    const result = extractJsonBlock(text);
    expect(result).toContain('"tripTitle": "Weekend in Paris"');
    expect(result).toContain('"sections"');
  });

  it('should return the last JSON block if multiple exist', () => {
    const text = `First block:

\`\`\`json
{"old": "data"}
\`\`\`

Updated block:

\`\`\`json
{
  "tripTitle": "Weekend in Paris",
  "sections": []
}
\`\`\``;

    const result = extractJsonBlock(text);
    expect(result).toContain('"tripTitle": "Weekend in Paris"');
    expect(result).not.toContain('"old": "data"');
  });

  it('should return null if no JSON block exists', () => {
    const text = 'Just some regular text without JSON blocks.';
    const result = extractJsonBlock(text);
    expect(result).toBeNull();
  });

  it('should return null for non-json code blocks', () => {
    const text = `Here's some code:

\`\`\`javascript
console.log('hello');
\`\`\``;

    const result = extractJsonBlock(text);
    expect(result).toBeNull();
  });

  it('should handle whitespace around JSON content', () => {
    const text = `\`\`\`json

{
  "tripTitle": "Test"
}

\`\`\``;

    const result = extractJsonBlock(text);
    expect(result?.trim()).toBe('{\n  "tripTitle": "Test"\n}');
  });
});
