import { ReleaseStatus } from '../types/release';
import { PREDEFINED_STEPS } from '../constants/steps';

export function computeStatus(completedSteps: string[]): ReleaseStatus {
  const totalSteps = PREDEFINED_STEPS.length;
  const count = completedSteps.length;
  if (count === 0) return 'planned';
  if (count >= totalSteps) return 'done';
  return 'ongoing';
}
