function findFirstBalancedJson(source: string): string | null {
  let start = -1;
  let depth = 0;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (ch === '}') {
      if (depth > 0) depth--;
      if (depth === 0 && start !== -1) {
        return source.substring(start, i + 1).trim();
      }
    }
  }
  return null;
}

export function extractJsonBlock(text: string): string | null {
  // Prefer the last fenced code block; accept both ```json and generic ```
  const fencedJson = Array.from(text.matchAll(/```json\s*([\s\S]*?)```/gi)).pop()?.[1];
  const fencedAny = fencedJson ?? Array.from(text.matchAll(/```\s*([\s\S]*?)```/g)).pop()?.[1];

  // Sanitize common artifacts like a stray leading 'json' line inside the fence
  const candidate = (fencedAny ?? text)
    .replace(/^\s*json\b/i, '')
    .trim();

  // Try to extract a balanced JSON object from the candidate
  const balanced = findFirstBalancedJson(candidate);
  if (balanced) return balanced;

  // Fallback: try from full text
  const fallback = findFirstBalancedJson(text);
  return fallback ? fallback : null;
}
