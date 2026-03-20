import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { buildLocationContext } from '../services/googleMaps';

const optionalDestinationSchema = z
  .object({
    lat: z.number().finite(),
    lng: z.number().finite(),
    label: z.string().trim().min(1).max(160).optional(),
    placeId: z.string().trim().min(1).max(255).optional(),
  })
  .optional();

const locationContextSchema = z.object({
  lat: z.number().finite(),
  lng: z.number().finite(),
  accuracyMeters: z.number().finite().nonnegative().optional(),
  destination: optionalDestinationSchema,
});

export const locationRouter = Router();

locationRouter.post('/context', async (req, res, next) => {
  try {
    const payload = locationContextSchema.parse(req.body);
    const context = await buildLocationContext(payload);
    res.json(context);
  } catch (error) {
    const parsedPayload = locationContextSchema.safeParse(req.body);
    if (!parsedPayload.success) {
      next(error);
      return;
    }

    console.warn('Falha ao montar contexto externo de localizacao. Respondendo com fallback seguro.', error);
    res.json({
      provider: {
        googleConfigured: Boolean(env.GOOGLE_MAPS_API_KEY),
        googleUsed: false,
      },
      reverseGeocode: null,
      venue: null,
      externalRoute: null,
      warnings: [
        error instanceof Error
          ? error.message
          : 'A validacao externa da localizacao ficou indisponivel temporariamente.',
      ],
    });
  }
});
