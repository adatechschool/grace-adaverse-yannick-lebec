"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Comment = {
  id: number;
  message: string;
  createdAt: Date;
  authorName: string | null;
  authorId: string;
};

export default function CommentSection({
  projectId,
  comments,
  currentUserId,
}: {
  projectId: number;
  comments: Comment[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMessage, setEditMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: formData.get("message"),
        projectId,
      }),
    });

    (e.target as HTMLFormElement).reset();
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(commentId: number) {
    await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    router.refresh();
  }

  async function handleEdit(commentId: number) {
    await fetch(`/api/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: editMessage }),
    });
    setEditingId(null);
    router.refresh();
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">
        {comments.length} commentaire{comments.length !== 1 ? "s" : ""}
      </h2>

      <div className="flex flex-col gap-4 mb-8">
        {comments.map((c) => (
          <div key={c.id} className="border rounded p-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">{c.authorName}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              {currentUserId === c.authorId && (
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => {
                      setEditingId(c.id);
                      setEditMessage(c.message);
                    }}
                    className="underline text-gray-500"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="underline text-red-500"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>

            {editingId === c.id ? (
              <div className="mt-2 flex gap-2">
                <input
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  className="border rounded px-2 py-1 flex-1"
                />
                <button
                  onClick={() => handleEdit(c.id)}
                  className="bg-black text-white rounded px-3 py-1 text-sm"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm underline"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <p className="mt-2 text-gray-700">{c.message}</p>
            )}
          </div>
        ))}
      </div>

      {currentUserId ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <label htmlFor="message" className="font-medium">
            Laisser un commentaire
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={3}
            className="border rounded px-3 py-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="self-start bg-black text-white rounded px-4 py-2 disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Commenter"}
          </button>
        </form>
      ) : (
        <p className="text-gray-500 text-sm">
          <a href="/auth/signin" className="underline">
            Connectez-vous
          </a>{" "}
          pour laisser un commentaire.
        </p>
      )}
    </section>
  );
}
