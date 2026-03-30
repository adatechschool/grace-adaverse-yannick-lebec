"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewProjectForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        description: formData.get("description"),
        url: formData.get("url") || null,
        userId,
      }),
    });

    if (!res.ok) {
      setError("Une erreur est survenue");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex flex-col gap-1">
        <label htmlFor="title">Titre</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="border rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="url">URL (optionnel)</label>
        <input
          id="url"
          name="url"
          type="url"
          className="border rounded px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {loading ? "Envoi..." : "Proposer le projet"}
      </button>
    </form>
  );
}
