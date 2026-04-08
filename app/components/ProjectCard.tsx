import Link from 'next/link';

type Props = {
  project: {
    id: number;
    title: string;
    slug: string;
    githubUrl: string;
    demoUrl: string;
    publishedAt: Date | null;
    promotionName: string;
    adaProjectName: string;
  };
};

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

export default function ProjectCard({ project }: Props) {
  const thumbnailUrl = getThumbnailUrl(project.githubUrl);
  const publishedDate = project.publishedAt
    ? new Date(project.publishedAt).toLocaleDateString('fr-FR')
    : '';

  return (
    <Link href={`/${project.slug}`} className="border rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
      <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-700">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Pas d&apos;image
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold dark:text-white">{project.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{project.promotionName} · {project.adaProjectName}</p>
        {publishedDate && <p className="text-xs text-gray-400 mt-auto pt-2">{publishedDate}</p>}
      </div>
    </Link>
  );
}
