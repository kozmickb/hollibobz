const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
export async function callGrok(request, model) {
    var _a, _b, _c, _d, _e;
    try {
        // Filter out undefined name properties
        const messages = request.messages.map(msg => {
            const { name, ...rest } = msg;
            return name ? { ...rest, name } : rest;
        });
        const response = await fetch(GROK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.XAI_API_KEY || process.env.EXPO_PUBLIC_VIBECODE_XAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: (_a = request.temperature) !== null && _a !== void 0 ? _a : 0.7,
                max_tokens: (_b = request.maxTokens) !== null && _b !== void 0 ? _b : 2048,
                stream: false,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Grok API error: ${response.status} ${errorText}`);
        }
        const data = await response.json();
        const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
        return {
            content: ((_e = (_d = (_c = data.choices) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content) || '',
            provider: 'grok',
            model: model,
            usage: {
                promptTokens: usage.prompt_tokens,
                completionTokens: usage.completion_tokens,
                totalTokens: usage.total_tokens,
            },
            costEstimate: 0, // Grok has free tier
        };
    }
    catch (error) {
        console.error('Grok API Error:', error);
        throw new Error(`Grok API failed: ${error.message}`);
    }
}
//# sourceMappingURL=grok.js.map