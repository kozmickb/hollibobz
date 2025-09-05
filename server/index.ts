import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { PrismaClient } from "@prisma/client";
import { requestIdMiddleware } from "./src/middleware/requestId";
import { register, httpRequestDuration } from "./src/metrics";
import { Logger } from "./src/logger";
import { env } from "./src/config/env";

const app = express();
const prisma = new PrismaClient();

const PORT = env.PORT;
const SERVICE_NAME = env.SERVICE_NAME;
const CORS_ORIGINS = env.CORS_ORIGINS.split(",").map(s => s.trim()).filter(Boolean);
const METRICS_TOKEN = env.METRICS_TOKEN;
const GIT_COMMIT = env.GIT_COMMIT;

// Request ID middleware (must be first)
app.use(requestIdMiddleware);

// Security middleware
app.use(helmet());
app.disable("x-powered-by");

// Body parsing
app.use(express.json({ limit: "1mb" }));

// Logging
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Rate limiting with custom response
const limiter = rateLimit({ 
  windowMs: 60_000, 
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: "rate_limited" });
  }
});
app.use(limiter);

// CORS with allowlist
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || CORS_ORIGINS.length === 0) {
      // In production, default to no CORS if no origins specified
      if (env.NODE_ENV === "production") {
        return cb(new Error("CORS blocked"), false);
      }
      return cb(null, true);
    }
    return CORS_ORIGINS.some(a => origin.endsWith(a)) ? cb(null, true) : cb(new Error("CORS blocked"), false);
  },
  credentials: true,
}));

// Metrics endpoint with authentication
app.get("/api/metrics", (req, res) => {
  if (!METRICS_TOKEN) {
    return res.status(401).json({ error: "metrics not configured" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.slice(7) !== METRICS_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }

  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.send(register.metrics());
});

// Health endpoint with improved payload
app.get("/api/health", async (req, res) => {
  const start = Date.now();
  let db = { ok: false, latencyMs: null as number | null };
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    db.ok = true;
    db.latencyMs = Date.now() - start;
  } catch (e: any) {
    Logger.error("Health check DB error", { error: e?.message }, req.requestId);
  }

  const response = {
    ok: db.ok,
    uptimeSec: Math.floor(process.uptime()),
    commit: GIT_COMMIT,
    db,
    timestamp: new Date().toISOString()
  };

  res.status(db.ok ? 200 : 503).json(response);
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

// Request duration metrics middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode.toString())
      .observe(duration);
  });
  
  next();
});

// Start server
app.listen(PORT, () => {
  Logger.info("Server started", { 
    port: PORT, 
    service: SERVICE_NAME,
    nodeEnv: env.NODE_ENV,
    gitCommit: GIT_COMMIT 
  });
});