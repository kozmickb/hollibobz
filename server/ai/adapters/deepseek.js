import OpenAI from 'openai';
// Initialize Deepseek client (uses OpenAI-compatible API; supports root EXPO_ key fallback)
const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || process.env.EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
});
export async function callDeepseek(request, model) {
    var _a, _b, _c, _d;
    try {
        // Filter out undefined name properties to match OpenAI API requirements
        const messages = request.messages.map(msg => {
            const { name, ...rest } = msg;
            return name ? { ...rest, name } : rest;
        });
        const response = await client.chat.completions.create({
            model: model,
            messages: messages,
            temperature: (_a = request.temperature) !== null && _a !== void 0 ? _a : 0.7,
            max_tokens: (_b = request.maxTokens) !== null && _b !== void 0 ? _b : 2048,
        });
        const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        return {
            content: ((_d = (_c = response.choices[0]) === null || _c === void 0 ? void 0 : _c.message) === null || _d === void 0 ? void 0 : _d.content) || '',
            provider: 'deepseek',
            model: model,
            usage: {
                promptTokens: usage.prompt_tokens,
                completionTokens: usage.completion_tokens,
                totalTokens: usage.total_tokens,
            },
            costEstimate: calculateCost(model, usage.total_tokens),
        };
    }
    catch (error) {
        console.error('Deepseek API Error:', error);
        throw new Error(`Deepseek API failed: ${error.message}`);
    }
}
function calculateCost(model, totalTokens) {
    const costPer1kTokens = {
        'deepseek-chat': 0.14,
        'deepseek-coder': 0.14,
    }[model] || 0.14;
    return (totalTokens / 1000) * costPer1kTokens;
}
//# sourceMappingURL=deepseek.js.map