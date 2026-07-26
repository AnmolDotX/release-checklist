import { Request, Response } from 'express';
import {
  getAllReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease
} from '../services/releaseService';

export async function getReleases(req: Request, res: Response): Promise<void> {
  const releases = await getAllReleases();
  res.json(releases);
}

export async function getRelease(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid release ID' });
    return;
  }

  const release = await getReleaseById(id);
  if (!release) {
    res.status(404).json({ error: 'Release not found' });
    return;
  }

  res.json(release);
}

export async function postRelease(req: Request, res: Response): Promise<void> {
  const { name, due_date, additional_info, completed_steps } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Release name is mandatory' });
    return;
  }

  if (!due_date) {
    res.status(400).json({ error: 'Release date is mandatory' });
    return;
  }

  const newRelease = await createRelease({
    name: name.trim(),
    due_date,
    additional_info: additional_info || null,
    completed_steps: Array.isArray(completed_steps) ? completed_steps : []
  });

  res.status(201).json(newRelease);
}

export async function putRelease(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid release ID' });
    return;
  }

  const { name, due_date, additional_info, completed_steps } = req.body;

  const updated = await updateRelease(id, {
    name: name ? name.trim() : undefined,
    due_date,
    additional_info,
    completed_steps
  });

  if (!updated) {
    res.status(404).json({ error: 'Release not found' });
    return;
  }

  res.json(updated);
}

export async function patchReleaseSteps(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid release ID' });
    return;
  }

  const { completed_steps } = req.body;
  if (!Array.isArray(completed_steps)) {
    res.status(400).json({ error: 'completed_steps must be an array of step IDs' });
    return;
  }

  const updated = await updateRelease(id, { completed_steps });

  if (!updated) {
    res.status(404).json({ error: 'Release not found' });
    return;
  }

  res.json(updated);
}

export async function removeRelease(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: 'Invalid release ID' });
    return;
  }

  const deleted = await deleteRelease(id);
  if (!deleted) {
    res.status(404).json({ error: 'Release not found' });
    return;
  }

  res.json({ message: 'Release deleted successfully', id });
}
