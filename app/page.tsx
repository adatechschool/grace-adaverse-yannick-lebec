export const dynamic = "force-dynamic";

import { db } from "@/src/db";
import { comment, project, user } from "@/src/db/schema";
import { eq, count } from "drizzle-orm";
import Link from "next/link";

export default async function Home() {
  const projects = await db
    .select({
      id: project.id,
      title: project.title,
      description: project.description,
      url: project.url,
      createdAt: project.createdAt,
      authorName: user.name,
      commentCount: count(comment.id),
    })
    .from(project)
    .leftJoin(user, eq(project.userId, user.id))
    .leftJoin(comment, eq(comment.projectId, project.id))
    .where(eq(project.published, true))
    .groupBy(project.id, user.name);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Les projets</h1>

      {projects.length === 0 && (
        <p className="text-gray-500">Aucun projet publié pour le moment.</p>
      )}

      <div className="flex flex-col gap-4">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
          >
            <h2 className="text-xl font-semibold">{p.title}</h2>
            <p className="text-gray-600 mt-1">{p.description}</p>
            <div className="flex gap-4 mt-3 text-sm text-gray-400">
              <span>Par {p.authorName}</span>
              <span>{p.commentCount} commentaire{Number(p.commentCount) !== 1 ? "s" : ""}</span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
