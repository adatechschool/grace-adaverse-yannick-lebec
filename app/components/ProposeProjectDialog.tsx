'use client';

import { useState, useActionState } from 'react';
import { createProject, FormState } from '../actions/createProject';

type Props = {
  promotions: { id: number; name: string }[];
  adaProjects: { id: number; name: string }[];
};

export default function ProposeProjectDialog({ promotions, adaProjects }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState<FormState, FormData>(createProject, {});

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
      >
        Proposer un projet
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Proposer un projet</h2>
              <button type='button' onClick={() => setOpen(false)} >❌</button>
            </div>

            

            {state.error && <p className="text-red-600 text-sm">{state.error}</p>}
            {state.success && <p className="text-green-600 text-sm">Projet envoyé !</p>}

            <form action={action} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre *</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL GitHub *</label>
                <input
                  type="url"
                  name="githubUrl"
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL Démo *</label>
                <input
                  type="url"
                  name="demoUrl"
                  required
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Promotion *</label>
                <select name="promotionId" required className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Choisir une promotion</option>
                  {promotions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Projet Ada *</label>
                <select name="adaProjectId" required className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Choisir un projet Ada</option>
                  {adaProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800"
                >
                  Envoyer
                </button>
              </div>
              <p className=' text-red-600'>* tous les champs sont obligatoires </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
