import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { adminAuthRequired, tokenExpired, forbiddenAdminRole } from '../utils/errors';
import { log } from '../utils/traceId';

interface AdminJwtPayload extends JwtPayload {
  role?: string;
}

export function authAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.header('Authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    const body = adminAuthRequired();
    log({ level: 'warn', event: 'auth_failure', reason: body.error, path: req.originalUrl || req.url, traceId: res.locals.traceId });
    return res.status(401).json(body);
  }
  const token = auth.substring('Bearer '.length).trim();
  const secret = process.env.JWT_SECRET || 'dev_secret';
  try {
    // Use ignoreExpiration so we can perform a consistent manual exp check and return our standardized error code
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'], ignoreExpiration: true }) as AdminJwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (typeof decoded.exp === 'number' && decoded.exp < now) {
      const body = tokenExpired();
      log({ level: 'warn', event: 'auth_failure', reason: body.error, path: req.originalUrl || req.url, traceId: res.locals.traceId });
      return res.status(401).json(body);
    }
    if (decoded.role !== 'admin') {
      const body = forbiddenAdminRole();
      log({ level: 'warn', event: 'auth_failure', reason: body.error, path: req.originalUrl || req.url, traceId: res.locals.traceId });
      return res.status(403).json(body);
    }
    (req as Request & { admin?: boolean }).admin = true;
    return next();
  } catch (_err) {
    const body = adminAuthRequired();
    log({ level: 'warn', event: 'auth_failure', reason: body.error, path: req.originalUrl || req.url, traceId: res.locals.traceId });
    return res.status(401).json(body);
  }
}
