import OpenAI from 'openai';
// Initialize OpenAI client (supports root EXPO_ key fallback)
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY,
});
export async function callOpenAI(request, model) {
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
            provider: 'openai',
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
        console.error('OpenAI API Error:', error);
        throw new Error(`OpenAI API failed: ${error.message}`);
    }
}
function calculateCost(model, totalTokens) {
    const costPer1kTokens = {
        'gpt-3.5-turbo': 0.002,
        'gpt-4o-mini': 0.15,
        'gpt-4o': 2.5,
    }[model] || 0.15;
    return (totalTokens / 1000) * costPer1kTokens;
}
//# sourceMappingURL=openai.js.map