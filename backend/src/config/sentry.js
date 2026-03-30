import * as Sentry from "@sentry/node";

export const initSentry = (app) => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || "",
    tracesSampleRate: 1.0,
  });

  // Attach request handler
  app.use((req, res, next) => {
    Sentry.runWithAsyncContext(() => {
      next();
    });
  });
};