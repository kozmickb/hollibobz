import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { corsMiddleware } from "./src/middleware/cors";
import healthRouter from "./src/routes/health";
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
const PORT = Number(process.env.PORT) || 3000;
// Production hardening middleware
app.set("trust proxy", 1);
app.use(helmet());
app.use(morgan("combined"));
app.use(express.json({ limit: "2mb" }));
app.use(corsMiddleware());
// API routes FIRST
app.use("/api", healthRouter);
app.use(aiProxy);
app.use(usageRouter);
app.use("/api/airports", airportsRouter);
app.use("/api/flights", flightsRouter);
app.use("/api/ingest", ingestRouter);
// Error handling middleware
app.use((error, req, res, next) => {
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
    console.log(`API listening on ${PORT} (env=${process.env.NODE_ENV || "unknown"})`);
});
//# sourceMappingURL=index.js.map