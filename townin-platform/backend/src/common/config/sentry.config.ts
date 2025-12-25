import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export function initializeSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('SENTRY_DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',

    // Performance Monitoring
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'), // 10% of requests

    // Profiling
    profilesSampleRate: parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1'),

    integrations: [
      nodeProfilingIntegration(),
    ],

    // Filter errors before sending
    beforeSend(event, hint) {
      const error = hint.originalException;

      // Don't send 404 errors
      if (error && typeof error === 'object' && 'status' in error) {
        if ((error as any).status === 404) {
          return null;
        }
      }

      // Don't send client errors (4xx) except 401, 403
      if (event.exception) {
        const statusCode = event.extra?.statusCode;
        if (statusCode && statusCode >= 400 && statusCode < 500) {
          if (statusCode !== 401 && statusCode !== 403) {
            return null;
          }
        }
      }

      return event;
    },

    // Sanitize sensitive data
    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === 'http') {
        // Remove sensitive headers
        const data = breadcrumb.data || {};
        const headers = data.headers || {};

        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        for (const header of sensitiveHeaders) {
          if (headers[header]) {
            headers[header] = '***REDACTED***';
          }
        }
      }

      return breadcrumb;
    },
  });

  console.log(`Sentry initialized (Environment: ${process.env.NODE_ENV}, Release: ${process.env.npm_package_version})`);
}

/**
 * Capture exception with user context
 */
export function captureExceptionWithUser(error: Error, userId?: string, email?: string) {
  if (userId || email) {
    Sentry.setUser({ id: userId, email });
  }

  Sentry.captureException(error);

  // Clear user context
  Sentry.setUser(null);
}

/**
 * Start a performance transaction
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}
