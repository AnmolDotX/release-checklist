import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { config } from '../config/env';

let prismaInstance: PrismaClient | null = null;

function buildMariaDbConfig(databaseUrl: string) {
  try {
    const url = new URL(databaseUrl);
    const host = url.hostname;
    const port = parseInt(url.port || '3306', 10);
    const user = url.username;
    const password = decodeURIComponent(url.password);
    const database = url.pathname.replace(/^\//, '');
    const params = url.searchParams;

    // Detect SSL requirement from query params (e.g. ?ssl-mode=REQUIRED or ?sslmode=require)
    const sslMode = params.get('ssl-mode') || params.get('sslmode') || params.get('ssl');
    const useSSL =
      sslMode === 'REQUIRED' ||
      sslMode === 'require' ||
      sslMode === 'true' ||
      sslMode === '1' ||
      // Aiven uses port 24390 range — always SSL
      port !== 3306;

    return {
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 5,
      connectTimeout: 10000,
      // SSL: allow server cert (Aiven uses valid CA-signed certs)
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    };
  } catch {
    // If URL parsing fails, fall back to raw connection string
    return databaseUrl;
  }
}

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    const connConfig = buildMariaDbConfig(config.databaseUrl);
    const adapter = new PrismaMariaDb(connConfig as any);
    prismaInstance = new PrismaClient({ adapter, log: ['error'] });
  }
  return prismaInstance;
}

export async function initDb(): Promise<void> {
  try {
    const prisma = getPrisma();
    await prisma.$connect();
    console.log('Prisma DB connected successfully to MySQL/Aiven database.');
  } catch (err: any) {
    console.error('Prisma DB Connection Error:', err.message);
  }
}
