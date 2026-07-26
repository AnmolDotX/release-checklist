import { Router } from 'express';
import {
  getReleases,
  getRelease,
  postRelease,
  putRelease,
  patchReleaseSteps,
  removeRelease
} from '../controllers/releaseController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/', asyncHandler(getReleases));
router.get('/:id', asyncHandler(getRelease));
router.post('/', asyncHandler(postRelease));
router.put('/:id', asyncHandler(putRelease));
router.patch('/:id/steps', asyncHandler(patchReleaseSteps));
router.delete('/:id', asyncHandler(removeRelease));

export default router;
