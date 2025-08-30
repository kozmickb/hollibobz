/*
IMPORTANT NOTICE: DO NOT REMOVE
./src/api/chat-service.ts
If the user wants to use AI to generate text, answer questions, or analyze images you can use the functions defined in this file to communicate with the OpenAI, Anthropic, and Grok APIs.
*/
import { AIMessage, AIRequestOptions, AIResponse } from "../types/ai";
import { getDeepseekClient } from "./deepseek";
import { getOpenAIClient } from "./openai";
import { getGrokClient } from "./grok";

/**
 * Send AI request through server proxy (new implementation)
 * @param messages - The messages to send to the AI
 * @param options - The options for the request
 * @returns The response from the AI
 */
export const sendAIThroughProxy = async (
  messages: AIMessage[],
  options?: AIRequestOptions,
): Promise<AIResponse> => {
  try {
    const proxyUrl = process.env.EXPO_PUBLIC_AI_PROXY_URL;
    if (!proxyUrl) {
      throw new Error('AI proxy URL not configured');
    }

    const response = await fetch(`${proxyUrl}/ai-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model: options?.model,
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `AI proxy error: ${response.status}`);
    }

    const data = await response.json();

    return {
      content: data.content || "",
      usage: {
        promptTokens: data.usage?.promptTokens || 0,
        completionTokens: data.usage?.completionTokens || 0,
        totalTokens: data.usage?.totalTokens || 0,
      },
    };
  } catch (error) {
    console.error("AI Proxy Error:", error);
    throw error;
  }
};

/**
 * Legacy: Get a text response from Deepseek (direct API call - deprecated)
 * @deprecated Use sendAIThroughProxy instead
 */
export const getDeepseekTextResponse = async (
  messages: AIMessage[],
  options?: AIRequestOptions,
): Promise<AIResponse> => {
  try {
    const client = getDeepseekClient();
    const defaultModel = "deepseek-chat";

    const response = await client.chat.completions.create({
      model: options?.model || defaultModel,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 2048,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error("Deepseek API Error:", error);
    throw error;
  }
};

/**
 * Get a simple chat response from Deepseek
 * @param prompt - The prompt to send to the AI
 * @returns The response from the AI
 */
export const getDeepseekChatResponse = async (prompt: string): Promise<AIResponse> => {
  return await getDeepseekTextResponse([{ role: "user", content: prompt }]);
};

/**
 * Get a text response from OpenAI
 * @param messages - The messages to send to the AI
 * @param options - The options for the request
 * @returns The response from the AI
 */
export const getOpenAITextResponse = async (messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> => {
  try {
    const client = getOpenAIClient();
    const defaultModel = "gpt-4o"; //accepts images as well, use this for image analysis

    const response = await client.chat.completions.create({
      model: options?.model || defaultModel,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 2048,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
};

/**
 * Get a simple chat response from OpenAI
 * @param prompt - The prompt to send to the AI
 * @returns The response from the AI
 */
export const getOpenAIChatResponse = async (prompt: string): Promise<AIResponse> => {
  return await getOpenAITextResponse([{ role: "user", content: prompt }]);
};

/**
 * Get a text response from Grok
 * @param messages - The messages to send to the AI
 * @param options - The options for the request
 * @returns The response from the AI
 */
export const getGrokTextResponse = async (messages: AIMessage[], options?: AIRequestOptions): Promise<AIResponse> => {
  try {
    const client = getGrokClient();
    const defaultModel = "grok-3-beta";

    const response = await client.chat.completions.create({
      model: options?.model || defaultModel,
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 2048,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
    };
  } catch (error) {
    console.error("Grok API Error:", error);
    throw error;
  }
};

/**
 * Get a simple chat response from Grok
 * @param prompt - The prompt to send to the AI
 * @returns The response from the AI
 */
export const getGrokChatResponse = async (prompt: string): Promise<AIResponse> => {
  return await getGrokTextResponse([{ role: "user", content: prompt }]);
};
