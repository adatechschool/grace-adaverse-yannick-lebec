'use client';

import Link from 'next/link';
import { useState } from 'react';

type Project = {
  id: number;
  title: string;
  slug: string;
  githubUrl: string;
  publishedAt: Date | null;
  promotionName: string;
  adaProjectName: string;
};

// Construit l'URL de la thumbnail GitHub à partir de l'URL du repo
function getThumbnailUrl(githubUrl: string): string {
  return `${githubUrl}/blob/main/thumbnail.png?raw=true`;
}

export default function ProjectCard({ project }: { project: Project }) {
  const [imgError, setImgError] = useState(false);
  const thumbnailUrl = getThumbnailUrl(project.githubUrl);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Image du projet — si elle échoue à charger, on affiche un placeholder */}
      <div className="aspect-video bg-gray-100">
        {!imgError ? (
          <img
            src={thumbnailUrl}
            alt={project.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-sm">
            Pas d&apos;image
          </div>
        )}
      </div>

      {/* Infos du projet */}
      <div className="p-4">
        <h3 className="font-semibold text-base">{project.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{project.promotionName}</p>
        <p className="text-xs text-gray-400 mt-1">
          {project.publishedAt
            ? new Date(project.publishedAt).toLocaleDateString('fr-FR')
            : ''}
        </p>
      </div>
    </Link>
  );
}
