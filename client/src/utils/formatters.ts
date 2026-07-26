import { ReleaseStatus } from '../types/release';

export const DEFAULT_TOTAL_STEPS = 7;

export function computeStatus(completedSteps: string[] = [], totalSteps: number = DEFAULT_TOTAL_STEPS): ReleaseStatus {
  if (completedSteps.length === 0) return 'planned';
  if (completedSteps.length >= totalSteps) return 'done';
  return 'ongoing';
}

export function formatDateDisplay(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
}

export function formatDateInput(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}
