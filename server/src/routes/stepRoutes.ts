import { Router } from 'express';
import { getSteps } from '../controllers/stepController';

const router = Router();

router.get('/', getSteps);

export default router;
