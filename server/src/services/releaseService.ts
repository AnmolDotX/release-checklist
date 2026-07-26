import { getPrisma } from '../db/prisma';
import { Release, CreateReleaseInput, UpdateReleaseInput } from '../types/release';
import { computeStatus } from '../utils/status';

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
  const prisma = getPrisma();
  const rows = await prisma.release.findMany({
    orderBy: { due_date: 'desc' }
  });
  return rows.map(formatPrismaRelease);
}

export async function getReleaseById(id: number): Promise<Release | null> {
  const prisma = getPrisma();
  const row = await prisma.release.findUnique({
    where: { id }
  });
  if (!row) return null;
  return formatPrismaRelease(row);
}

export async function createRelease(input: CreateReleaseInput): Promise<Release> {
  const completedSteps = input.completed_steps || [];
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
}

export async function updateRelease(id: number, input: UpdateReleaseInput): Promise<Release | null> {
  const existing = await getReleaseById(id);
  if (!existing) return null;

  const updatedName = input.name !== undefined ? input.name : existing.name;
  const updatedDueDate = input.due_date !== undefined ? input.due_date : existing.due_date;
  const updatedAdditionalInfo = input.additional_info !== undefined ? input.additional_info : existing.additional_info;
  const updatedCompletedSteps = input.completed_steps !== undefined ? input.completed_steps : existing.completed_steps;

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
}

export async function deleteRelease(id: number): Promise<boolean> {
  const prisma = getPrisma();
  await prisma.release.delete({ where: { id } });
  return true;
}
