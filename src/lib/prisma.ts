let PrismaClientClass: any = null;
try {
  // @ts-ignore
  const prismaModule = typeof window === 'undefined' ? require('@prisma/client') : null;
  if (prismaModule) {
    PrismaClientClass = prismaModule.PrismaClient;
  }
} catch {
  // Safe fallback if @prisma/client is missing or bundling in browser
}

const globalForPrisma = globalThis as unknown as { prisma: any };

const prismaClient = (PrismaClientClass && process.env.DATABASE_URL)
  ? new PrismaClientClass({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
  : null;

export const prisma = globalForPrisma.prisma || prismaClient;

if (process.env.NODE_ENV !== 'production' && prisma) globalForPrisma.prisma = prisma;
