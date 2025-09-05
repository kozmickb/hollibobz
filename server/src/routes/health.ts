import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/health", async (_req, res) => {
  try {
    // Simple DB round-trip
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ok: true,
      uptime: process.uptime(),
      db: { connected: true },
      version: "1.0.0",
      env: process.env.NODE_ENV || "development"
    });
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e?.message ?? "db error",
      db: { connected: false }
    });
  }
});

export default router;
