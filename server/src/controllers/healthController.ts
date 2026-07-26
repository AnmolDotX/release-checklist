import { getPrisma } from '../db/prisma';

export async function getHealthCheck(req: any, res: any): Promise<void> {
  const timestamp = new Date().toISOString();
  const uptimeSeconds = Math.floor(process.uptime());

  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;

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
      message: 'Free tier database may be spinning up from inactivity. Please retry in 10-15 seconds.',
      error: err.message || 'Database connection timeout',
      timestamp,
      uptimeSeconds
    });
  }
}
