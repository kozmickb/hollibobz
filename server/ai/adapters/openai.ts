import OpenAI from 'openai';
import { AIRequest, AIResponse } from '../providerRouter';

// Initialize OpenAI client (supports root EXPO_ key fallback)
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY,
});

export async function callOpenAI(request: AIRequest, model: string): Promise<AIResponse> {
  try {
    // Filter out undefined name properties to match OpenAI API requirements
    const messages = request.messages.map(msg => {
      const { name, ...rest } = msg;
      return name ? { ...rest, name } : rest;
    });

    const response = await client.chat.completions.create({
      model: model,
      messages: messages as any,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
    });

    const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    return {
      content: response.choices[0]?.message?.content || '',
      provider: 'openai',
      model: model,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      costEstimate: calculateCost(model, usage.total_tokens),
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    throw new Error(`OpenAI API failed: ${error.message}`);
  }
}

function calculateCost(model: string, totalTokens: number): number {
  const costPer1kTokens = {
    'gpt-3.5-turbo': 0.002,
    'gpt-4o-mini': 0.15,
    'gpt-4o': 2.5,
  }[model] || 0.15;

  return (totalTokens / 1000) * costPer1kTokens;
}
