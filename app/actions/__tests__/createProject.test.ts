import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/cache
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// Mock la DB
vi.mock('@/src/db/db', () => ({
  db: {
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue(undefined),
    })),
  },
}));

// Mock 'use server' (pas supporté dans Vitest)
vi.mock('next/headers', () => ({}));

import { createProject } from '../createProject';

function makeFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

describe('createProject', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne une erreur si le titre est vide', async () => {
    const fd = makeFormData({ title: '', githubUrl: 'https://github.com/a/b', demoUrl: 'https://demo.com', promotionId: '1', adaProjectId: '1' });
    const result = await createProject({}, fd);
    expect(result.error).toBeDefined();
  });

  it('retourne une erreur si githubUrl est vide', async () => {
    const fd = makeFormData({ title: 'Mon projet', githubUrl: '', demoUrl: 'https://demo.com', promotionId: '1', adaProjectId: '1' });
    const result = await createProject({}, fd);
    expect(result.error).toBeDefined();
  });

  it('retourne une erreur si demoUrl est vide', async () => {
    const fd = makeFormData({ title: 'Mon projet', githubUrl: 'https://github.com/a/b', demoUrl: '', promotionId: '1', adaProjectId: '1' });
    const result = await createProject({}, fd);
    expect(result.error).toBeDefined();
  });

  it('retourne success si tous les champs sont remplis', async () => {
    const fd = makeFormData({ title: 'Mon projet', githubUrl: 'https://github.com/a/b', demoUrl: 'https://demo.com', promotionId: '1', adaProjectId: '1' });
    const result = await createProject({}, fd);
    expect(result.success).toBe(true);
  });
});
