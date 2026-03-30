import { db } from "@/src/db";
import { comment, project, user } from "@/src/db/schema";
import { auth } from "@/src/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import CommentSection from "./CommentSection";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const [p] = await db
    .select({
      id: project.id,
      title: project.title,
      description: project.description,
      url: project.url,
      createdAt: project.createdAt,
      authorName: user.name,
    })
    .from(project)
    .leftJoin(user, eq(project.userId, user.id))
    .where(eq(project.id, Number(id)));

  if (!p) notFound();

  const comments = await db
    .select({
      id: comment.id,
      message: comment.message,
      createdAt: comment.createdAt,
      authorName: user.name,
      authorId: comment.userId,
    })
    .from(comment)
    .leftJoin(user, eq(comment.userId, user.id))
    .where(eq(comment.projectId, Number(id)))
    .orderBy(comment.createdAt);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{p.title}</h1>
      <p className="text-sm text-gray-400 mt-1">Par {p.authorName}</p>
      <p className="mt-4 text-gray-700">{p.description}</p>
      {p.url && (
        <a
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-blue-600 underline"
        >
          Voir le projet
        </a>
      )}

      <hr className="my-8" />

      <CommentSection
        projectId={Number(id)}
        comments={comments}
        currentUserId={session?.user.id ?? null}
      />
    </main>
  );
}
