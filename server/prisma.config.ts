import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

dotenv.config();

// Append SSL params to DATABASE_URL if the port is non-standard (Aiven uses custom ports)
function getDatasourceUrl(): string {
  const url = process.env.DATABASE_URL || 'mysql://root:rootpassword@localhost:3306/release_check';
  try {
    const parsed = new URL(url);
    const port = parseInt(parsed.port || '3306', 10);
    // Aiven MySQL runs on non-3306 ports and requires SSL
    if (port !== 3306 && !parsed.searchParams.has('ssl-mode') && !parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('ssl-mode', 'REQUIRED');
      return parsed.toString();
    }
  } catch {
    // ignore parse errors
  }
  return url;
}

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: getDatasourceUrl(),
  },
});
