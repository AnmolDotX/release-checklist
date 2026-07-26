import { getPrisma, isUsingInMemoryFallback } from '../db/prisma';
import { Release, CreateReleaseInput, UpdateReleaseInput } from '../types/release';
import { computeStatus } from '../utils/status';

let memoryReleases: Release[] = [
  {
    id: 1,
    name: 'Version 1.0.1',
    due_date: '2022-09-20T00:00:00.000Z',
    status: 'done',
    additional_info: 'Initial production release patch with critical bugfixes.',
    completed_steps: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6', 'step-7']
  },
  {
    id: 2,
    name: 'Version 1.0.2',
    due_date: '2022-09-28T00:00:00.000Z',
    status: 'done',
    additional_info: 'Maintenance update and security patches.',
    completed_steps: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6', 'step-7']
  },
  {
    id: 3,
    name: 'Version 1.1.0',
    due_date: '2022-10-10T00:00:00.000Z',
    status: 'ongoing',
    additional_info: 'New dashboard features and improved reporting UI.',
    completed_steps: ['step-1', 'step-2', 'step-3', 'step-4']
  },
  {
    id: 4,
    name: 'Version 2 (beta)',
    due_date: '2022-11-01T00:00:00.000Z',
    status: 'planned',
    additional_info: 'Major framework upgrade and API refactoring.',
    completed_steps: []
  }
];

function formatPrismaRelease(row: any): Release {
  let completedSteps: string[] = [];
  if (Array.isArray(row.completed_steps)) {
    completedSteps = row.completed_steps as string[];
  } else if (typeof row.completed_steps === 'string') {
    try {
      completedSteps = JSON.parse(row.completed_steps);
    } catch {
      completedSteps = [];
    }
  }

  let formattedDate = row.due_date;
  if (row.due_date instanceof Date) {
    formattedDate = row.due_date.toISOString();
  }

  return {
    id: row.id,
    name: row.name,
    due_date: formattedDate,
    status: computeStatus(completedSteps),
    additional_info: row.additional_info || null,
    completed_steps: completedSteps,
    created_at: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : undefined
  };
}

export async function getAllReleases(): Promise<Release[]> {
  if (isUsingInMemoryFallback) {
    return memoryReleases.map(r => ({ ...r, status: computeStatus(r.completed_steps) }));
  }

  try {
    const prisma = getPrisma();
    const rows = await prisma.release.findMany({
      orderBy: { due_date: 'desc' }
    });
    return rows.map(formatPrismaRelease);
  } catch (err) {
    return memoryReleases.map(r => ({ ...r, status: computeStatus(r.completed_steps) }));
  }
}

export async function getReleaseById(id: number): Promise<Release | null> {
  if (isUsingInMemoryFallback) {
    const rel = memoryReleases.find(r => r.id === id);
    return rel ? { ...rel, status: computeStatus(rel.completed_steps) } : null;
  }

  try {
    const prisma = getPrisma();
    const row = await prisma.release.findUnique({
      where: { id }
    });
    if (!row) return null;
    return formatPrismaRelease(row);
  } catch (err) {
    const rel = memoryReleases.find(r => r.id === id);
    return rel ? { ...rel, status: computeStatus(rel.completed_steps) } : null;
  }
}

export async function createRelease(input: CreateReleaseInput): Promise<Release> {
  const completedSteps = input.completed_steps || [];

  if (isUsingInMemoryFallback) {
    const newId = memoryReleases.length > 0 ? Math.max(...memoryReleases.map(r => r.id)) + 1 : 1;
    const newRelease: Release = {
      id: newId,
      name: input.name,
      due_date: input.due_date,
      status: computeStatus(completedSteps),
      additional_info: input.additional_info || null,
      completed_steps: completedSteps
    };
    memoryReleases.push(newRelease);
    return newRelease;
  }

  try {
    const prisma = getPrisma();
    const row = await prisma.release.create({
      data: {
        name: input.name,
        due_date: new Date(input.due_date),
        additional_info: input.additional_info || null,
        completed_steps: completedSteps
      }
    });
    return formatPrismaRelease(row);
  } catch (err) {
    const newId = memoryReleases.length > 0 ? Math.max(...memoryReleases.map(r => r.id)) + 1 : 1;
    const newRelease: Release = {
      id: newId,
      name: input.name,
      due_date: input.due_date,
      status: computeStatus(completedSteps),
      additional_info: input.additional_info || null,
      completed_steps: completedSteps
    };
    memoryReleases.push(newRelease);
    return newRelease;
  }
}

export async function updateRelease(id: number, input: UpdateReleaseInput): Promise<Release | null> {
  const existing = await getReleaseById(id);
  if (!existing) return null;

  const updatedName = input.name !== undefined ? input.name : existing.name;
  const updatedDueDate = input.due_date !== undefined ? input.due_date : existing.due_date;
  const updatedAdditionalInfo = input.additional_info !== undefined ? input.additional_info : existing.additional_info;
  const updatedCompletedSteps = input.completed_steps !== undefined ? input.completed_steps : existing.completed_steps;

  if (isUsingInMemoryFallback) {
    const idx = memoryReleases.findIndex(r => r.id === id);
    if (idx !== -1) {
      memoryReleases[idx] = {
        ...memoryReleases[idx],
        name: updatedName,
        due_date: updatedDueDate,
        additional_info: updatedAdditionalInfo,
        completed_steps: updatedCompletedSteps,
        status: computeStatus(updatedCompletedSteps)
      };
      return memoryReleases[idx];
    }
    return null;
  }

  try {
    const prisma = getPrisma();
    const row = await prisma.release.update({
      where: { id },
      data: {
        name: updatedName,
        due_date: new Date(updatedDueDate),
        additional_info: updatedAdditionalInfo,
        completed_steps: updatedCompletedSteps
      }
    });
    return formatPrismaRelease(row);
  } catch (err) {
    const idx = memoryReleases.findIndex(r => r.id === id);
    if (idx !== -1) {
      memoryReleases[idx] = {
        ...memoryReleases[idx],
        name: updatedName,
        due_date: updatedDueDate,
        additional_info: updatedAdditionalInfo,
        completed_steps: updatedCompletedSteps,
        status: computeStatus(updatedCompletedSteps)
      };
      return memoryReleases[idx];
    }
    return null;
  }
}

export async function deleteRelease(id: number): Promise<boolean> {
  if (isUsingInMemoryFallback) {
    const initialLen = memoryReleases.length;
    memoryReleases = memoryReleases.filter(r => r.id !== id);
    return memoryReleases.length < initialLen;
  }

  try {
    const prisma = getPrisma();
    await prisma.release.delete({ where: { id } });
    return true;
  } catch (err) {
    const initialLen = memoryReleases.length;
    memoryReleases = memoryReleases.filter(r => r.id !== id);
    return memoryReleases.length < initialLen;
  }
}
