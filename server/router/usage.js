import { Router } from "express";
import { z } from "zod";
const usage = new Map();
const monthKey = () => `${new Date().getUTCFullYear()}-${new Date().getUTCMonth() + 1}`;
const usageSchema = z.object({
    userId: z.string(),
    hasPro: z.boolean().optional(),
    freeLimit: z.number().optional(),
    proLimit: z.number().optional(),
});
const router = Router();
router.post("/usage", (req, res) => {
    var _a, _b;
    try {
        const parsed = usageSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: "Invalid usage request" });
        }
        const { userId, hasPro, freeLimit, proLimit } = parsed.data;
        const key = `${userId}:${monthKey()}`;
        const current = usage.get(key) || 0;
        const limit = hasPro
            ? (proLimit !== null && proLimit !== void 0 ? proLimit : Number((_a = process.env.EXPO_PUBLIC_AI_LIMIT_PRO) !== null && _a !== void 0 ? _a : 200))
            : (freeLimit !== null && freeLimit !== void 0 ? freeLimit : Number((_b = process.env.EXPO_PUBLIC_AI_LIMIT_FREE) !== null && _b !== void 0 ? _b : 15));
        if (current >= limit) {
            return res.status(429).json({
                allowed: false,
                used: current,
                limit,
                message: "Usage limit exceeded"
            });
        }
        usage.set(key, current + 1);
        res.json({
            allowed: true,
            used: current + 1,
            limit
        });
    }
    catch (error) {
        console.error('Usage tracking error:', error);
        res.status(500).json({ error: "Usage tracking failed" });
    }
});
export const usageRouter = router;
//# sourceMappingURL=usage.js.map