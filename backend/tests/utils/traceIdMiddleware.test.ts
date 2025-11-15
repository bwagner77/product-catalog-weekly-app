import { traceIdMiddleware } from '../../src/utils/traceId';
import type { Request, Response, NextFunction } from 'express';

describe('traceIdMiddleware branches', () => {
  it('logs with req.url when originalUrl is missing', () => {
    const req = { method: 'GET', url: '/fallback' } as unknown as Request;
    const listeners: Record<string, Function[]> = {};
    const res = {
      locals: {},
      setHeader: jest.fn(),
      statusCode: 200,
      on: (event: string, cb: Function) => {
        listeners[event] = listeners[event] || [];
        listeners[event].push(cb);
        return res as any;
      },
    } as unknown as Response;
    const next: NextFunction = jest.fn();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    traceIdMiddleware(req, res, next);

    // simulate finish
    (listeners['finish'] || []).forEach(fn => fn());

    const calls = spy.mock.calls.map(c => String(c[0]));
    const found = calls.find(c => c.includes('"path":"/fallback"'));
    expect(found).toBeTruthy();
    spy.mockRestore();
  });
});
