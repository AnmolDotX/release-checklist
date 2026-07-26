import { getPrisma } from '../db/prisma';

export async function getHealthCheck(req: any, res: any): Promise<void> {
  const timestamp = new Date().toISOString();
  const uptimeSeconds = Math.floor(process.uptime());

  // 5-second timeout limit for database connection ping
  const dbQuery = (async () => {
    const prisma = getPrisma();
    await prisma.release.findFirst();
  })();

  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Database connection ping timed out after 5 seconds')), 5000)
  );

  try {
    await Promise.race([dbQuery, timeout]);

    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      message: 'MySQL Database and API server are fully operational.',
      timestamp,
      uptimeSeconds
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message || 'Database connection timeout',
      timestamp,
      uptimeSeconds
    });
  }
}
