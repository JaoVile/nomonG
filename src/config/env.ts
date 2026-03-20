import { config } from 'dotenv';
import { z } from 'zod';

config({ quiet: true });

const blankToUndefined = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().trim().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  ADMIN_API_KEY: z.string().min(1, 'ADMIN_API_KEY is required'),
  CORS_ORIGIN: z.string().default('*'),
  DEFAULT_MAP_ID: z.string().trim().min(1).default('default_map'),
  DEFAULT_MAP_NAME: z.string().trim().min(1).default('Mapa Interno'),
  DEFAULT_MAP_EVENT_NAME: z.string().trim().min(1).default('GPS Interno'),
  DEFAULT_MAP_OVERLAY_URL: z.string().trim().min(1).default('/maps/mapa_oficial.svg'),
  GOOGLE_MAPS_API_KEY: z.preprocess(blankToUndefined, z.string().trim().min(1).optional()),
  GOOGLE_EVENT_PLACE_ID: z.preprocess(blankToUndefined, z.string().trim().min(1).optional()),
  GOOGLE_EVENT_LABEL: z.preprocess(blankToUndefined, z.string().trim().min(1).optional()),
  GOOGLE_EVENT_LAT: z.preprocess(blankToUndefined, z.coerce.number().finite().optional()),
  GOOGLE_EVENT_LNG: z.preprocess(blankToUndefined, z.coerce.number().finite().optional()),
  GOOGLE_EVENT_RADIUS_METERS: z.coerce.number().positive().default(180),
  GOOGLE_RESPONSE_LANGUAGE: z.string().trim().min(2).default('pt-BR'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

