import { Step } from '../types/release';

export const PREDEFINED_STEPS: Step[] = [
  { id: 'step-1', name: 'All relevant GitHub pull requests have been merged' },
  { id: 'step-2', name: 'CHANGELOG.md files have been updated' },
  { id: 'step-3', name: 'All tests are passing' },
  { id: 'step-4', name: 'Releases in Github created' },
  { id: 'step-5', name: 'Deployed in demo' },
  { id: 'step-6', name: 'Tested thoroughly in demo' },
  { id: 'step-7', name: 'Deployed in production' }
];
