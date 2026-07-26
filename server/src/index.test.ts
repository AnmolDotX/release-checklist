import request from 'supertest';
import app from './index';
import { computeStatus } from './utils/status';

describe('Release Checklist API Tests', () => {
  test('GET /api/health returns 200 and ok status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/steps returns predefined steps', async () => {
    const res = await request(app).get('/api/steps');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(7);
  });

  test('GET /api/releases returns releases list', async () => {
    const res = await request(app).get('/api/releases');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Status computation logic', () => {
    expect(computeStatus([])).toBe('planned');
    expect(computeStatus(['step-1'])).toBe('ongoing');
    expect(computeStatus(['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6', 'step-7'])).toBe('done');
  });

  test('POST /api/releases creates a new release', async () => {
    const newRelease = {
      name: 'Version Test 1.0',
      due_date: '2025-12-31T00:00:00.000Z',
      additional_info: 'Unit test release'
    };

    const res = await request(app).post('/api/releases').send(newRelease);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Version Test 1.0');
    expect(res.body.status).toBe('planned');
  });

  test('PUT /api/releases/:id updates steps and status dynamically', async () => {
    const createRes = await request(app).post('/api/releases').send({
      name: 'Version Dynamic Test',
      due_date: '2025-12-31T00:00:00.000Z'
    });

    const releaseId = createRes.body.id;

    // Update to 1 step completed -> ongoing
    const updateRes1 = await request(app)
      .put(`/api/releases/${releaseId}`)
      .send({ completed_steps: ['step-1'] });

    expect(updateRes1.status).toBe(200);
    expect(updateRes1.body.status).toBe('ongoing');

    // Update to all 7 steps completed -> done
    const updateRes2 = await request(app)
      .put(`/api/releases/${releaseId}`)
      .send({
        completed_steps: ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6', 'step-7']
      });

    expect(updateRes2.status).toBe(200);
    expect(updateRes2.body.status).toBe('done');
  });

  test('DELETE /api/releases/:id removes the release', async () => {
    const createRes = await request(app).post('/api/releases').send({
      name: 'To Be Deleted',
      due_date: '2025-12-31T00:00:00.000Z'
    });

    const releaseId = createRes.body.id;
    const deleteRes = await request(app).delete(`/api/releases/${releaseId}`);
    expect(deleteRes.status).toBe(200);

    const getRes = await request(app).get(`/api/releases/${releaseId}`);
    expect(getRes.status).toBe(404);
  });
});
