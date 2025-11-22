import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { invalidCredentials } from '../utils/errors';

const router = Router();

interface LoginBody {
  username?: string;
  password?: string;
}

// POST /api/auth/login
router.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body as LoginBody;
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'password';
  if (username !== adminUser || password !== adminPass) {
    return res.status(401).json(invalidCredentials());
  }
  const secret = process.env.JWT_SECRET || 'dev_secret';
  const nowSeconds = Math.floor(Date.now() / 1000);
  const exp = nowSeconds + 3600; // 1h expiry
  const token = jwt.sign({ role: 'admin', iat: nowSeconds, exp }, secret, { algorithm: 'HS256' });
  return res.status(200).json({ token, expiresInSeconds: 3600 });
});

export default router;
