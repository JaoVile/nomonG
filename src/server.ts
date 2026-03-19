import { env } from './config/env';
import { prisma } from './lib/prisma';
import { app } from './app';

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`nomonG API running on http://${env.HOST}:${env.PORT}`);
});

const shutdown = async (signal: NodeJS.Signals) => {
  console.log(`${signal} received. Closing server...`);

  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.log('Prisma disconnected. Server stopped.');
      process.exit(0);
    } catch (error) {
      console.error('Error while disconnecting Prisma:', error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('Graceful shutdown timed out.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

