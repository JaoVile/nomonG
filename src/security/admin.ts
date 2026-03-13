import type { RequestHandler } from 'express';
import { env } from '../config/env';

export const ADMIN_HEADER_NAME = 'x-admin-key';

export const requireAdminApiKey: RequestHandler = (req, res, next) => {
  const providedKey = req.header(ADMIN_HEADER_NAME);

  if (!providedKey || providedKey !== env.ADMIN_API_KEY) {
    res.status(401).json({ message: 'Unauthorized: invalid x-admin-key.' });
    return;
  }

  next();
};

