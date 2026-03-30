import { db } from '@/src/db/db';
import { studentProjects, promotions, adaProjects } from '@/src/db/schema';
import { eq, isNotNull, desc } from 'drizzle-orm';
import ProjectCard from '@/app/components/ProjectCard';

export default async function Home() {
  // On récupère tous les projets publiés, avec le nom de la promo et du projet Ada
  // isNotNull filtre les projets non encore validés (publishedAt vide)
  // desc(publishedAt) trie du plus récent au plus ancien
  const projects = await db
    .select({
      id: studentProjects.id,
      title: studentProjects.title,
      slug: studentProjects.slug,
      githubUrl: studentProjects.githubUrl,
      publishedAt: studentProjects.publishedAt,
      promotionName: promotions.name,
      adaProjectName: adaProjects.name,
    })
    .from(studentProjects)
    .innerJoin(promotions, eq(studentProjects.promotionId, promotions.id))
    .innerJoin(adaProjects, eq(studentProjects.adaProjectId, adaProjects.id))
    .where(isNotNull(studentProjects.publishedAt))
    .orderBy(desc(studentProjects.publishedAt));

  // On regroupe les projets par nom de projet Ada
  const grouped = projects.reduce(
    (acc, project) => {
      const key = project.adaProjectName;
      if (!acc[key]) acc[key] = [];
      acc[key].push(project);
      return acc;
    },
    {} as Record<string, typeof projects>
  );

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      {Object.keys(grouped).length === 0 ? (
        <p className="text-gray-500">Aucun projet publié pour l&apos;instant.</p>
      ) : (
        Object.entries(grouped).map(([adaProjectName, projectList]) => (
          <section key={adaProjectName} className="mb-12">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              {adaProjectName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {projectList.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
