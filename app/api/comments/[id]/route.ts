import { db } from "@/src/db";
import { comment } from "@/src/db/schema";
import { auth } from "@/src/lib/auth";
import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const isAdmin = (session.user as { role?: string }).role === "admin";

  if (isAdmin) {
    await db.delete(comment).where(eq(comment.id, Number(id)));
  } else {
    await db.delete(comment).where(
      and(eq(comment.id, Number(id)), eq(comment.userId, session.user.id))
    );
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { id } = await params;
  const { message } = await req.json();

  await db
    .update(comment)
    .set({ message })
    .where(and(eq(comment.id, Number(id)), eq(comment.userId, session.user.id)));

  return NextResponse.json({ success: true });
}
