import { Request, Response } from 'express';
import { PREDEFINED_STEPS } from '../constants/steps';

export function getSteps(req: Request, res: Response): void {
  res.json(PREDEFINED_STEPS);
}
