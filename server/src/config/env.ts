import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '8000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  get databaseUrl(): string {
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || 'rootpassword';
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '3306';
    const dbName = process.env.DB_NAME || 'release_check';
    return `mysql://${user}:${encodeURIComponent(password)}@${host}:${port}/${dbName}`;
  }
};
