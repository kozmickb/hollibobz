import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

const PORT = Number(process.env.PORT ?? 3000);
const SERVICE_NAME = process.env.SERVICE_NAME ?? "odysync";
const CORS_ORIGIN = (process.env.CORS_ORIGIN ?? "").split(",").map(s => s.trim()).filter(Boolean);

// middleware
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));
app.disable("x-powered-by");

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || CORS_ORIGIN.length === 0) return cb(null, true);
    return CORS_ORIGIN.some(a => origin.endsWith(a)) ? cb(null, true) : cb(new Error("CORS blocked"), false);
  },
  credentials: true,
}));

// health
app.get("/api/health", async (_req, res) => {
  const start = Date.now();
  let db = { connected: false, latency_ms: null as number | null, error: null as string | null };
  try {
    await prisma.$queryRaw`SELECT 1`;
    db.connected = true;
    db.latency_ms = Date.now() - start;
  } catch (e: any) {
    db.error = e?.message ?? "unknown";
  }

  res.status(200).json({
    status: db.connected ? "ok" : "degraded",
    service: SERVICE_NAME,
    version: process.env.npm_package_version,
    uptime_s: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    db,
  });
});

// example root
app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// start server
app.listen(PORT, () => {
  console.log(`🚀 ${SERVICE_NAME} listening on :${PORT}`);
});