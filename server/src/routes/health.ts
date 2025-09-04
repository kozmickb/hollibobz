import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/health", async (_req, res) => {
  const payload: any = { ok: true, time: new Date().toISOString(), env: process.env.NODE_ENV };
  try {
    await prisma.$queryRaw`SELECT 1`;
    payload.db = "ok";
    res.json(payload);
  } catch (e) {
    payload.db = "fail";
    res.status(500).json(payload);
  }
});

export default router;
