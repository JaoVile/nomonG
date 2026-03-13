import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_MAP_ID = process.env.DEFAULT_MAP_ID || 'default_map';
const DEFAULT_MAP_NAME = process.env.DEFAULT_MAP_NAME || 'Mapa Interno';
const DEFAULT_MAP_EVENT_NAME = process.env.DEFAULT_MAP_EVENT_NAME || 'GPS Interno';
const DEFAULT_MAP_OVERLAY_URL = process.env.DEFAULT_MAP_OVERLAY_URL || '/maps/mapa-visual.png';

async function main() {
  await prisma.map.upsert({
    where: { id: DEFAULT_MAP_ID },
    update: {},
    create: {
      id: DEFAULT_MAP_ID,
      nome: DEFAULT_MAP_NAME,
      eventName: DEFAULT_MAP_EVENT_NAME,
      overlayUrl: DEFAULT_MAP_OVERLAY_URL,
    },
  });

  console.log(`Map "${DEFAULT_MAP_ID}" seeded successfully.`);
}

main()
  .catch((error) => {
    console.error('Error while seeding database:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

