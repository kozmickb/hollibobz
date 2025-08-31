import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { aiProxy } from "./router/aiProxy";
import { usageRouter } from "./router/usage";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8787;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://yourapp.com'] // Replace with your production domain
    : true, // Allow all in development
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

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 TripTick AI Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
