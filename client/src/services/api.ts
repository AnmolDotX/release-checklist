import { Release, Step, CreateReleaseInput, UpdateReleaseInput } from '../types/release';

function getApiBaseUrl(): string {
  let rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  rawUrl = rawUrl.trim().replace(/\/+$/, '');
  if (!rawUrl.startsWith('http://') && !rawUrl.startsWith('https://')) {
    rawUrl = `https://${rawUrl}`;
  }
  if (!rawUrl.endsWith('/api')) {
    rawUrl = `${rawUrl}/api`;
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

export async function fetchStepsApi(): Promise<Step[]> {
  try {
    const res = await fetch(`${API_BASE}/steps`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Return default predefined steps if endpoint unreachable
  }
  return DEFAULT_STEPS;
}

export async function fetchReleasesApi(): Promise<Release[]> {
  const res = await fetch(`${API_BASE}/releases`);
  if (!res.ok) {
    throw new Error(`Failed to fetch releases: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchReleaseByIdApi(id: number): Promise<Release | null> {
  const res = await fetch(`${API_BASE}/releases/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch release ${id}`);
  }
  return await res.json();
}

export async function createReleaseApi(input: CreateReleaseInput): Promise<Release> {
  const res = await fetch(`${API_BASE}/releases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to create release (${res.status})`);
  }
  return await res.json();
}

export async function updateReleaseApi(id: number, input: UpdateReleaseInput): Promise<Release> {
  const res = await fetch(`${API_BASE}/releases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to update release (${res.status})`);
  }
  return await res.json();
}

export async function deleteReleaseApi(id: number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/releases/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete release (${res.status})`);
  }
  return true;
}
