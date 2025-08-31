import { AIRequest, AIResponse } from '../providerRouter';

const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';

export async function callGrok(request: AIRequest, model: string): Promise<AIResponse> {
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
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 2048,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Grok API error: ${response.status} ${errorText}`);
    }

    const data = await response.json() as any;
    const usage = data.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    return {
      content: data.choices?.[0]?.message?.content || '',
      provider: 'grok',
      model: model,
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
      },
      costEstimate: 0, // Grok has free tier
    };
  } catch (error: any) {
    console.error('Grok API Error:', error);
    throw new Error(`Grok API failed: ${error.message}`);
  }
}
