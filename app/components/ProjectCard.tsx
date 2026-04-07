import Link from 'next/link';
import Image from 'next/image';

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
      return `https://github.com/${user}/${repo}/blob/main/thumbnail.png?raw=true`;
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
    <Link href={`/${project.slug}`} className="border rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="relative w-full h-40 bg-gray-100">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={project.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Pas d&apos;image
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold">{project.title}</h3>
        <p className="text-sm text-gray-500">{project.promotionName} · {project.adaProjectName}</p>
        {publishedDate && <p className="text-xs text-gray-400 mt-auto pt-2">{publishedDate}</p>}
      </div>
    </Link>
  );
}
