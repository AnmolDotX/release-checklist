import { getPrisma, isUsingInMemoryFallback } from '../db/prisma';

export async function getHealthCheck(req: any, res: any): Promise<void> {
  const timestamp = new Date().toISOString();
  const uptimeSeconds = Math.floor(process.uptime());

  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'healthy',
      database: isUsingInMemoryFallback ? 'fallback_store' : 'connected',
      timestamp,
      uptimeSeconds
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message || 'Database query failed',
      timestamp,
      uptimeSeconds
    });
  }
}
