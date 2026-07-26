import { getPrisma, isUsingInMemoryFallback } from '../db/prisma';

export async function getHealthCheck(req: any, res: any): Promise<void> {
  const timestamp = new Date().toISOString();
  const uptimeSeconds = Math.floor(process.uptime());

  if (isUsingInMemoryFallback) {
    res.status(200).json({
      status: 'healthy',
      database: 'in_memory_fallback',
      message: 'Running in standalone in-memory fallback mode.',
      timestamp,
      uptimeSeconds
    });
    return;
  }

  const dbQuery = (async () => {
    const prisma = getPrisma();
    await prisma.release.findFirst();
  })();

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Database connection ping timed out after 3 seconds')), 3000)
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
      error: err.message || 'Database connection failure',
      timestamp,
      uptimeSeconds
    });
  }
}
