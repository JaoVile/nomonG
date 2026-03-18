import { Prisma } from '@prisma/client';
import { Router, type Request } from 'express';
import { z } from 'zod';
import { POI_TYPES } from '../config/constants';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { requireAdminApiKey } from '../security/admin';
import { ensureMapExists } from '../utils/maps';
import { toMapPoiDto } from '../utils/poiMapper';
import { slugify } from '../utils/slug';

const blankToUndefined = (value: unknown): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
};

const optionalText = (max: number) =>
  z.preprocess(blankToUndefined, z.string().trim().max(max).optional());

const optionalHexColor = z.preprocess(
  blankToUndefined,
  z
    .string()
    .trim()
    .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
    .optional(),
);

const poiTypeSchema = z.enum(POI_TYPES);

const createPoiSchema = z.object({
  id: optionalText(120),
  mapId: optionalText(120),
  nome: z.string().trim().min(1).max(120),
  tipo: poiTypeSchema,
  x: z.number().finite(),
  y: z.number().finite(),
  descricao: optionalText(2000),
  imagemUrl: optionalText(2048),
  contato: optionalText(255),
  corDestaque: optionalHexColor,
  selo: optionalText(24),
  nodeId: optionalText(120),
});

const updatePoiSchema = createPoiSchema
  .omit({ id: true })
  .partial()
  .refine((payload) => Object.keys(payload).length > 0, 'At least one field is required.');

const accessSchema = z.object({
  source: optionalText(120),
});

const notFound = (resource: string, id: string) => ({
  message: `${resource} "${id}" not found.`,
});

const readIdParam = (req: Request<{ id: string }>): string => req.params.id;

export const poisRouter = Router();

poisRouter.post('/', requireAdminApiKey, async (req, res, next) => {
  try {
    const payload = createPoiSchema.parse(req.body);
    const mapId = payload.mapId || env.DEFAULT_MAP_ID;

    await ensureMapExists(mapId);

    const poiId = payload.id || `${slugify(payload.nome) || 'poi'}_${Date.now()}`;

    const created = await prisma.poi.create({
      data: {
        id: poiId,
        mapId,
        nome: payload.nome,
        tipo: payload.tipo,
        x: payload.x,
        y: payload.y,
        descricao: payload.descricao,
        imagemUrl: payload.imagemUrl,
        contato: payload.contato,
        corDestaque: payload.corDestaque,
        selo: payload.selo,
        nodeId: payload.nodeId,
      },
    });

    res.status(201).json(toMapPoiDto(created));
  } catch (error) {
    next(error);
  }
});

poisRouter.patch('/:id', requireAdminApiKey, async (req: Request<{ id: string }>, res, next) => {
  try {
    const poiId = readIdParam(req);
    const payload = updatePoiSchema.parse(req.body);

    const currentPoi = await prisma.poi.findUnique({
      where: { id: poiId },
    });

    if (!currentPoi) {
      res.status(404).json(notFound('POI', poiId));
      return;
    }

    const targetMapId = payload.mapId || currentPoi.mapId;
    if (targetMapId !== currentPoi.mapId) {
      await ensureMapExists(targetMapId);
    }

    const updated = await prisma.poi.update({
      where: { id: poiId },
      data: {
        mapId: targetMapId,
        nome: payload.nome,
        tipo: payload.tipo,
        x: payload.x,
        y: payload.y,
        descricao: payload.descricao,
        imagemUrl: payload.imagemUrl,
        contato: payload.contato,
        corDestaque: payload.corDestaque,
        selo: payload.selo,
        nodeId: payload.nodeId,
      },
    });

    res.json(toMapPoiDto(updated));
  } catch (error) {
    next(error);
  }
});

poisRouter.delete('/:id', requireAdminApiKey, async (req: Request<{ id: string }>, res, next) => {
  try {
    const poiId = readIdParam(req);
    await prisma.poi.delete({ where: { id: poiId } });
    res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      res.status(404).json(notFound('POI', readIdParam(req)));
      return;
    }
    next(error);
  }
});

poisRouter.post('/:id/access', async (req: Request<{ id: string }>, res, next) => {
  try {
    const poiId = readIdParam(req);
    const { source } = accessSchema.parse(req.body || {});

    const poiExists = await prisma.poi.findUnique({
      where: { id: poiId },
      select: { id: true },
    });

    if (!poiExists) {
      res.status(404).json(notFound('POI', poiId));
      return;
    }

    await prisma.poiAccess.create({
      data: {
        poiId,
        source: source || 'front-map',
      },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
