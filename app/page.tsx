export const dynamic = 'force-dynamic';

import { db } from '@/src/db/db';
import { studentProjects, promotions, adaProjects } from '@/src/db/schema';
import { eq, isNotNull, desc } from 'drizzle-orm';
import ProjectCard from './components/ProjectCard';

export default async function Home() {
  const projects = await db
    .select({
      id: studentProjects.id,
      title: studentProjects.title,
      slug: studentProjects.slug,
      githubUrl: studentProjects.githubUrl,
      demoUrl: studentProjects.demoUrl,
      publishedAt: studentProjects.publishedAt,
      promotionName: promotions.name,
      adaProjectName: adaProjects.name,
    })
    .from(studentProjects)
    .innerJoin(promotions, eq(studentProjects.promotionId, promotions.id))
    .innerJoin(adaProjects, eq(studentProjects.adaProjectId, adaProjects.id))
    .where(isNotNull(studentProjects.publishedAt))
    .orderBy(desc(studentProjects.createdAt));

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <p className=' text-2xl mb-4'>voici les projets réalisé à la ADA TECH SCHOOL :</p>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
    {projects.map((project) => (
      <ProjectCard key={project.id} project={project} />
    ))}
  </div>
</main>
  );
}
