import { promises as fs } from 'node:fs';
import path from 'node:path';

export type AgendaPoiLinksRecord = Record<string, string>;

const agendaPoiLinksStoragePath = path.resolve(process.cwd(), 'storage', 'agenda-poi-links.json');

export const normalizeAgendaPoiLinks = (value: unknown): AgendaPoiLinksRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter(
      ([sessionId, poiId]) => typeof sessionId === 'string' && typeof poiId === 'string' && poiId.trim().length > 0,
    ),
  );
};

export const loadAgendaPoiLinks = async (): Promise<AgendaPoiLinksRecord> => {
  try {
    const rawValue = await fs.readFile(agendaPoiLinksStoragePath, 'utf8');
    return normalizeAgendaPoiLinks(JSON.parse(rawValue));
  } catch (error) {
    if ((error as NodeJS.ErrnoException | null)?.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
};

export const saveAgendaPoiLinks = async (value: unknown): Promise<AgendaPoiLinksRecord> => {
  const normalized = normalizeAgendaPoiLinks(value);
  await fs.mkdir(path.dirname(agendaPoiLinksStoragePath), { recursive: true });
  await fs.writeFile(agendaPoiLinksStoragePath, JSON.stringify(normalized, null, 2));
  return normalized;
};
