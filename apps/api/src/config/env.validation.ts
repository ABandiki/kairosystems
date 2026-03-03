import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

interface EnvConfig {
  JWT_SECRET: string;
  DATABASE_URL: string;
  NODE_ENV?: string;
  PORT?: string;
  CORS_ORIGIN?: string;
  JWT_EXPIRES_IN?: string;
}

/**
 * Validates required environment variables at application startup.
 * Fails fast if critical secrets are missing in production.
 */
export function validateEnv(): EnvConfig {
  const isProduction = process.env.NODE_ENV === 'production';

  const required: Array<{ key: string; prodOnly?: boolean }> = [
    { key: 'JWT_SECRET' },
    { key: 'DATABASE_URL' },
    { key: 'CORS_ORIGIN', prodOnly: true },
  ];

  const missing: string[] = [];

  for (const { key, prodOnly } of required) {
    if (!process.env[key]) {
      if (prodOnly && !isProduction) {
        logger.warn(`${key} is not set (acceptable in development)`);
      } else if (!prodOnly) {
        missing.push(key);
      }
    }
  }

  // Block insecure JWT defaults
  if (
    process.env.JWT_SECRET &&
    (process.env.JWT_SECRET === 'super-secret-key' ||
      process.env.JWT_SECRET.length < 16)
  ) {
    if (isProduction) {
      missing.push('JWT_SECRET (too weak for production, use >= 32 characters)');
    } else {
      logger.warn('JWT_SECRET is weak — use a strong secret in production');
    }
  }

  if (missing.length > 0) {
    const msg = `Missing required environment variables:\n  - ${missing.join('\n  - ')}`;
    logger.error(msg);
    throw new Error(msg);
  }

  return {
    JWT_SECRET: process.env.JWT_SECRET!,
    DATABASE_URL: process.env.DATABASE_URL!,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
  };
}
