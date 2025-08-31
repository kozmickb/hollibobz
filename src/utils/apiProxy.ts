// API Proxy for future backend integration
// This placeholder prepares for swapping from direct OpenAI/Grok calls to a serverless backend

import { API_BASE_URL } from "../config/env";

export interface ApiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ApiMessage[];
  provider: 'openai' | 'grok';
  model?: string;
  temperature?: number;
  userPreferences?: {
    budget: string;
    travellerType: string;
    destination?: string;
    season?: string;
  };
}

export interface ChatResponse {
  content: string;
  provider: string;
  usage?: {
    tokens: number;
    cost?: number;
  };
}

// Development flag - switch to true when backend is ready
const USE_BACKEND_PROXY = false;
const BACKEND_URL = API_BASE_URL || 'https://your-backend.vercel.app';

export async function callChatAPI(request: ChatRequest): Promise<ChatResponse> {
  if (USE_BACKEND_PROXY) {
    // Future: Use backend proxy
    return await callBackendProxy(request);
  } else {
    // Current: Direct API calls (existing implementation)
    return await callDirectAPI(request);
  }
}

async function callBackendProxy(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.EXPO_PUBLIC_USER_TOKEN || ''}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend proxy error:', error);
    throw error;
  }
}

async function callDirectAPI(request: ChatRequest): Promise<ChatResponse> {
  // This uses the existing direct API implementation
  if (request.provider === 'openai') {
    return await callOpenAIDirect(request);
  } else {
    return await callGrokDirect(request);
  }
}

async function callOpenAIDirect(request: ChatRequest): Promise<ChatResponse> {
  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OpenAI API key");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${apiKey}` 
    },
    body: JSON.stringify({
      model: request.model || "gpt-4o-mini",
      messages: request.messages,
      temperature: request.temperature || 0.4,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || "Sorry, I could not produce a reply.",
    provider: 'openai',
    usage: {
      tokens: data.usage?.total_tokens || 0,
    },
  };
}

async function callGrokDirect(request: ChatRequest): Promise<ChatResponse> {
  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_XAI_API_KEY;
  if (!apiKey) throw new Error("Missing Grok API key");

  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${apiKey}` 
    },
    body: JSON.stringify({
      model: request.model || "grok-4",
      messages: request.messages,
      temperature: request.temperature || 0.4,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return {
    content: data.choices?.[0]?.message?.content || "Sorry, I could not produce a reply.",
    provider: 'grok',
    usage: {
      tokens: data.usage?.total_tokens || 0,
    },
  };
}

// Utility function to prepare user preferences for the backend
export function prepareUserContext(
  travellerType: string,
  budgetMode: string,
  destination?: string,
  dateISO?: string
) {
  const season = dateISO ? getSeasonFromDate(dateISO) : undefined;
  
  return {
    budget: budgetMode,
    travellerType,
    destination,
    season,
  };
}

function getSeasonFromDate(dateISO: string): string {
  const date = new Date(dateISO);
  const month = date.getMonth();
  
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Autumn";
  return "Winter";
}
