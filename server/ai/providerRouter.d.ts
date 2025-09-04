export declare const PROVIDER_COSTS: {
    readonly 'deepseek-chat': {
        readonly provider: "deepseek";
        readonly costPer1kTokens: 0.14;
        readonly priority: 1;
    };
    readonly 'gpt-3.5-turbo': {
        readonly provider: "openai";
        readonly costPer1kTokens: 0.002;
        readonly priority: 2;
    };
    readonly 'gpt-4o-mini': {
        readonly provider: "openai";
        readonly costPer1kTokens: 0.15;
        readonly priority: 3;
    };
    readonly 'gpt-4o': {
        readonly provider: "openai";
        readonly costPer1kTokens: 2.5;
        readonly priority: 4;
    };
    readonly 'grok-1': {
        readonly provider: "grok";
        readonly costPer1kTokens: 0;
        readonly priority: 5;
    };
};
export type ProviderCost = typeof PROVIDER_COSTS[keyof typeof PROVIDER_COSTS];
export interface AIRequest {
    messages: Array<{
        role: string;
        content: string;
        name?: string;
    }>;
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
export declare function selectCheapestProvider(requestedModel?: string): {
    provider: string;
    model: string;
    cost: number;
};
/**
 * Dispatch AI request to the cheapest available provider
 */
export declare function dispatchWithCheapestFirst(request: AIRequest): Promise<AIResponse>;
//# sourceMappingURL=providerRouter.d.ts.map