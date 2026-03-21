import 'dotenv/config';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { PrismaClient, type PoiType } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_MAP_ID = process.env.DEFAULT_MAP_ID || 'default_map';
const DEFAULT_MAP_NAME = process.env.DEFAULT_MAP_NAME || 'Mapa Interno';
const DEFAULT_MAP_EVENT_NAME = process.env.DEFAULT_MAP_EVENT_NAME || 'GNOSTART';
const DEFAULT_MAP_OVERLAY_URL = process.env.DEFAULT_MAP_OVERLAY_URL || '/maps/mapa_geral.svg';
const DEFAULT_MAP_PIXEL_WIDTH = 1527;
const DEFAULT_MAP_PIXEL_HEIGHT = 912;
const DEFAULT_MAP_CENTER_LAT = -8.282803001403982;
const DEFAULT_MAP_CENTER_LNG = -35.9658650714576;
const DEFAULT_MAP_SPAN_LNG = 0.00092;
const defaultMapAspectRatio = DEFAULT_MAP_PIXEL_WIDTH / DEFAULT_MAP_PIXEL_HEIGHT;
const defaultMapLatRadians = (DEFAULT_MAP_CENTER_LAT * Math.PI) / 180;
const DEFAULT_MAP_SPAN_LAT = (DEFAULT_MAP_SPAN_LNG * Math.cos(defaultMapLatRadians)) / defaultMapAspectRatio;
const AGENDA_POI_LINKS_STORAGE_PATH = path.resolve(process.cwd(), 'storage', 'agenda-poi-links.json');
// Fonte canonica compartilhada com o frontend. Os 20 pins devem ser mantidos aqui.
const FRONTEND_POI_SEED_PATH = path.resolve(process.cwd(), '..', 'gnostart', 'src', 'data', 'locaisEventoSocialSeed.json');
const EXPECTED_CANONICAL_POI_COUNT = 20;

type SeedPoi = {
  id: string;
  nome: string;
  tipo: PoiType;
  x: number;
  y: number;
  descricao?: string;
  imagemUrl?: string;
  corDestaque?: string;
  selo?: string;
  nodeId?: string | null;
};

const VALID_POI_TYPES = new Set<PoiType>(['atividade', 'servico', 'banheiro', 'entrada']);

const sanitizeRequiredString = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const sanitizeOptionalString = (value: unknown) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const sanitizeCoordinate = (value: unknown) => {
  const numericValue = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numericValue) ? Math.round(numericValue) : null;
};

const sanitizePoiType = (value: unknown): PoiType | null => {
  if (typeof value !== 'string') return null;
  return VALID_POI_TYPES.has(value as PoiType) ? (value as PoiType) : null;
};

const sanitizeSeedPoi = (value: unknown): SeedPoi | null => {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Record<string, unknown>;
  const id = sanitizeRequiredString(candidate.id);
  const nome = sanitizeRequiredString(candidate.nome);
  const tipo = sanitizePoiType(candidate.tipo);
  const x = sanitizeCoordinate(candidate.x);
  const y = sanitizeCoordinate(candidate.y);

  if (!id || !nome || !tipo || x == null || y == null) {
    return null;
  }

  return {
    id,
    nome,
    tipo,
    x,
    y,
    descricao: sanitizeOptionalString(candidate.descricao),
    imagemUrl: sanitizeOptionalString(candidate.imagemUrl),
    corDestaque: sanitizeOptionalString(candidate.corDestaque),
    selo: sanitizeOptionalString(candidate.selo),
    nodeId: sanitizeOptionalString(candidate.nodeId) ?? null,
  };
};

const loadCanonicalPoisSeed = async () => {
  try {
    const fileContent = await fs.readFile(FRONTEND_POI_SEED_PATH, 'utf8');
    const parsed = JSON.parse(fileContent) as unknown;

    if (!Array.isArray(parsed)) {
      console.warn(`Seed canonico invalido em ${FRONTEND_POI_SEED_PATH}. A lista de POIs sera tratada como vazia.`);
      return [] as SeedPoi[];
    }

    return parsed
      .map(sanitizeSeedPoi)
      .filter((poi): poi is SeedPoi => Boolean(poi));
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      console.warn(`Seed canonico nao encontrado em ${FRONTEND_POI_SEED_PATH}. A lista de POIs sera tratada como vazia.`);
      return [] as SeedPoi[];
    }

    throw error;
  }
};

