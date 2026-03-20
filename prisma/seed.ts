import 'dotenv/config';
import { PrismaClient, type PoiType } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_MAP_ID = process.env.DEFAULT_MAP_ID || 'default_map';
const DEFAULT_MAP_NAME = process.env.DEFAULT_MAP_NAME || 'Mapa Interno';
const DEFAULT_MAP_EVENT_NAME = process.env.DEFAULT_MAP_EVENT_NAME || 'GPS Interno';
const DEFAULT_MAP_OVERLAY_URL = process.env.DEFAULT_MAP_OVERLAY_URL || '/maps/mapa_oficial.svg';
const DEFAULT_MAP_PIXEL_WIDTH = 1527;
const DEFAULT_MAP_PIXEL_HEIGHT = 912;
const DEFAULT_MAP_CENTER_LAT = -8.282803001403982;
const DEFAULT_MAP_CENTER_LNG = -35.9658650714576;
const DEFAULT_MAP_SPAN_LNG = 0.00092;
const defaultMapAspectRatio = DEFAULT_MAP_PIXEL_WIDTH / DEFAULT_MAP_PIXEL_HEIGHT;
const defaultMapLatRadians = (DEFAULT_MAP_CENTER_LAT * Math.PI) / 180;
const DEFAULT_MAP_SPAN_LAT = (DEFAULT_MAP_SPAN_LNG * Math.cos(defaultMapLatRadians)) / defaultMapAspectRatio;

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

