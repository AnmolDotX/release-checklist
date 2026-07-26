import { Router, Request, Response } from 'express';
import releaseRoutes from './releaseRoutes';
import stepRoutes from './stepRoutes';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sub-routes
apiRouter.use('/releases', releaseRoutes);
apiRouter.use('/steps', stepRoutes);

export default apiRouter;
