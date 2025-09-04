import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { aiProxy } from "./router/aiProxy";
import { usageRouter } from "./router/usage";
import { airportsRouter } from "./routes/api/airports";
import { flightsRouter } from "./routes/api/flights";
import { ingestRouter } from "./routes/api/ingest";

// Load environment variables from server directory
const envPath = require('path').resolve(__dirname, '.env');
console.log('🔧 Loading .env from:', envPath);
dotenv.config({ path: envPath });

console.log('🔧 Environment Loading Debug:');
console.log('   - AVIATIONSTACK_API_KEY:', process.env.AVIATIONSTACK_API_KEY ? process.env.AVIATIONSTACK_API_KEY.substring(0, 10) + '...' : 'undefined');
console.log('   - PORT:', process.env.PORT || 'undefined');
console.log('   - NODE_ENV:', process.env.NODE_ENV || 'undefined');

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// CORS allowlist via env: CORS_ORIGIN="https://example.com,https://app.example.com"
const allowlist = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const corsOptions = allowlist.length
  ? {
      origin(origin: string | undefined, cb: (err: Error | null, ok?: boolean) => void) {
        if (!origin || allowlist.includes(origin)) return cb(null, true);
        cb(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }
  : {};

app.use(helmet());
app.use(morgan("combined"));
app.use(express.json());
app.use(cors(corsOptions));

// Health: verifies DB connectivity and returns JSON
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      ok: true,
      db: "ok",
      time: new Date().toISOString(),
      env: process.env.NODE_ENV ?? "development",
      commit: process.env.RAILWAY_GIT_COMMIT_SHA ?? null,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      db: "error",
      error: err?.message ?? String(err),
      time: new Date().toISOString(),
    });
  }
});

// (Keep any existing routes below this comment)
app.use(aiProxy);
app.use(usageRouter);
app.use("/api/airports", airportsRouter);
app.use("/api/flights", flightsRouter);
app.use("/api/ingest", ingestRouter);

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
