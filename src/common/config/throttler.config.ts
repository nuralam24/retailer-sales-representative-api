import { ThrottlerModuleOptions } from '@nestjs/throttler';

/**
 * Rate Limiting Configuration
 * Prevents DDoS attacks and API abuse
 */
export const throttlerConfig: ThrottlerModuleOptions = [
  {
    name: 'short',
    ttl: 1000, // 1 second
    limit: 100, // 100 requests per second
  },
  {
    name: 'medium',
    ttl: 10000, // 10 seconds
    limit: 200, // 200 requests per 10 seconds
  },
  {
    name: 'long',
    ttl: 60000, // 1 minute
    limit: 500, // 500 requests per minute
  },
];

/**
 * Usage:
 * Import this config in app.module.ts
 * 
 * ThrottlerModule.forRoot(throttlerConfig)
 * 
 * These limits can be adjusted based on your needs:
 * - Increase for high-traffic APIs
 * - Decrease for stricter rate limiting
 * - Use different limits per route with @Throttle() decorator
 */

