import { Router } from 'express';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { loadAgendaPoiLinks } from '../utils/agendaPoiLinks';
import { toMapPoiDto } from '../utils/poiMapper';
import { queryBoolean, queryString } from '../utils/query';
import { ensureMapExists } from '../utils/maps';

export const mapRouter = Router();

const adminModeRemovedMessage = { message: 'Admin mode has been removed from this project.' };

const buildBootstrapFallbackResponse = (mapId: string, includeGraph: boolean) => {
  const response: {
    map: {
      id: string;
      nome: string;
      eventName: string;
      overlayUrl: string;
    };
    pois: ReturnType<typeof toMapPoiDto>[];
    agendaPoiLinks: Record<string, string>;
    graph?: null;
  } = {
    map: {
      id: mapId,
      nome: mapId === env.DEFAULT_MAP_ID ? env.DEFAULT_MAP_NAME : `Mapa ${mapId}`,
      eventName: env.DEFAULT_MAP_EVENT_NAME,
      overlayUrl: env.DEFAULT_MAP_OVERLAY_URL,
    },
    pois: [],
    agendaPoiLinks: {},
  };

  if (includeGraph) {
    response.graph = null;
  }

  return response;
};

mapRouter.get('/bootstrap', async (req, res, next) => {
  const mapId = queryString(req.query.mapId, env.DEFAULT_MAP_ID);
  const includeGraph = queryBoolean(req.query.includeGraph, false);
  const includePois = queryBoolean(req.query.includePois, false);

  try {
    const map = await ensureMapExists(mapId);

    const pois = includePois
      ? await prisma.poi.findMany({
          where: { mapId: map.id, isActive: true },
          orderBy: [{ createdAt: 'asc' }],
        })
      : [];
    const agendaPoiLinks = await loadAgendaPoiLinks();

    const response: {
      map: {
        id: string;
        nome: string;
        eventName: string;
        overlayUrl: string;
      };
      pois: ReturnType<typeof toMapPoiDto>[];
      agendaPoiLinks: Record<string, string>;
      graph?: null;
    } = {
      map: {
        id: map.id,
        nome: map.nome,
        eventName: map.eventName,
        overlayUrl: map.overlayUrl,
      },
      pois: pois.map(toMapPoiDto),
      agendaPoiLinks,
    };

    if (includeGraph) {
      response.graph = null;
    }

    res.json(response);
  } catch (error) {
    console.warn(`Falha ao montar bootstrap do mapa para ${mapId}. Respondendo com fallback seguro.`, error);
    res.json(buildBootstrapFallbackResponse(mapId, includeGraph));
  }
});

mapRouter.get('/agenda-links', async (_req, res, next) => {
  try {
    const links = await loadAgendaPoiLinks();
    res.json({ links });
  } catch (error) {
    next(error);
  }
});

mapRouter.put('/agenda-links', (_req, res) => {
  res.status(410).json(adminModeRemovedMessage);
});
