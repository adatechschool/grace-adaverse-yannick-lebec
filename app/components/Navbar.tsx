import Link from "next/link";
import Image from "next/image";
import { db } from "@/src/db/db";
import { promotions, adaProjects } from "@/src/db/schema";
import ProposeProjectDialog from "@/app/components/ProposeProjectDialog";
import DarkModeToggle from "@/app/components/DarkModeToggle";

export default async function Navbar() {
  
  const [promotionsList, adaProjectsList] = await Promise.all([
    db.select({ id: promotions.id, name: promotions.name }).from(promotions),
    db.select({ id: adaProjects.id, name: adaProjects.name }).from(adaProjects),
  ]);

  return (
    <nav className="border-b border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        
        <Link href="/" className="text-xl font-bold tracking-tight">
          <Image src="/logo.png" alt="Ada Logo" width={100} height={40} style={{ width: '100px', height: '60px' }} />
        </Link>

        
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <ProposeProjectDialog
            promotions={promotionsList}
            adaProjects={adaProjectsList}
          />
        </div>
      </div>
    </nav>
  );
}
