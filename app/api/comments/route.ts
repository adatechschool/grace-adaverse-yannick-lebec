import { db } from "@/src/db";
import { comment } from "@/src/db/schema";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { message, projectId } = await req.json();

  await db.insert(comment).values({
    message,
    projectId,
    userId: session.user.id,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
