// Centralized environment configuration
// Import and use this instead of process.env directly
import { config } from 'dotenv';
config();

export const env = {
  // Server Configuration
  PORT: parseInt(process.env.PORT || '9999', 10),
  NODE_ENV: process.env.NODE_ENV || 'dev',

  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL as string,

  // Redis Configuration
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  REDIS_TTL: parseInt(process.env.REDIS_TTL || '3600', 10),

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET as string,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS Configuration
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '*',

  // Logging Configuration
  LOG_PATH: process.env.LOG_PATH || 'logs',
  LOG_ERROR: process.env.LOG_ERROR || 'error.log',
  LOG_ACCESS: process.env.LOG_ACCESS || 'access.log',
  SHOW_NEST_LOGS: process.env.SHOW_NEST_LOGS === 'true',
};