import { z } from 'zod';

// Cost per 1K tokens (approximate, update based on current pricing)
export const PROVIDER_COSTS = {
  'deepseek-chat': { provider: 'deepseek', costPer1kTokens: 0.14, priority: 1 },
  'gpt-3.5-turbo': { provider: 'openai', costPer1kTokens: 0.002, priority: 2 },
  'gpt-4o-mini': { provider: 'openai', costPer1kTokens: 0.15, priority: 3 },
  'gpt-4o': { provider: 'openai', costPer1kTokens: 2.5, priority: 4 },
  'grok-1': { provider: 'grok', costPer1kTokens: 0.0, priority: 5 }, // Free tier
} as const;

export type ProviderCost = typeof PROVIDER_COSTS[keyof typeof PROVIDER_COSTS];

export interface AIRequest {
  messages: Array<{ role: string; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costEstimate?: number;
}

/**
 * Select the cheapest available provider based on model preferences
 */
export function selectCheapestProvider(requestedModel?: string): { provider: string; model: string; cost: number } {
  if (requestedModel && PROVIDER_COSTS[requestedModel as keyof typeof PROVIDER_COSTS]) {
    const costInfo = PROVIDER_COSTS[requestedModel as keyof typeof PROVIDER_COSTS];
    return {
      provider: costInfo.provider,
      model: requestedModel,
      cost: costInfo.costPer1kTokens
    };
  }

  // Sort by cost (cheapest first), then by priority
  const sortedProviders = Object.entries(PROVIDER_COSTS)
    .sort(([,a], [,b]) => {
      if (a.costPer1kTokens !== b.costPer1kTokens) {
        return a.costPer1kTokens - b.costPer1kTokens;
      }
      return a.priority - b.priority;
    });

  const [model, costInfo] = sortedProviders[0];
  return {
    provider: costInfo.provider,
    model,
    cost: costInfo.costPer1kTokens
  };
}

/**
 * Dispatch AI request to the cheapest available provider
 */
export async function dispatchWithCheapestFirst(request: AIRequest): Promise<AIResponse> {
  const { provider, model } = selectCheapestProvider(request.model);

  console.log(`Dispatching to ${provider} with model ${model}`);

  try {
    switch (provider) {
      case 'deepseek':
        const deepseekAdapter = await import('./adapters/deepseek');
        return await deepseekAdapter.callDeepseek(request, model);

      case 'openai':
        const openaiAdapter = await import('./adapters/openai');
        return await openaiAdapter.callOpenAI(request, model);

      case 'grok':
        const grokAdapter = await import('./adapters/grok');
        return await grokAdapter.callGrok(request, model);

      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error with ${provider}:`, error);

    // Fallback to next cheapest provider
    const fallbackProviders = Object.entries(PROVIDER_COSTS)
      .filter(([, costInfo]) => costInfo.provider !== provider)
      .sort(([,a], [,b]) => a.costPer1kTokens - b.costPer1kTokens);

    for (const [fallbackModel, fallbackCost] of fallbackProviders) {
      try {
        console.log(`Trying fallback to ${fallbackCost.provider} with model ${fallbackModel}`);
        return await dispatchWithCheapestFirst({ ...request, model: fallbackModel });
      } catch (fallbackError) {
        console.error(`Fallback ${fallbackCost.provider} also failed:`, fallbackError);
        continue;
      }
    }

    throw new Error('All AI providers failed');
  }
}
