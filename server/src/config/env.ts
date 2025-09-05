import { cleanEnv, str, port, num } from 'envalid';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 3000 }),
  DATABASE_URL: str(),
  SERVICE_NAME: str({ default: 'odysync' }),
  
  // CORS Configuration
  CORS_ORIGINS: str({ default: '' }),
  CORS_ORIGIN: str({ default: '*' }),
  ALLOWED_ORIGINS: str({ default: '' }),
  
  // API Keys - Aviation & Flight Data
  AVIATIONSTACK_API_KEY: str({ default: '' }),
  AERODATABOX_RAPIDAPI_KEY: str({ default: '' }),
  AERODATABOX_RAPIDAPI_HOST: str({ default: '' }),
  
  // AI Provider API Keys
  OPENAI_API_KEY: str({ default: '' }),
  DEEPSEEK_API_KEY: str({ default: '' }),
  XAI_API_KEY: str({ default: '' }),
  
  // Alternative AI API Keys (for frontend compatibility)
  EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY: str({ default: '' }),
  EXPO_PUBLIC_VIBECODE_DEEPSEEK_API_KEY: str({ default: '' }),
  EXPO_PUBLIC_VIBECODE_XAI_API_KEY: str({ default: '' }),
  
  // AI Usage Limits
  EXPO_PUBLIC_AI_LIMIT_PRO: num({ default: 200 }),
  EXPO_PUBLIC_AI_LIMIT_FREE: num({ default: 15 }),
  
  // Database Connection Settings
  DB_WAIT_RETRIES: num({ default: 20 }),
  DB_WAIT_DELAY_MS: num({ default: 1500 }),
  
  // Application Environment
  APP_ENV: str({ default: 'development' }),
  
  // Monitoring & Metrics
  METRICS_TOKEN: str({ default: '' }),
  GIT_COMMIT: str({ default: '' }),
});
