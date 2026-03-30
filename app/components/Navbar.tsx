"use client";

import { signOut, useSession } from "@/src/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b">
      <Link href="/" className="font-bold text-xl">
        Adaverse
      </Link>

      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-sm">Bonjour, {session.user.name}</span>
            <Link href="/projects/new" className="text-sm underline">
              Proposer un projet
            </Link>
            <button onClick={handleSignOut} className="text-sm underline">
              Se déconnecter
            </button>
          </>
        ) : (
          <>
            <Link href="/auth/signin" className="text-sm underline">
              Se connecter
            </Link>
            <Link href="/auth/signup" className="text-sm underline">
              S&apos;inscrire
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
