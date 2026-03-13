import type { Poi } from '@prisma/client';
import type { PoiType } from '../config/constants';

export interface MapPoiDto {
  id: string;
  x: number;
  y: number;
  nome: string;
  tipo: PoiType;
  descricao?: string;
  imagemUrl?: string;
  contato?: string;
  corDestaque?: string;
  selo?: string;
  nodeId?: string;
}

export const toMapPoiDto = (poi: Poi): MapPoiDto => ({
  id: poi.id,
  x: poi.x,
  y: poi.y,
  nome: poi.nome,
  tipo: poi.tipo as PoiType,
  descricao: poi.descricao ?? undefined,
  imagemUrl: poi.imagemUrl ?? undefined,
  contato: poi.contato ?? undefined,
  corDestaque: poi.corDestaque ?? undefined,
  selo: poi.selo ?? undefined,
  nodeId: poi.nodeId ?? undefined,
});

