import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import NewProjectForm from "./NewProjectForm";

export default async function NewProjectPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect("/auth/signin");

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Proposer un projet</h1>
      <NewProjectForm userId={session.user.id} />
    </main>
  );
}
