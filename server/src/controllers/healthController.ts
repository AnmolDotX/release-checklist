import { getPrisma } from '../db/prisma';

export async function getHealthCheck(req: any, res: any): Promise<void> {
  const timestamp = new Date().toISOString();
  const uptimeSeconds = Math.floor(process.uptime());

  // 3-second timeout limit so the endpoint never hangs waiting for TCP sockets
  const dbQuery = (async () => {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
  })();

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Database ping timed out after 3 seconds')), 3000)
  );

  try {
    await Promise.race([dbQuery, timeout]);

    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      message: 'System and database are fully operational.',
      timestamp,
      uptimeSeconds
    });
  } catch (err: any) {
    res.status(200).json({
      status: 'degraded',
      database: 'disconnected',
      error: err.message || 'Database connection timeout',
      timestamp,
      uptimeSeconds
    });
  }
}
