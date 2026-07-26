import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { config } from '../config/env';

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    try {
      const adapter = new PrismaMariaDb(config.databaseUrl);
      prismaInstance = new PrismaClient({ adapter });
    } catch {
      prismaInstance = new PrismaClient();
    }
  }
  return prismaInstance;
}

export async function initDb(): Promise<void> {
  try {
    const prisma = getPrisma();
    await prisma.$connect();
    console.log('Prisma 7 DB connected successfully with MySQL/MariaDB Driver Adapter.');
  } catch (err: any) {
    console.error('Prisma DB Connection Error:', err.message);
  }
}
