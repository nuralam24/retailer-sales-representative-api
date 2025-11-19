export const SECURITY_CONSTANTS = {
  // Password Policy - Use in validation
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
    BCRYPT_SALT_ROUNDS: 10,
  },

  // JWT Settings - Use in auth module
  JWT: {
    DEFAULT_EXPIRES_IN: '1d',
    DEFAULT_REFRESH_EXPIRES_IN: '7d',
    MIN_SECRET_LENGTH: 32,
  },

  // Request Limits - Reference only (actual config in main.ts)
  REQUEST: {
    MAX_JSON_SIZE: '10mb',
    MAX_URLENCODED_SIZE: '10mb',
    MAX_FILE_SIZE: '50mb',
  },

  // Session Settings - Use if implementing sessions
  SESSION: {
    MAX_AGE_MS: 24 * 60 * 60 * 1000, // 24 hours
    MAX_AGE_DAYS: 1,
  },

  // Common Security Headers - Reference
  HEADERS: {
    API_KEY_HEADER: 'x-api-key',
    RATE_LIMIT_HEADER: 'x-ratelimit-limit',
    RATE_REMAINING_HEADER: 'x-ratelimit-remaining',
  },
};

/**
 * 1: Helmet               → HTTP Security Headers
 * 2: Rate Limiting        → DDoS Prevention
 * 3: SQL Injection Guard  → Database Attack Prevention ✨ NEW
 * 4: XSS Protection       → Script Injection Prevention ✨ NEW
 * 5: Input Validation     → DTO Validation
 * 6: TypeORM              → Parameterized Queries
 * 7: JWT Authentication   → Secure Auth
 * 8: CORS                 → Origin Control
 * 9: Exception Filters    → No Info Leak
 * 10: Security Logging    → Attack Monitoring ✨ NEW
 */

