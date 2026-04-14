# Guide de démo — grace-adaverse-yannick-lebec

## 1. Lancer le serveur

```bash
npm run dev
```

Ouvrir `http://localhost:3000` dans le navigateur.

---

## 2. Parcours de démo dans le navigateur

### A. Page d'accueil (`/`)
- Montre la liste des projets affichés sous forme de cartes (`ProjectCard`)
- Chaque carte est cliquable → navigue vers la page détail

### B. Page détail d'un projet (`/[slug]`)
- Montre l'image OpenGraph générée automatiquement depuis l'URL GitHub
- Les boutons "Voir sur GitHub" et "Voir la démo" ouvrent dans un nouvel onglet

### C. Proposer un projet (dialog)
- Clique sur le bouton **"Proposer un projet"** dans la Navbar
- Remplis le formulaire en live (titre, URL GitHub, URL démo, promotion, projet Ada)
- Soumets → la nouvelle carte apparaît instantanément sur la page d'accueil (grâce au `revalidatePath('/')`)

### D. Dark mode (bonus)
- Bouton de bascule dans la Navbar

---

## 3. Explication du code

### Ordre recommandé

| Priorité | Fichier | Concept clé |
|---|---|---|
| 1 | `src/db/schema.ts` | Les 3 tables Drizzle et leurs relations |
| 2 | `app/page.tsx` | Server Component + requête DB avec jointures |
| 3 | `app/components/ProjectCard.tsx` | Composant réutilisable, props typées, `getThumbnailUrl` |
| 4 | `app/components/ProposeProjectDialog.tsx` | `'use client'`, `useState`, `useActionState` |
| 5 | `app/actions/createProject.ts` | `'use server'`, Server Action, `slugify`, `revalidatePath` |
| 6 | `app/components/Navbar.tsx` | Server Component qui fetch la DB et passe les données au client |
| 7 | `app/[slug]/page.tsx` | Route dynamique, `params`, `notFound()` |

---

## 3b. Extraits de code à présenter

---

### `src/db/schema.ts` — Les tables de la base de données

```ts
// 3 tables : les types de projets Ada, les promotions, et les projets étudiants
export const adaProjects = pgTable('ada_projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  startDate: timestamp('start_date').notNull(),
});

export const studentProjects = pgTable('student_projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),       // URL unique du projet
  githubUrl: text('github_url').notNull(),
  demoUrl: text('demo_url').notNull(),
  publishedAt: timestamp('published_at'),       // null = pas encore publié
  promotionId: serial('promotion_id').references(() => promotions.id),
  adaProjectId: serial('ada_project_id').references(() => adaProjects.id),
});
```

> **À dire** : Drizzle ORM permet de définir le schéma en TypeScript. Les `references()` créent les clés étrangères. `publishedAt` nullable permet de filtrer les projets publiés.

---

### `src/db/db.ts` — Connexion à la base Neon

```ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });
```

> **À dire** : Une seule ligne de config. `db` est importé partout dans l'app. La variable d'environnement `DATABASE_URL` pointe vers la base Neon (PostgreSQL serverless).

---

### `app/page.tsx` — Server Component avec requête DB

```tsx
export const dynamic = 'force-dynamic'; // pas de cache, toujours frais

export default async function Home() {
  // On requête directement la DB — pas d'API, pas de fetch()
  const projects = await db
    .select({ ... })
    .from(studentProjects)
    .innerJoin(promotions, eq(studentProjects.promotionId, promotions.id))
    .innerJoin(adaProjects, eq(studentProjects.adaProjectId, adaProjects.id))
    .where(isNotNull(studentProjects.publishedAt))  // seulement les publiés
    .orderBy(desc(studentProjects.createdAt));

  return (
    <main>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </main>
  );
}
```

> **À dire** : C'est un Server Component — la fonction est `async`, elle tourne sur le serveur. Aucun JavaScript n'est envoyé au client pour ce composant. Les jointures Drizzle ressemblent à du SQL mais sont typées.

---

### `app/components/ProjectCard.tsx` — Composant réutilisable

```tsx
type Props = {
  project: {
    id: number;
    title: string;
    slug: string;
    githubUrl: string;
    // ...
  };
};

function getThumbnailUrl(githubUrl: string): string {
  // Génère l'URL de l'image OpenGraph GitHub automatiquement
  const [user, repo] = url.pathname.split('/').filter(Boolean);
  return `https://opengraph.githubassets.com/1/${user}/${repo}`;
}

export default function ProjectCard({ project }: Props) {
  return (
    <Link href={`/${project.slug}`}>  {/* lien vers la page détail */}
      <img src={thumbnailUrl} />
      <h3>{project.title}</h3>
      <p>{project.promotionName} · {project.adaProjectName}</p>
    </Link>
  );
}
```

> **À dire** : Composant pur, sans état, sans effets. Il reçoit des props typées et affiche les données. `getThumbnailUrl` extrait le user/repo depuis l'URL GitHub pour récupérer l'aperçu automatiquement.

---

### `app/components/ProposeProjectDialog.tsx` — Composant client avec état

```tsx
'use client'; // nécessaire car on utilise useState

export default function ProposeProjectDialog({ promotions, adaProjects }: Props) {
  const [open, setOpen] = useState(false); // état local : dialog ouvert ou fermé

  return (
    <>
      <button onClick={() => setOpen(true)}>Proposer un projet</button>

      {open && (
        <DialogForm onClose={() => setOpen(false)} ... />
      )}
    </>
  );
}

