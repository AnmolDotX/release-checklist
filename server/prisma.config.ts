import { defineConfig } from '@prisma/config';
import dotenv from 'dotenv';

dotenv.config();

function getDatasourceUrl(): string {
  const url = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5434/release_check';
  return url;
}

export default defineConfig({
  datasource: {
    url: getDatasourceUrl(),
  },
});
