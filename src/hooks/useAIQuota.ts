import { API_BASE_URL } from "../config/env";

export async function checkAndIncrementAI({ hasPro, userId }:{ hasPro:boolean; userId:string; }) {
  if (!API_BASE_URL) {
    // Return a mock response when AI service is not available
    return { ok: true, used: 0, limit: hasPro ? 200 : 15 };
  }

  try {
    const r = await fetch(`${API_BASE_URL}/usage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      hasPro,
      freeLimit: Number(process.env.EXPO_PUBLIC_AI_LIMIT_FREE ?? 15),
      proLimit: Number(process.env.EXPO_PUBLIC_AI_LIMIT_PRO ?? 200)
    })
  });
    const data = await r.json();
    return { ok: r.ok && data.allowed !== false, used: data.used, limit: data.limit };
  } catch (error) {
    console.warn('AI quota check failed, using fallback:', error);
    // Return a mock response when the server is not available
    return { ok: true, used: 0, limit: hasPro ? 200 : 15 };
  }
}
