import { env } from '../config/env';
import { prisma } from '../lib/prisma';

export const ensureMapExists = async (mapId: string) =>
  prisma.map.upsert({
    where: { id: mapId },
    update: {},
    create: {
      id: mapId,
      nome: mapId === env.DEFAULT_MAP_ID ? env.DEFAULT_MAP_NAME : `Mapa ${mapId}`,
      eventName: env.DEFAULT_MAP_EVENT_NAME,
      overlayUrl: env.DEFAULT_MAP_OVERLAY_URL,
    },
  });

