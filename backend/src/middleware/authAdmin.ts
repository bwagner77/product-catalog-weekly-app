import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { adminAuthRequired, tokenExpired, forbiddenAdminRole } from '../utils/errors';

interface AdminJwtPayload extends JwtPayload {
  role?: string;
}

export function authAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json(adminAuthRequired());
  }
  const token = auth.substring('Bearer '.length).trim();
  const secret = process.env.JWT_SECRET || 'dev_secret';
  try {
    // Use ignoreExpiration so we can perform a consistent manual exp check and return our standardized error code
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'], ignoreExpiration: true }) as AdminJwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (typeof decoded.exp === 'number' && decoded.exp < now) {
      return res.status(401).json(tokenExpired());
    }
    if (decoded.role !== 'admin') {
      return res.status(403).json(forbiddenAdminRole());
    }
    (req as any).admin = true;
    return next();
  } catch (_err) {
    return res.status(401).json(adminAuthRequired());
  }
}
