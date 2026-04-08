# Adaverse — Script de soutenance

## Présentation du projet

Adaverse est une plateforme fullstack qui permet de visualiser les projets réalisés par les apprenantes d'Ada Tech School. Les projets sont classés par catégorie (projet Ada), et seul le développeur peut valider et publier un projet pour qu'il apparaisse sur le site.

**Stack technique :**
- Next.js 16 (App Router, Server Components, Server Actions)
- TypeScript
- TailwindCSS v4
- Drizzle ORM
- PostgreSQL hébergé sur Neon
- Déployé sur Vercel

---

## 1. La base de données (Drizzle ORM)

### Qu'est-ce que Drizzle ORM ?
Drizzle est un ORM (Object Relational Mapper) TypeScript. Il permet de définir le schéma de base de données directement en TypeScript, et génère le SQL correspondant. L'avantage : on bénéficie de l'autocomplétion et du typage fort, sans écrire de SQL brut.

### Les 3 tables

```ts
// Table 1 : les types de projets officiels Ada
export const adaProjects = pgTable('ada_projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});

// Table 2 : les promotions
export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  startDate: timestamp('start_date').notNull(),
});

// Table 3 : les projets étudiants
export const studentProjects = pgTable('student_projects', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  githubUrl: text('github_url').notNull(),
  demoUrl: text('demo_url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'), // null = non publié
  promotionId: serial('promotion_id').references(() => promotions.id),
  adaProjectId: serial('ada_project_id').references(() => adaProjects.id),
});
```

**Points clés à expliquer :**
- `serial` = colonne auto-incrémentée (clé primaire)
- `references()` = clé étrangère (relation entre tables)
- `publishedAt` nullable = projet non publié tant que la valeur est NULL
- Pas besoin de `relations()` car on utilise des `innerJoin` manuels

### Les migrations
Drizzle génère les fichiers SQL de migration avec `drizzle-kit generate`, puis les applique avec `drizzle-kit migrate`. Le fichier `drizzle/0000_lyrical_prodigy.sql` contient le SQL généré automatiquement.

### Les seeds
Des scripts SQL pour insérer les données de base :
- `promotions.sql` : insère les promotions Ada
- `ada_projects.sql` : insère les types de projets
- `publish_project.sql` : publie un projet (met à jour `published_at`)

---

## 2. Le backend — Routes API et Server Actions

### Server Components (Next.js App Router)
Dans Next.js App Router, les composants sont **serveur par défaut**. Cela signifie qu'ils s'exécutent côté serveur et peuvent directement appeler la base de données, sans passer par une API.

**Exemple — page d'accueil `app/page.tsx` :**
```ts
export const dynamic = 'force-dynamic'; // désactive le cache

export default async function Home() {
  const projects = await db
    .select({ ... })
    .from(studentProjects)
    .innerJoin(promotions, eq(studentProjects.promotionId, promotions.id))
    .innerJoin(adaProjects, eq(studentProjects.adaProjectId, adaProjects.id))
    .where(isNotNull(studentProjects.publishedAt)) // seulement les publiés
    .orderBy(desc(studentProjects.createdAt));

  return <main>...</main>;
}
```

**Points clés :**
- Pas de `useEffect` ni de `fetch` : on appelle directement la DB
- `innerJoin` = jointure SQL pour récupérer les données de plusieurs tables
- `isNotNull(publishedAt)` = filtre les projets non publiés
- `force-dynamic` = la page est recalculée à chaque requête (pas de cache)

### Server Action `createProject`
Une Server Action est une fonction serveur appelée depuis un formulaire client. Elle remplace une route API traditionnelle.

```ts
'use server';

export async function createProject(prevState: FormState, formData: FormData): Promise<FormState> {
  const title = formData.get('title') as string;
  // validation...
  await db.insert(studentProjects).values({ title, slug, githubUrl, ... });
  return { success: true };
}
```

**Points clés :**
- `'use server'` = directive qui marque la fonction comme action serveur
- Utilisée avec `useActionState` côté client pour gérer l'état du formulaire
- Validation des champs obligatoires avant insertion

---

## 3. Le frontend

### `"use client"` vs Server Component
- **Server Component** (défaut) : s'exécute sur le serveur, peut accéder à la DB, pas d'interactivité
- **Client Component** (`"use client"`) : s'exécute dans le navigateur, peut utiliser `useState`, `useEffect`, gestionnaires d'événements

**Dans ce projet :**
- `Navbar.tsx` = Server Component (fetch les données pour le formulaire)
- `ProposeProjectDialog.tsx` = Client Component (gère l'ouverture/fermeture de la popup)
- `DarkModeToggle.tsx` = Client Component (manipule `localStorage` et le DOM)

### Système de routes Next.js
- `app/page.tsx` → route `/`
- `app/[slug]/page.tsx` → route dynamique `/nom-du-projet`
- Le paramètre `slug` est récupéré via `params`

**Route dynamique :**
```ts
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await db.select(...).where(eq(studentProjects.slug, slug));
  if (!project) notFound(); // affiche la page 404
  ...
}
```

### Composant `ProjectCard`
Chaque carte affiche :
- L'image OpenGraph du repo GitHub (`https://opengraph.githubassets.com/1/user/repo`)
- Le titre, la promotion, le projet Ada
- La date de publication

La carte est un lien `<Link>` vers la page de détail du projet.

### Navigation avec `Link`
`Link` de Next.js permet la navigation côté client sans rechargement de page, contrairement à `<a>`.

---

## 4. Déploiement

- **Neon** : base de données PostgreSQL cloud, connexion via variable d'environnement `DATABASE_URL`
- **Vercel** : hébergement Next.js, déployé via CLI (`npx vercel --prod`)
- La variable `DATABASE_URL` est configurée dans les **Environment Variables** de Vercel

---

## 5. Bonus — Dark Mode

Implémenté avec :
- La directive `@custom-variant dark` dans Tailwind v4
- Un composant `DarkModeToggle` client qui toggle la classe `dark` sur `<html>`
- La préférence est sauvegardée dans `localStorage`
- Les composants utilisent les classes `dark:bg-*`, `dark:text-*` de Tailwind

---

## Questions techniques probables

**Q : Qu'est-ce qu'un ORM ?**
Un ORM (Object Relational Mapper) fait le lien entre les objets TypeScript et les tables SQL. Il génère les requêtes SQL à partir du code TypeScript, ce qui évite d'écrire du SQL brut et apporte le typage.

**Q : Différence entre `innerJoin` et `leftJoin` ?**
`innerJoin` ne retourne que les lignes qui ont une correspondance dans les deux tables. `leftJoin` retourne toutes les lignes de la table principale, même si pas de correspondance.

**Q : Pourquoi `force-dynamic` ?**
Par défaut Next.js met en cache les pages statiques. `force-dynamic` force le rendu à chaque requête pour toujours afficher les données les plus récentes depuis la DB.

**Q : Pourquoi `"use client"` sur le dialog ?**
Le dialog a besoin de `useState` pour gérer son ouverture/fermeture, et `useActionState` pour le formulaire. Ces hooks React ne fonctionnent que dans le navigateur.

**Q : Comment fonctionne le slug ?**
Le slug est un identifiant URL propre (ex: `mon-projet-1234`). Il est généré à partir du titre lors de la création du projet et permet d'accéder à la page de détail via une URL lisible.

**Q : Comment publier un projet ?**
En mettant à jour `published_at` directement en base de données via un script SQL. Il n'y a pas d'interface d'administration — c'est intentionnel selon le cahier des charges.
