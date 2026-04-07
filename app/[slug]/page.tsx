import { db } from '@/src/db/db';
import { studentProjects, promotions, adaProjects } from '@/src/db/schema';
import { eq } from 'drizzle-orm';
import Image from 'next/image';
import { notFound } from 'next/navigation';

function getThumbnailUrl(githubUrl: string): string {
  try {
    const url = new URL(githubUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const [user, repo] = parts;
      return `https://opengraph.githubassets.com/1/${user}/${repo}`;
    }
  } catch {}
  return '';
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const results = await db
    .select({
      id: studentProjects.id,
      title: studentProjects.title,
      githubUrl: studentProjects.githubUrl,
      demoUrl: studentProjects.demoUrl,
      publishedAt: studentProjects.publishedAt,
      promotionName: promotions.name,
      adaProjectName: adaProjects.name,
    })
    .from(studentProjects)
    .innerJoin(promotions, eq(studentProjects.promotionId, promotions.id))
    .innerJoin(adaProjects, eq(studentProjects.adaProjectId, adaProjects.id))
    .where(eq(studentProjects.slug, slug))
    .limit(1);

  const project = results[0];
  if (!project) notFound();

  const thumbnailUrl = getThumbnailUrl(project.githubUrl);
  const publishedDate = project.publishedAt
    ? new Date(project.publishedAt).toLocaleDateString('fr-FR')
    : '';

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden mb-6">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={project.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Pas d&apos;image
          </div>
        )}
      </div>

      <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
      <p className="text-gray-500 mb-1">{project.promotionName} · {project.adaProjectName}</p>
      {publishedDate && <p className="text-sm text-gray-400 mb-6">Publié le {publishedDate}</p>}

      <div className="flex gap-4">
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border rounded hover:bg-gray-100 text-sm"
        >
          Voir sur GitHub
        </a>
        <a
          href={project.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 text-sm"
        >
          Voir la démo
        </a>
      </div>
    </main>
  );
}
