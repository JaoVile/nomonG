import { Prisma } from '@prisma/client';
import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { ZodError } from 'zod';
import { env } from './config/env';
import { healthRouter } from './routes/health';
import { locationRouter } from './routes/location';
import { mapRouter } from './routes/map';
import { poisRouter } from './routes/pois';

const parseAllowedOrigins = (rawValue: string): string[] | '*' => {
  const normalized = rawValue.trim();
  if (normalized === '*') return '*';
  return normalized
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins(env.CORS_ORIGIN);

export const app = express();

app.disable('x-powered-by');
app.use(
  cors({
    origin(origin, callback) {
      if (allowedOrigins === '*' || !origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (_req, res) => {
  res.json({
    service: 'nomonG API',
    version: '1.0.0',
  });
});

app.use('/health', healthRouter);
app.use('/api/v1/health', healthRouter);
app.use('/api/v1/location', locationRouter);
app.use('/api/v1/map', mapRouter);
app.use('/api/v1/pois', poisRouter);

app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Invalid request payload.',
      issues: error.issues,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      res.status(409).json({ message: 'Resource already exists.' });
      return;
    }

    if (error.code === 'P2025') {
      res.status(404).json({ message: 'Resource not found.' });
      return;
    }
  }

  if (error instanceof Error && error.message.startsWith('CORS blocked for origin:')) {
    res.status(403).json({ message: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ message: 'Internal server error.' });
};

app.use(errorHandler);

