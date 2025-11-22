import request from 'supertest';
import app from '../../../src/app';

export async function getAdminToken(): Promise<string> {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ username: process.env.ADMIN_USERNAME || 'admin', password: process.env.ADMIN_PASSWORD || 'password' });
  if (res.status !== 200 || !res.body.token) {
    throw new Error(`Failed to obtain admin token: status=${res.status}`);
  }
  return res.body.token as string;
}
