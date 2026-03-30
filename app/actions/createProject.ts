'use server';

import { db } from '@/src/db/db';
import { studentProjects } from '@/src/db/schema';
import { revalidatePath } from 'next/cache';

export type FormState = {
  error?: string;
  success?: boolean;
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createProject(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const title = formData.get('title') as string;
  const githubUrl = formData.get('githubUrl') as string;
  const demoUrl = formData.get('demoUrl') as string;
  const promotionId = Number(formData.get('promotionId'));
  const adaProjectId = Number(formData.get('adaProjectId'));

  // Validation : titre et liens obligatoires
  if (!title?.trim() || !githubUrl?.trim() || !demoUrl?.trim()) {
    return { error: 'Le titre et les deux liens sont obligatoires.' };
  }

  // Génération d'un slug unique : titre slugifié + timestamp pour éviter les doublons
  const slug = `${slugify(title)}-${Date.now()}`;

  try {
    await db.insert(studentProjects).values({
      title: title.trim(),
      slug,
      githubUrl: githubUrl.trim(),
      demoUrl: demoUrl.trim(),
      promotionId,
      adaProjectId,
    });
  } catch {
    return { error: 'Une erreur est survenue. Veuillez réessayer.' };
  }

  revalidatePath('/');
  return { success: true };
}
