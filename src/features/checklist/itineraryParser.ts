export function extractJsonBlock(text: string): string | null {
  // find the last fenced code block that starts with ```json
  const match = Array.from(text.matchAll(/```json\s*([\s\S]*?)```/g)).pop();
  return match ? match[1].trim() : null;
}
