var _a;
import { PrismaClient } from '@prisma/client';
// Create a singleton PrismaClient instance
const globalForPrisma = globalThis;
export const prisma = (_a = globalForPrisma.prisma) !== null && _a !== void 0 ? _a : new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
// Export the PrismaClient instance
export default prisma;
// Export all helper functions
export * from './helpers';
export * from './usage';
//# sourceMappingURL=index.js.map