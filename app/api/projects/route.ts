import { db } from "@/src/db";
import { project } from "@/src/db/schema";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { title, description, url } = await req.json();

  await db.insert(project).values({
    title,
    description,
    url: url ?? null,
    userId: session.user.id,
    published: false,
  });

  return NextResponse.json({ success: true }, { status: 201 });
}
