import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma database client.
 * 
 * LOCAL DEV: Uses SQLite (file:db/custom.db) — works out of the box
 * PRODUCTION: Set DATABASE_URL to a cloud database URL.
 *   - If DB is unavailable, the API routes return graceful empty responses.
 */
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
