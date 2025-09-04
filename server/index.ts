import express from "express";
import cors from "cors";
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
const PORT = process.env.PORT || 8787;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourapp.com'] // Replace with your production domain
    : ['http://localhost:8081', 'http://127.0.0.1:8081'], // Allow Expo dev server
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-rapidapi-key', 'x-rapidapi-host']
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get("/health", (_, res) => res.json({
  ok: true,
  timestamp: new Date().toISOString(),
  version: "1.0.0"
}));

// API routes
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
  console.log(`🚀 Odysync AI Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
