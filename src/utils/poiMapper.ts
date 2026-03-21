import type { Poi } from '@prisma/client';
import type { PoiType } from '../config/constants';

const legacyPoiImageUrlMap: Record<string, string> = {
  'fotopins/areadealimentacao.jpg': 'fotopins/Areadealimentacao.png',
  'fotopins/asces.jpeg': 'fotopins/Asces.png',
  'fotopins/barracasprefeitura.jpeg': 'fotopins/Barracasprefeitura.png',
  'fotopins/jardimdigital.jpeg': 'fotopins/Jardimdigital.png',
  'fotopins/palcoprincipal.jpeg': 'fotopins/Palcoprincipal.png',
  'fotopins/senac.jpeg': 'fotopins/Senac.png',
  'fotopins/senai.jpeg': 'fotopins/Senai.png',
  'fotopins/uninassau.jpeg': 'fotopins/Uninassau.png',
};

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

const normalizePoiImageUrl = (value?: string | null) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return undefined;
  return legacyPoiImageUrlMap[trimmedValue.toLowerCase()] ?? trimmedValue;
};

export const toMapPoiDto = (poi: Poi): MapPoiDto => ({
  id: poi.id,
  x: poi.x,
  y: poi.y,
  nome: poi.nome,
  tipo: poi.tipo as PoiType,
  descricao: poi.descricao ?? undefined,
  imagemUrl: normalizePoiImageUrl(poi.imagemUrl),
  contato: poi.contato ?? undefined,
  corDestaque: poi.corDestaque ?? undefined,
  selo: poi.selo ?? undefined,
  nodeId: poi.nodeId ?? undefined,
});

