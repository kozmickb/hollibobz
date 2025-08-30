export async function checkAndIncrementAI({ hasPro, userId }:{ hasPro:boolean; userId:string; }) {
  const r = await fetch(`${process.env.EXPO_PUBLIC_AI_PROXY_URL}/usage`, {
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
}
