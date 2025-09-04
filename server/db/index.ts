import { PrismaClient } from '@prisma/client';

// Create a singleton PrismaClient instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Export the PrismaClient instance
export default prisma;

// Export all helper functions
export * from './helpers';
export * from './usage';
