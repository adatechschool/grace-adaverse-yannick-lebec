'use client';

import { useActionState, useEffect, useState, startTransition } from 'react';
import { createProject, FormState } from '@/app/actions/createProject';

type Promotion = { id: number; name: string };
type AdaProject = { id: number; name: string };

const initialState: FormState = {};

export default function ProposeProjectDialog({
  promotions,
  adaProjects,
}: {
  promotions: Promotion[];
  adaProjects: AdaProject[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createProject, initialState);
  const [formKey, setFormKey] = useState(0);

  // Ferme la popup et réinitialise le formulaire si succès
  useEffect(() => {
    if (state.success) {
      startTransition(() => {
        setOpen(false);
        setFormKey((k) => k + 1);
      });
    }
  }, [state.success]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Proposer un projet
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Proposer un projet</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* key={formKey} réinitialise le formulaire après succès */}
            <form key={formKey} action={formAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Titre *</label>
                <input
                  name="title"
                  placeholder="Mon super projet"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Lien GitHub *</label>
                <input
                  name="githubUrl"
                  type="url"
                  placeholder="https://github.com/user/repo"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Lien démo *</label>
                <input
                  name="demoUrl"
                  type="url"
                  placeholder="https://mon-projet.vercel.app"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Promotion</label>
                <select
                  name="promotionId"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {promotions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Projet Ada</label>
                <select
                  name="adaProjectId"
                  required
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                >
                  {adaProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message d'erreur */}
              {state.error && (
                <p className="text-red-500 text-sm">{state.error}</p>
              )}

              <button
                type="submit"
                disabled={pending}
                className="bg-black text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
              >
                {pending ? 'Envoi en cours...' : 'Proposer le projet'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
