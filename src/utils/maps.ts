import { env } from '../config/env';
import { prisma } from '../lib/prisma';

const DEFAULT_MAP_PIXEL_WIDTH = 1527;
const DEFAULT_MAP_PIXEL_HEIGHT = 912;
const DEFAULT_MAP_CENTER_LAT = -8.282850901745611;
const DEFAULT_MAP_CENTER_LNG = -35.965868293929084;
const DEFAULT_MAP_SPAN_LNG = 0.00092;
const defaultMapAspectRatio = DEFAULT_MAP_PIXEL_WIDTH / DEFAULT_MAP_PIXEL_HEIGHT;
const defaultMapLatRadians = (DEFAULT_MAP_CENTER_LAT * Math.PI) / 180;
const DEFAULT_MAP_SPAN_LAT = (DEFAULT_MAP_SPAN_LNG * Math.cos(defaultMapLatRadians)) / defaultMapAspectRatio;

export const ensureMapExists = async (mapId: string) =>
  prisma.map.upsert({
    where: { id: mapId },
    update: {},
    create: {
      id: mapId,
      nome: mapId === env.DEFAULT_MAP_ID ? env.DEFAULT_MAP_NAME : `Mapa ${mapId}`,
      eventName: env.DEFAULT_MAP_EVENT_NAME,
      overlayUrl: env.DEFAULT_MAP_OVERLAY_URL,
      pixelWidth: DEFAULT_MAP_PIXEL_WIDTH,
      pixelHeight: DEFAULT_MAP_PIXEL_HEIGHT,
      centerLat: DEFAULT_MAP_CENTER_LAT,
      centerLng: DEFAULT_MAP_CENTER_LNG,
      west: DEFAULT_MAP_CENTER_LNG - DEFAULT_MAP_SPAN_LNG / 2,
      east: DEFAULT_MAP_CENTER_LNG + DEFAULT_MAP_SPAN_LNG / 2,
      south: DEFAULT_MAP_CENTER_LAT - DEFAULT_MAP_SPAN_LAT / 2,
      north: DEFAULT_MAP_CENTER_LAT + DEFAULT_MAP_SPAN_LAT / 2,
    },
  });