const validateCanonicalPoisSeed = (pois: SeedPoi[]) => {
  if (pois.length !== EXPECTED_CANONICAL_POI_COUNT) {
    throw new Error(
      [
        `Seed canonico inesperado em ${FRONTEND_POI_SEED_PATH}.`,
        `Esperado: ${EXPECTED_CANONICAL_POI_COUNT} pins.`,
        `Encontrado: ${pois.length}.`,
      ].join(' '),
    );
  }

  const uniqueIds = new Set<string>();
  for (const poi of pois) {
    if (uniqueIds.has(poi.id)) {
      throw new Error(`Seed canonico invalido: id duplicado detectado (${poi.id}).`);
    }
    uniqueIds.add(poi.id);
  }
};

async function main() {
  const canonicalPois = await loadCanonicalPoisSeed();
  validateCanonicalPoisSeed(canonicalPois);

  const map = await prisma.map.upsert({
    where: { id: DEFAULT_MAP_ID },
    update: {
      nome: DEFAULT_MAP_NAME,
      eventName: DEFAULT_MAP_EVENT_NAME,
      overlayUrl: DEFAULT_MAP_OVERLAY_URL,
      pixelWidth: DEFAULT_MAP_PIXEL_WIDTH,
      pixelHeight: DEFAULT_MAP_PIXEL_HEIGHT,
      centerLat: DEFAULT_MAP_CENTER_LAT,
      centerLng: DEFAULT_MAP_CENTER_LNG,
      west: DEFAULT_MAP_CENTER_LNG - DEFAULT_MAP_SPAN_LNG / 2,
      east: DEFAULT_MAP_CENTER_LNG + DEFAULT_MAP_SPAN_LNG / 2,
      south: DEFAULT_MAP_CENTER_LAT - DEFAULT_MAP_SPAN_LAT / 2,
      north: DEFAULT_MAP_CENTER_LAT + DEFAULT_MAP_SPAN_LAT / 2,
    },
    create: {
      id: DEFAULT_MAP_ID,
      nome: DEFAULT_MAP_NAME,
      eventName: DEFAULT_MAP_EVENT_NAME,
      overlayUrl: DEFAULT_MAP_OVERLAY_URL,
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

  const canonicalPoiIds = canonicalPois.map((poi) => poi.id);

  await prisma.poi.deleteMany({
    where:
      canonicalPoiIds.length > 0
        ? {
            mapId: map.id,
            id: {
              notIn: canonicalPoiIds,
            },
          }
        : {
            mapId: map.id,
          },
  });

  for (const poi of canonicalPois) {
    await prisma.poi.upsert({
      where: { id: poi.id },
      update: {
        mapId: map.id,
        nome: poi.nome,
        tipo: poi.tipo,
        x: poi.x,
        y: poi.y,
        descricao: poi.descricao ?? null,
        imagemUrl: poi.imagemUrl ?? null,
        corDestaque: poi.corDestaque ?? null,
        selo: poi.selo ?? null,
        nodeId: poi.nodeId ?? null,
        isActive: true,
      },
      create: {
        id: poi.id,
        mapId: map.id,
        nome: poi.nome,
        tipo: poi.tipo,
        x: poi.x,
        y: poi.y,
        descricao: poi.descricao ?? null,
        imagemUrl: poi.imagemUrl ?? null,
        corDestaque: poi.corDestaque ?? null,
        selo: poi.selo ?? null,
        nodeId: poi.nodeId ?? null,
        isActive: true,
      },
    });
  }

  await fs.mkdir(path.dirname(AGENDA_POI_LINKS_STORAGE_PATH), { recursive: true });
  await fs.writeFile(AGENDA_POI_LINKS_STORAGE_PATH, JSON.stringify({}, null, 2));

  console.log(
    `Map "${DEFAULT_MAP_ID}" synced with ${canonicalPois.length} canonical POIs from ${path.basename(FRONTEND_POI_SEED_PATH)}.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
