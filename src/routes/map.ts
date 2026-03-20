import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { requireAdminApiKey } from '../security/admin';
import { loadAgendaPoiLinks, saveAgendaPoiLinks } from '../utils/agendaPoiLinks';
import { toMapPoiDto } from '../utils/poiMapper';
import { queryBoolean, queryString } from '../utils/query';
import { ensureMapExists } from '../utils/maps';

export const mapRouter = Router();

const agendaPoiLinksSchema = z.object({
  links: z.record(z.string().trim().min(1), z.string().trim().min(1)),
});

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

  try {
    const map = await ensureMapExists(mapId);

    const pois = await prisma.poi.findMany({
      where: { mapId: map.id, isActive: true },
      orderBy: [{ createdAt: 'asc' }],
    });
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

mapRouter.put('/agenda-links', requireAdminApiKey, async (req, res, next) => {
  try {
    const payload = agendaPoiLinksSchema.parse(req.body);
    const links = await saveAgendaPoiLinks(payload.links);
    res.json({ links });
  } catch (error) {
    next(error);
  }
});

