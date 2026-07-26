import { Release, Step, CreateReleaseInput, UpdateReleaseInput } from '../types/release';
import { computeStatus } from '../utils/formatters';

function getApiBaseUrl(): string {
  let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  rawUrl = rawUrl.trim().replace(/\/+$/, '');
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }
  return rawUrl;
}

const API_BASE = getApiBaseUrl();

const DEFAULT_STEPS: Step[] = [
  { id: 'step-1', name: 'All relevant GitHub pull requests have been merged' },
  { id: 'step-2', name: 'CHANGELOG.md files have been updated' },
  { id: 'step-3', name: 'All tests are passing' },
  { id: 'step-4', name: 'Releases in Github created' },
  { id: 'step-5', name: 'Deployed in demo' },
  { id: 'step-6', name: 'Tested thoroughly in demo' },
  { id: 'step-7', name: 'Deployed in production' }
];

let localReleasesStore: Release[] = [
  {
    id: 1,
    name: 'Version 1.0.1',
    due_date: '2022-09-20',
    status: 'done',
    additional_info: 'Initial production release patch with critical bugfixes.',
    completed_steps: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6', 'step-7']
  },
  {
    id: 2,
    name: 'Version 1.0.2',
    due_date: '2022-09-28',
    status: 'done',
    additional_info: 'Maintenance update and security patches.',
    completed_steps: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6', 'step-7']
  },
  {
    id: 3,
    name: 'Version 1.1.0',
    due_date: '2022-10-10',
    status: 'ongoing',
    additional_info: 'New dashboard features and improved reporting UI.',
    completed_steps: ['step-1', 'step-2', 'step-3', 'step-4']
  },
  {
    id: 4,
    name: 'Version 2 (beta)',
    due_date: '2022-11-01',
    status: 'planned',
    additional_info: 'Major framework upgrade and API refactoring.',
    completed_steps: []
  }
];

export async function fetchStepsApi(): Promise<Step[]> {
  try {
    const res = await fetch(`${API_BASE}/steps`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API offline fallback
  }
  return DEFAULT_STEPS;
}

export async function fetchReleasesApi(): Promise<Release[]> {
  try {
    const res = await fetch(`${API_BASE}/releases`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API offline fallback
  }
  return localReleasesStore;
}

export async function fetchReleaseByIdApi(id: number): Promise<Release | null> {
  try {
    const res = await fetch(`${API_BASE}/releases/${id}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // API offline fallback
  }
  return localReleasesStore.find(r => r.id === id) || null;
}

export async function createReleaseApi(input: CreateReleaseInput): Promise<Release> {
  const completedSteps = input.completed_steps || [];
  try {
    const res = await fetch(`${API_BASE}/releases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (res.ok) {
      const data = await res.json();
      localReleasesStore = [data, ...localReleasesStore];
      return data;
    }
  } catch {
    // Fallback store insert
  }

  const newId = localReleasesStore.length > 0 ? Math.max(...localReleasesStore.map(r => r.id)) + 1 : 1;
  const newRelease: Release = {
    id: newId,
    name: input.name,
    due_date: input.due_date,
    status: computeStatus(completedSteps),
    additional_info: input.additional_info || null,
    completed_steps: completedSteps
  };
  localReleasesStore = [newRelease, ...localReleasesStore];
  return newRelease;
}

export async function updateReleaseApi(id: number, input: UpdateReleaseInput): Promise<Release> {
  const completedSteps = input.completed_steps || [];
  try {
    const res = await fetch(`${API_BASE}/releases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    if (res.ok) {
      const data = await res.json();
      localReleasesStore = localReleasesStore.map(r => (r.id === id ? data : r));
      return data;
    }
  } catch {
    // Fallback store update
  }

  const idx = localReleasesStore.findIndex(r => r.id === id);
  if (idx !== -1) {
    const updated: Release = {
      ...localReleasesStore[idx],
      name: input.name !== undefined ? input.name : localReleasesStore[idx].name,
      due_date: input.due_date !== undefined ? input.due_date : localReleasesStore[idx].due_date,
      additional_info: input.additional_info !== undefined ? input.additional_info : localReleasesStore[idx].additional_info,
      completed_steps: input.completed_steps !== undefined ? completedSteps : localReleasesStore[idx].completed_steps,
      status: computeStatus(input.completed_steps !== undefined ? completedSteps : localReleasesStore[idx].completed_steps)
    };
    localReleasesStore[idx] = updated;
    return updated;
  }

  throw new Error('Release not found');
}

export async function deleteReleaseApi(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/releases/${id}`, { method: 'DELETE' });
    if (res.ok) {
      localReleasesStore = localReleasesStore.filter(r => r.id !== id);
      return true;
    }
  } catch {
    // Fallback store delete
  }
  localReleasesStore = localReleasesStore.filter(r => r.id !== id);
  return true;
}
