// Cost per 1K tokens (approximate, update based on current pricing)
export const PROVIDER_COSTS = {
    'deepseek-chat': { provider: 'deepseek', costPer1kTokens: 0.14, priority: 1 },
    'gpt-3.5-turbo': { provider: 'openai', costPer1kTokens: 0.002, priority: 2 },
    'gpt-4o-mini': { provider: 'openai', costPer1kTokens: 0.15, priority: 3 },
    'gpt-4o': { provider: 'openai', costPer1kTokens: 2.5, priority: 4 },
    'grok-1': { provider: 'grok', costPer1kTokens: 0.0, priority: 5 }, // Free tier
};
/**
 * Select the cheapest available provider based on model preferences
 */
export function selectCheapestProvider(requestedModel) {
    const isProviderAvailable = (provider) => {
        switch (provider) {
            case 'deepseek':
                return !!(process.env.DEEPSEEK_API_KEY || process.env.EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY);
            case 'openai':
                return !!(process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY);
            case 'grok':
                return !!(process.env.XAI_API_KEY || process.env.EXPO_PUBLIC_VIBECODE_XAI_API_KEY);
            default:
                return false;
        }
    };
    // Respect requested model only if its provider is available
    if (requestedModel && PROVIDER_COSTS[requestedModel]) {
        const costInfo = PROVIDER_COSTS[requestedModel];
        if (isProviderAvailable(costInfo.provider)) {
            return {
                provider: costInfo.provider,
                model: requestedModel,
                cost: costInfo.costPer1kTokens
            };
        }
    }
    // Filter to only available providers
    const availableProviders = Object.entries(PROVIDER_COSTS)
        .filter(([, costInfo]) => isProviderAvailable(costInfo.provider));
    if (availableProviders.length === 0) {
        throw new Error('No AI providers are configured. Please set API keys.');
    }
    // Sort by cost (cheapest first), then by priority
    const sortedProviders = availableProviders.sort(([, a], [, b]) => {
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
export async function dispatchWithCheapestFirst(request) {
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
    }
    catch (error) {
        console.error(`Error with ${provider}:`, error);
        // Fallback to next cheapest available provider
        const isProviderAvailable = (p) => {
            switch (p) {
                case 'deepseek':
                    return !!(process.env.DEEPSEEK_API_KEY || process.env.EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY);
                case 'openai':
                    return !!(process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY);
                case 'grok':
                    return !!(process.env.XAI_API_KEY || process.env.EXPO_PUBLIC_VIBECODE_XAI_API_KEY);
                default:
                    return false;
            }
        };
        const fallbackProviders = Object.entries(PROVIDER_COSTS)
            .filter(([, costInfo]) => costInfo.provider !== provider && isProviderAvailable(costInfo.provider))
            .sort(([, a], [, b]) => a.costPer1kTokens - b.costPer1kTokens);
        for (const [fallbackModel, fallbackCost] of fallbackProviders) {
            try {
                console.log(`Trying fallback to ${fallbackCost.provider} with model ${fallbackModel}`);
                return await dispatchWithCheapestFirst({ ...request, model: fallbackModel });
            }
            catch (fallbackError) {
                console.error(`Fallback ${fallbackCost.provider} also failed:`, fallbackError);
                continue;
            }
        }
        throw new Error('All AI providers failed');
    }
}
//# sourceMappingURL=providerRouter.js.map