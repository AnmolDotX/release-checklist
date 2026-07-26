import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { config } from '../config/env';

export let isUsingInMemoryFallback = false;
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

    const count = await prisma.release.count();
    if (count === 0) {
      const initialReleases = [
        {
          name: 'Version 1.0.1',
          due_date: new Date('2022-09-20'),
          additional_info: 'Initial production release patch with critical bugfixes.',
          completed_steps: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6', 'step-7']
        },
        {
          name: 'Version 1.0.2',
          due_date: new Date('2022-09-28'),
          additional_info: 'Maintenance update and security patches.',
          completed_steps: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6', 'step-7']
        },
        {
          name: 'Version 1.1.0',
          due_date: new Date('2022-10-10'),
          additional_info: 'New dashboard features and improved reporting UI.',
          completed_steps: ['step-1', 'step-2', 'step-3', 'step-4']
        },
        {
          name: 'Version 2 (beta)',
          due_date: new Date('2022-11-01'),
          additional_info: 'Major framework upgrade and API refactoring.',
          completed_steps: []
        }
      ];

      for (const rel of initialReleases) {
        await prisma.release.create({ data: rel });
      }
    }
    console.log('Prisma 7 DB connected and initialized successfully with MariaDB/MySQL Driver Adapter.');
  } catch (err: any) {
    console.warn('Prisma DB Connection Warning:', err.message);
    console.warn('Falling back to memory store for standalone testing or disconnected environment.');
    isUsingInMemoryFallback = true;
  }
}
