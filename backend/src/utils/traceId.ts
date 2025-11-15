import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

let errorCount = 0;

export const getErrorCount = () => errorCount;
export const incrementErrorCount = () => {
  errorCount += 1;
  return errorCount;
};

function nowMs(): bigint {
  return process.hrtime.bigint();
}

function durationMs(start: bigint): number {
  const diffNs = Number(process.hrtime.bigint() - start);
  return Math.round(diffNs / 1_000_000); // nanoseconds to milliseconds
}

export function log(data: Record<string, unknown>) {
  // Simple structured log to stdout
  try {
    // Ensure stable keys
    const base = { ts: new Date().toISOString(), ...data };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(base));
  } catch {
    // ignore logging errors
  }
}

export function traceIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const traceId = randomUUID();
  const start = nowMs();

  // store on locals and send back to clients
  res.locals.traceId = traceId;
  res.setHeader('x-trace-id', String(traceId));

  res.on('finish', () => {
    log({
      level: 'info',
      event: 'request',
      method: req.method,
      path: req.originalUrl || req.url,
      status: res.statusCode,
      duration_ms: durationMs(start),
      traceId,
    });
  });

  next();
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) { // eslint-disable-line @typescript-eslint/no-unused-vars
  const traceId = res.locals.traceId;
  incrementErrorCount();

  const status = res.statusCode >= 400 ? res.statusCode : 500;
  const isProd = process.env.NODE_ENV === 'production';
  const message = isProd
    ? 'Internal Server Error'
    : err instanceof Error
      ? err.message || 'Internal Server Error'
      : 'Internal Server Error';

  // Capture error name for branch coverage and path for debugging
  const errorName = err instanceof Error ? err.name : 'Error';
  const path = req.originalUrl || req.url;

  log({
    level: 'error',
    event: 'error',
    status,
    message,
    errorName,
    path,
    traceId,
  });

  res.status(status).json({ error: message, traceId });
}