const DEFAULT_POIS: SeedPoi[] = [
  {
    id: 'entrada_principal',
    nome: 'Entrada Principal',
    tipo: 'entrada',
    x: 747,
    y: 399,
    descricao: 'Acesso principal do evento para o publico.',
    imagemUrl: '/images/pois/indicadores/entrada.svg',
    corDestaque: '#92b98c',
    selo: 'ENT',
  },
  {
    id: 'credenciamento',
    nome: 'Credenciamento',
    tipo: 'servico',
    x: 777,
    y: 399,
    descricao: 'Retirada de pulseiras, orientacoes e apoio inicial.',
    imagemUrl: '/images/pois/indicadores/apoio.svg',
    corDestaque: '#8aaed8',
    selo: 'CRD',
  },
  {
    id: 'entrada_caravanas',
    nome: 'Entrada Caravanas',
    tipo: 'entrada',
    x: 713,
    y: 328,
    descricao: 'Acesso reservado para grupos e caravanas.',
    imagemUrl: '/images/pois/indicadores/entrada.svg',
    corDestaque: '#a4c49b',
    selo: 'CAR',
  },
  {
    id: 'palco_principal',
    nome: 'Palco Principal',
    tipo: 'atividade',
    x: 784,
    y: 342,
    descricao: 'Area central das palestras e conteudos principais.',
    imagemUrl: '/images/pois/indicadores/evento.svg',
    corDestaque: '#d7bf78',
    selo: 'PAL',
  },
  {
    id: 'banheiros',
    nome: 'Banheiros',
    tipo: 'banheiro',
    x: 764,
    y: 313,
    descricao: 'Conjunto de banheiros de apoio ao publico.',
    imagemUrl: '/images/pois/indicadores/banheiro.svg',
    corDestaque: '#9bb8df',
    selo: 'WC',
  },
  {
    id: 'estande_realidade_virtual',
    nome: 'Estande Realidade Virtual',
    tipo: 'atividade',
    x: 733,
    y: 330,
    descricao: 'Espaco de demonstracao e experiencia imersiva.',
    imagemUrl: '/images/pois/indicadores/evento.svg',
    corDestaque: '#9a8bd9',
    selo: 'ERV',
  },
  {
    id: 'espaco_instagramavel',
    nome: 'Espaco Instagramavel',
    tipo: 'atividade',
    x: 745,
    y: 326,
    descricao: 'Cenario visual para fotos e conteudo do evento.',
    imagemUrl: '/images/pois/indicadores/evento.svg',
    corDestaque: '#8f9ddd',
    selo: 'IGR',
  },
  {
    id: 'area_startups',
    nome: 'Area das Startups',
    tipo: 'atividade',
    x: 797,
    y: 393,
    descricao: 'Espaco com as startups participantes do Startup Day.',
    imagemUrl: '/images/pois/indicadores/evento.svg',
    corDestaque: '#8576c9',
    selo: 'STP',
  },
  {
    id: 'barracas_prefeitura',
    nome: 'Barracas Prefeitura',
    tipo: 'servico',
    x: 721,
    y: 383,
    descricao: 'Area institucional com os espacos da prefeitura.',
    imagemUrl: '/images/pois/indicadores/apoio.svg',
    corDestaque: '#8f98aa',
    selo: 'PREF',
  },
  {
    id: 'jardim_digital',
    nome: 'Jardim Digital',
    tipo: 'servico',
    x: 733,
    y: 385,
    descricao: 'Espaco parceiro voltado a tecnologia e inovacao.',
    imagemUrl: '/images/pois/indicadores/apoio.svg',
    corDestaque: '#7fb4ad',
    selo: 'JD',
  },
  {
    id: 'arena_experiencia',
    nome: 'Arena Experiencia',
    tipo: 'atividade',
    x: 700,
    y: 371,
    descricao: 'Area continua com os espacos dos parceiros e ativacoes abertas ao publico ao longo do dia.',
    imagemUrl: '/images/pois/indicadores/evento.svg',
    corDestaque: '#9a8bd9',
    selo: 'ARE',
  },
  {
    id: 'laboratorio_game',
    nome: 'Laboratório Game',
    tipo: 'atividade',
    x: 742,
    y: 338,
    descricao: 'Espaco das oficinas GameLab na Arena Porto Digital.',
    imagemUrl: '/images/pois/indicadores/evento.svg',
    corDestaque: '#9a8bd9',
    selo: 'GLB',
  },
  {
    id: 'sala_economia_criativa_01',
    nome: 'Sala de Economia Criativa 01',
    tipo: 'servico',
    x: 665,
    y: 341,
    descricao: 'Sala reservada para hotseats e encontros do ecossistema.',
    imagemUrl: '/images/pois/indicadores/apoio.svg',
    corDestaque: '#8aaed8',
    selo: 'EC1',
  },
  {
    id: 'sala_economia_criativa_02',
    nome: 'Sala de Economia Criativa 02',
    tipo: 'servico',
    x: 665,
    y: 367,
    descricao: 'Sala reservada para hotseats e encontros do ecossistema.',
    imagemUrl: '/images/pois/indicadores/apoio.svg',
    corDestaque: '#7698c8',
    selo: 'EC2',
  },
  {
    id: 'armazem_da_criatividade_1773977448618',
    nome: 'Armazem da Criatividade',
    tipo: 'entrada',
    x: 813,
    y: 376,
    descricao: 'Acesso lateral para o Laboratorio Game e para as salas de Economia Criativa 01 e 02.',
    imagemUrl: '/images/pois/indicadores/entrada.svg',
    corDestaque: '#92b98c',
    selo: 'ARM',
  },
  {
    id: 'senac',
    nome: 'SENAC',
    tipo: 'servico',
    x: 688,
    y: 331,
    descricao: 'Espaco da instituicao parceira SENAC.',
    imagemUrl: '/images/pois/indicadores/apoio.svg',
    corDestaque: '#8aaed8',
    selo: 'SNC',
  },
  {
    id: 'senai',
    nome: 'SENAI',
    tipo: 'servico',
    x: 680,
    y: 374,
    descricao: 'Espaco da instituicao parceira SENAI.',
    imagemUrl: '/images/pois/indicadores/apoio.svg',
    corDestaque: '#7698c8',
    selo: 'SNI',
  },
  {
    id: 'asces',
    nome: 'ASCES',
    tipo: 'servico',
    x: 680,
    y: 341,
    descricao: 'Espaco da instituicao parceira ASCES.',
    imagemUrl: '/images/pois/indicadores/apoio.svg',
    corDestaque: '#a7afbc',
    selo: 'ASC',
  },
  {
    id: 'nassau',
    nome: 'UNINASSAU',
    tipo: 'servico',
    x: 698,
    y: 393,
    descricao: 'Espaco da instituicao parceira UNINASSAU.',
    imagemUrl: '/images/pois/indicadores/apoio.svg',
    corDestaque: '#ccb36f',
    selo: 'NAS',
  },
  {
    id: 'credenciamento_caravanas',
    nome: 'Credenciamento Caravanas',
    tipo: 'servico',
    x: 714,
    y: 341,
    descricao: 'Atendimento e credenciamento dedicados aos grupos e caravanas.',
    imagemUrl: '/images/pois/indicadores/apoio.svg',
    corDestaque: '#7fb4ad',
    selo: 'CCV',
  },
  {
    id: 'cafeteria_1773957701772',
    nome: 'CAFETERIA',
    tipo: 'servico',
    x: 809,
    y: 392,
    imagemUrl: '/images/pois/indicadores/evento.svg',
  },
];
const REMOVED_POI_IDS: string[] = [];

async function main() {
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

  await prisma.poi.deleteMany({
    where: {
      mapId: map.id,
      id: {
        in: REMOVED_POI_IDS,
      },
    },
  });

  for (const poi of DEFAULT_POIS) {
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

  await prisma.poi.updateMany({
    where: {
      mapId: map.id,
      id: {
        in: ['banheiro_masculino', 'banheiro_feminino'],
      },
    },
    data: {
      isActive: false,
    },
  });

  console.log(`Map "${DEFAULT_MAP_ID}" and ${DEFAULT_POIS.length} POIs seeded successfully.`);
}

main()
  .catch((error) => {
    console.error('Error while seeding database:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
