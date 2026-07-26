import { Router } from 'express';
import releaseRoutes from './releaseRoutes';
import stepRoutes from './stepRoutes';
import { getHealthCheck } from '../controllers/healthController';
import { asyncHandler } from '../middleware/errorHandler';

const apiRouter = Router();

// Health & System Uptime Check Endpoint
apiRouter.get('/health', asyncHandler(getHealthCheck));

// Sub-routes
apiRouter.use('/releases', releaseRoutes);
apiRouter.use('/steps', stepRoutes);

export default apiRouter;
