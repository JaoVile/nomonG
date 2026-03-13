import { Router } from 'express';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { toMapPoiDto } from '../utils/poiMapper';
import { queryBoolean, queryString } from '../utils/query';
import { ensureMapExists } from '../utils/maps';

export const mapRouter = Router();

mapRouter.get('/bootstrap', async (req, res, next) => {
  try {
    const mapId = queryString(req.query.mapId, env.DEFAULT_MAP_ID);
    const includeGraph = queryBoolean(req.query.includeGraph, false);

    const map = await ensureMapExists(mapId);

    const pois = await prisma.poi.findMany({
      where: { mapId: map.id },
      orderBy: [{ createdAt: 'asc' }],
    });

    const response: {
      map: {
        id: string;
        nome: string;
        eventName: string;
        overlayUrl: string;
      };
      pois: ReturnType<typeof toMapPoiDto>[];
      graph?: null;
    } = {
      map: {
        id: map.id,
        nome: map.nome,
        eventName: map.eventName,
        overlayUrl: map.overlayUrl,
      },
      pois: pois.map(toMapPoiDto),
    };

    if (includeGraph) {
      response.graph = null;
    }

    res.json(response);
  } catch (error) {
    next(error);
  }
});