function DialogForm({ onClose }: FormProps) {
  // useActionState connecte le formulaire à la Server Action
  const [state, action] = useActionState<FormState, FormData>(createProject, {});

  useEffect(() => {
    if (state.success) onClose(); // ferme le dialog après succès
  }, [state.success, onClose]);

  return (
    <form action={action}>  {/* action = la Server Action */}
      <input name="title" />
      <input name="githubUrl" />
      {state.error && <p>{state.error}</p>}
      <button type="submit">Envoyer</button>
    </form>
  );
}
```

> **À dire** : `'use client'` est obligatoire dès qu'on utilise `useState` ou `useEffect`. `useActionState` est un hook React 19 qui relie le `<form>` à une Server Action et gère l'état retourné (erreur ou succès).

---

### `app/actions/createProject.ts` — Server Action

```ts
'use server'; // cette fonction tourne UNIQUEMENT sur le serveur

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')                        // décompose les accents
    .replace(/[\u0300-\u036f]/g, '')         // supprime les accents
    .replace(/[^a-z0-9]+/g, '-')            // remplace les espaces par des tirets
    .replace(/^-+|-+$/g, '');               // nettoie les tirets en début/fin
}

export async function createProject(prevState: FormState, formData: FormData) {
  const title = formData.get('title') as string;
  // ... récupération des champs

  if (!title?.trim() || !githubUrl?.trim() || !demoUrl?.trim()) {
    return { error: 'Le titre et les deux liens sont obligatoires.' };
  }

  const slug = `${slugify(title)}-${Date.now()}`; // slug unique

  await db.insert(studentProjects).values({ title, slug, githubUrl, ... });

  revalidatePath('/'); // invalide le cache → la liste se met à jour
  return { success: true };
}
```

> **À dire** : `'use server'` fait tourner la fonction côté serveur. Pas besoin d'une route `/api`. `revalidatePath('/')` dit à Next.js de regénérer la page d'accueil pour que le nouveau projet apparaisse immédiatement.

---

### `app/components/Navbar.tsx` — Server Component qui passe des données au client

```tsx
// Pas de 'use client' → c'est un Server Component
export default async function Navbar() {
  // Fetch des données directement depuis la DB (côté serveur)
  const [promotionsList, adaProjectsList] = await Promise.all([
    db.select({ id: promotions.id, name: promotions.name }).from(promotions),
    db.select({ id: adaProjects.id, name: adaProjects.name }).from(adaProjects),
  ]);

  return (
    <nav>
      <Link href="/">Logo</Link>
      <DarkModeToggle />  {/* composant client */}
      <ProposeProjectDialog
        promotions={promotionsList}       // données passées en props au client
        adaProjects={adaProjectsList}
      />
    </nav>
  );
}
```

> **À dire** : La Navbar est server, elle fetch la DB. Elle passe les listes en props à `ProposeProjectDialog` qui est client. C'est la frontière Server → Client : les données traversent via les props.

---

### `app/[slug]/page.tsx` — Route dynamique

```tsx
export default async function ProjectPage({
  params
}: {
  params: Promise<{ slug: string }> // Next.js 16 : params est une Promise
}) {
  const { slug } = await params;

  const results = await db
    .select({ ... })
    .from(studentProjects)
    .where(eq(studentProjects.slug, slug)) // cherche le projet par son slug
    .limit(1);

  const project = results[0];
  if (!project) notFound(); // redirige vers 404 si slug inexistant

  return (
    <main>
      <Image src={thumbnailUrl} fill />  {/* image OpenGraph GitHub */}
      <h1>{project.title}</h1>
      <a href={project.githubUrl}>Voir sur GitHub</a>
      <a href={project.demoUrl}>Voir la démo</a>
    </main>
  );
}
```

> **À dire** : Le dossier `[slug]` crée une route dynamique. Chaque projet a sa propre URL. `notFound()` de Next.js gère automatiquement la page 404. `params` est une `Promise` dans cette version de Next.js.

---

## 4. Points forts à mettre en avant

### Server Components vs Client Components
- `Navbar` et `app/page.tsx` fetchent la base de données directement — ce sont des **Server Components** (pas de JS envoyé au client)
- `ProposeProjectDialog` utilise `useState` et `useActionState` → doit être `'use client'`
- La `Navbar` est server mais elle passe les données (promotions, projets Ada) au composant client `ProposeProjectDialog` via les props

### Server Actions (`createProject.ts`)
- La directive `'use server'` en haut du fichier fait tourner la fonction côté serveur
- Pas besoin d'une API route séparée — le formulaire appelle directement la fonction
- `useActionState` dans le client gère l'état du formulaire (erreur / succès) en lien avec la Server Action

### `revalidatePath('/')`
- Après une soumission réussie, Next.js invalide le cache de la page d'accueil
- La liste se met à jour automatiquement sans rechargement manuel

### Drizzle ORM (`schema.ts` + `page.tsx`)
- Les 3 tables : `adaProjects`, `promotions`, `studentProjects`
- Les jointures dans `page.tsx` (`innerJoin`) permettent d'éviter le SQL brut tout en restant lisibles
- `publishedAt` est nullable — seuls les projets publiés apparaissent (filtre `isNotNull`)

### Route dynamique (`app/[slug]/page.tsx`)
- Le dossier `[slug]` crée une route dynamique — chaque projet a sa propre URL
- `notFound()` redirige vers une page 404 si le slug n'existe pas en base
- L'image est générée via l'API OpenGraph de GitHub : `https://opengraph.githubassets.com/1/{user}/{repo}`
