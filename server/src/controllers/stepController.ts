import { PREDEFINED_STEPS } from '../constants/steps';

export function getSteps(req: any, res: any): void {
  res.json(PREDEFINED_STEPS);
}
