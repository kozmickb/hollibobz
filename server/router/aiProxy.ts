import { Router } from "express";
import { z } from "zod";
import { dispatchWithCheapestFirst } from "../ai/providerRouter";

const aiProxySchema = z.object({
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
    name: z.string().optional()
  })),
  model: z.string().optional(),
  temperature: z.number().optional(),
  maxTokens: z.number().optional(),
  userId: z.string().optional(),
});

export const aiProxy = Router().post("/ai-proxy", async (req, res) => {
  try {
    const parsed = aiProxySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid request format",
        details: parsed.error.issues
      });
    }

    const result = await dispatchWithCheapestFirst(parsed.data);

    res.json(result);
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    res.status(502).json({
      error: "AI service failed",
      detail: error.message
    });
  }
});
