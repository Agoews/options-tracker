import "server-only";

export function logServerError(message: string, error: unknown, metadata?: Record<string, unknown>) {
  console.error(message, {
    ...(metadata ? { metadata } : {}),
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
  });
}
