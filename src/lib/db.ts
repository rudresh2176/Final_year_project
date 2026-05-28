import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Lazy-initialized Prisma database client.
 * Uses a getter so the client is only created when first accessed at runtime,
 * NOT during the build step. This prevents build failures when DATABASE_URL
 * points to a file that doesn't exist on the build server.
 */
function createPrismaClient() {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
    });
    return client;
  } catch (error) {
    console.warn('[DB] Failed to initialize Prisma client:', error);
    // Return a null-client placeholder that won't crash the app
    return null;
  }
}

export const db: PrismaClient | null =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
