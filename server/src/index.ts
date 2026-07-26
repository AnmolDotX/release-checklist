import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import { initDb } from './db/prisma';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// Initialize Prisma database
initDb().catch(err => {
  console.error('Database initialization error:', err);
});

// Mount API Routes
app.use('/api', apiRouter);

// Global Error Handler
app.use(errorHandler);

// Start standalone server if not invoked by Vercel serverless loader or test runner
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

export default app;
