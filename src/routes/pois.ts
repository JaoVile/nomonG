import { Router, type Request } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const accessSchema = z.object({
  source: z.string().trim().max(120).optional(),
});

const notFound = (resource: string, id: string) => ({
  message: `${resource} "${id}" not found.`,
});

const readIdParam = (req: Request<{ id: string }>): string => req.params.id;
const adminModeRemovedMessage = { message: 'Admin mode has been removed from this project.' };

export const poisRouter = Router();

poisRouter.post('/', (_req, res) => {
  res.status(410).json(adminModeRemovedMessage);
});

poisRouter.patch('/:id', (_req, res) => {
  res.status(410).json(adminModeRemovedMessage);
});

poisRouter.delete('/:id', (_req, res) => {
  res.status(410).json(adminModeRemovedMessage);
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
