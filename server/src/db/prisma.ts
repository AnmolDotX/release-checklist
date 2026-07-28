import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { config } from '../config/env';

let prismaInstance: PrismaClient | null = null;

function buildPgConfig(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = parseInt(url.port || '5432', 10);
    const user = url.username;
    const password = decodeURIComponent(url.password);
    const database = url.pathname.replace(/^\//, '');
    const params = url.searchParams;

    // Detect SSL requirement from query params (e.g. ?sslmode=require)
    const sslMode = params.get('ssl-mode') || params.get('sslmode') || params.get('ssl');
    const useSSL =
      sslMode === 'REQUIRED' ||
      sslMode === 'require' ||
      sslMode === 'true' ||
      sslMode === '1';

    return {
      host,
      port,
      user,
      password,
      database,
      max: 5, // connectionLimit for pg
      connectionTimeoutMillis: 10000,
      // SSL: allow server cert (Aiven uses valid CA-signed certs)
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    };
  } catch {
    // If URL parsing fails, return as connectionString for pg
    return { connectionString: databaseUrl };
  }
}

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    const connConfig = buildPgConfig(config.databaseUrl);
    const pool = new Pool(connConfig);
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter, log: ['error'] });
  }
  return prismaInstance;
}

export async function initDb(): Promise<void> {
  try {
    const prisma = getPrisma();
    await prisma.$connect();
    console.log('Prisma DB connected successfully to PostgreSQL database.');
  } catch (err: any) {
    console.error('Prisma DB Connection Error:', err.message);
  }
}
