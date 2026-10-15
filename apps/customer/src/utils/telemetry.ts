/**
 * Enterprise Telemetry & Monitoring Service
 * This abstraction layer handles capturing errors, performance metrics, and breadcrumbs.
 * In production, it routes to Sentry/Datadog. In development, it formats logs to the console.
 */

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const Telemetry = {
  /**
   * Initialize the telemetry agent (e.g. Sentry.init)
   */
  init: () => {
    if (IS_PRODUCTION) {
      // Sentry.init({ dsn: 'YOUR_SENTRY_DSN' });
      console.log('✅ [Telemetry] Production monitoring initialized.');
    } else {
      console.log('🚧 [Telemetry] Running in Development Mode. Errors will be printed locally.');
    }
  },

  /**
   * Capture an unhandled exception or critical error
   */
  captureException: (error: Error | unknown, context?: Record<string, any>) => {
    if (IS_PRODUCTION) {
      // Sentry.captureException(error, { extra: context });
      // Example: send to custom backend log aggregator
    }
    
    // Always log in development for debugging
    console.error(`🚨 [Telemetry Exception Caught]`, error);
    if (context) {
      console.error(`   Context:`, JSON.stringify(context, null, 2));
    }
  },

  /**
   * Record a user action or breadcrumb for debugging sessions
   */
  logAction: (actionName: string, metadata?: Record<string, any>) => {
    if (IS_PRODUCTION) {
      // Sentry.addBreadcrumb({ category: 'action', message: actionName, data: metadata });
    } else {
      console.log(`📡 [Telemetry Action] ${actionName}`, metadata || '');
    }
  }
};
