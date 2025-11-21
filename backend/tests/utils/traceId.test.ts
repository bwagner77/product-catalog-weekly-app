import { errorHandler, log, getErrorCount } from '../../src/utils/traceId';
import type { Request, Response } from 'express';

describe('traceId errorHandler logging branches', () => {
  it('logs errorName and path and increments counter', () => {
    const req = { originalUrl: '/api/test', method: 'GET' } as unknown as Request;
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { locals: { traceId: 'abc' }, statusCode: 200, status: statusMock } as unknown as Response;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const before = getErrorCount();
    const err = new TypeError('boom');
    errorHandler(err, req, res, (() => {}) as any);
    const after = getErrorCount();
    expect(after).toBe(before + 1);
    const logged = logSpy.mock.calls.map(c => String(c[0]));
    const errorLog = logged.find(l => l.includes('error') && l.includes('boom'));
    expect(errorLog).toMatch(/TypeError/);
    expect(errorLog).toMatch(/"path":"\/api\/test"/);
    logSpy.mockRestore();
  });

  it('log() safely ignores JSON.stringify errors (circular)', () => {
    const cyc: any = { a: 1 };
    cyc.self = cyc;
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    // Should not throw
    expect(() => log({ cyc })).not.toThrow();
    // And should not call console.log due to catch
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('uses production-safe message and preserves 4xx status when already set', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const req = { originalUrl: '/api/test', method: 'GET' } as unknown as Request;
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { locals: { traceId: 'abc' }, statusCode: 404, status: statusMock } as unknown as Response;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorHandler(new Error('boom'), req, res, (() => {}) as any);
    const calls = logSpy.mock.calls.map(c => String(c[0]));
    const errorLog = calls.find(l => l.includes('error'))!;
    expect(errorLog).toMatch(/"status":404/);
    expect(errorLog).toMatch(/Internal Server Error/);
    logSpy.mockRestore();
    process.env.NODE_ENV = prev;
  });

  it('non-Error value produces generic message and 500 status', () => {
    const req = { originalUrl: '/api/other', method: 'POST' } as unknown as Request;
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { locals: { traceId: 'xyz' }, statusCode: 200, status: statusMock } as unknown as Response;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorHandler('plain failure', req, res, (() => {}) as any);
    const logged = logSpy.mock.calls.map(c => String(c[0]));
    const entry = logged.find(l => l.includes('plain failure'));
    // Should not include plain failure in message (generic Internal Server Error), but errorName should be "Error"
    expect(entry).toBeUndefined();
    const errorEntry = logged.find(l => l.includes('"event":"error"'))!;
    expect(errorEntry).toMatch(/"status":500/);
    expect(errorEntry).toMatch(/Internal Server Error/);
    logSpy.mockRestore();
  });

  it('Error with empty message falls back to Internal Server Error', () => {
    const req = { originalUrl: '/api/empty', method: 'GET' } as unknown as Request;
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const res = { locals: { traceId: 'empty' }, statusCode: 200, status: statusMock } as unknown as Response;
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const err = new Error('');
    errorHandler(err, req, res, (() => {}) as any);
    const errorEntry = logSpy.mock.calls.map(c => String(c[0])).find(l => l.includes('"event":"error"'))!;
    expect(errorEntry).toMatch(/Internal Server Error/);
    logSpy.mockRestore();
  });
});
