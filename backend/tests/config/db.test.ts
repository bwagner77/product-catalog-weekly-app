import * as db from '../../src/config/db';
import mongoose from 'mongoose';

jest.mock('mongoose', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
  },
}));

const mockedMongoose = mongoose as unknown as { connect: jest.Mock; disconnect: jest.Mock };

describe('db.connectDB branches', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('sanitizes credentials in success log', async () => {
    mockedMongoose.connect.mockResolvedValue({} as any);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const uri = 'mongodb://user:pass@localhost:27017/app';
    await db.connectDB(uri);
    const call = logSpy.mock.calls.find(c => String(c[0]).includes('db_connect_success'));
    expect(call).toBeTruthy();
    const payload = JSON.parse(String(call![0]));
    expect(payload.uri).toMatch(/\*\*\*\*:\*\*\*\*@/);
    logSpy.mockRestore();
  });

  it('logs error on failure path', async () => {
    mockedMongoose.connect.mockRejectedValue(new Error('nope'));
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(db.connectDB('not-a-real-uri')).rejects.toThrow('nope');
    const call = errSpy.mock.calls.find(c => String(c[0]).includes('db_connect_error'));
    expect(call).toBeTruthy();
    errSpy.mockRestore();
  });

  it('leaves URI unchanged when no credentials present', async () => {
    mockedMongoose.connect.mockResolvedValue({} as any);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const uri = 'mongodb://localhost:27017/app';
    await db.connectDB(uri);
    const call = logSpy.mock.calls.find(c => String(c[0]).includes('db_connect_success'));
    const payload = JSON.parse(String(call![0]));
    // Node URL adds trailing slash automatically; ensure match either form
    expect(payload.uri === uri || payload.uri === uri + '/').toBe(true);
    logSpy.mockRestore();
  });

  it('uses fallback env URI when no arg passed', async () => {
    mockedMongoose.connect.mockResolvedValue({} as any);
    process.env.MONGODB_URI = 'mongodb://localhost:27017/envdb';
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await db.connectDB();
    const call = spy.mock.calls.find(c => String(c[0]).includes('db_connect_success'));
    expect(call).toBeTruthy();
    const payload = JSON.parse(String(call![0]));
    expect(payload.uri.includes('envdb')).toBe(true);
    spy.mockRestore();
  });

  it('sanitizeUri catch branch when URL constructor throws', async () => {
    mockedMongoose.connect.mockResolvedValue({} as any);
    const originalURL = URL;
    // Force constructor to throw
    // @ts-ignore
    global.URL = class BadURL {
      constructor() {
        throw new Error('boom');
      }
    } as any;
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const raw = 'not-a-valid-url-but-mongoose-accepts-maybe';
    await db.connectDB(raw);
    const call = spy.mock.calls.find(c => String(c[0]).includes('db_connect_success'));
    expect(call).toBeTruthy();
    const payload = JSON.parse(String(call![0]));
    // Since sanitizeUri failed, original string returned
    expect(payload.uri).toBe(raw);
    // restore
    global.URL = originalURL as any;
    spy.mockRestore();
  });
});
