import Link from 'next/link';
import { db } from '@/src/db/db';
import { promotions, adaProjects } from '@/src/db/schema';
import ProposeProjectDialog from '@/app/components/ProposeProjectDialog';

export default async function Navbar() {
  // Fetch les données nécessaires aux menus déroulants du formulaire
  const [promotionsList, adaProjectsList] = await Promise.all([
    db.select({ id: promotions.id, name: promotions.name }).from(promotions),
    db.select({ id: adaProjects.id, name: adaProjects.name }).from(adaProjects),
  ]);

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo — clique ramène à l'accueil */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          Adaverse
        </Link>

        {/* Le dialog gère lui-même l'ouverture/fermeture et le formulaire */}
        <ProposeProjectDialog
          promotions={promotionsList}
          adaProjects={adaProjectsList}
        />
      </div>
    </nav>
  );
}
