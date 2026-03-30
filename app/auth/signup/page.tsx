"use client";

import { signUp, useSession } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) router.push("/");
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await signUp.email({ name, email, password });

    if (error) {
      setError(error.message ?? "Une erreur est survenue");
      setLoading(false);
      return;
    }

    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm p-8 border rounded-lg"
      >
        <h1 className="text-2xl font-bold">Créer un compte</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col gap-1">
          <label htmlFor="name">Nom d&apos;utilisateur</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
        >
          {loading ? "Chargement..." : "S'inscrire"}
        </button>

        <p className="text-sm text-center">
          Déjà un compte ?{" "}
          <a href="/auth/signin" className="underline">
            Se connecter
          </a>
        </p>
      </form>
    </main>
  );
}
