import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';


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
  image: text('image'),
  slug: text('slug').notNull().unique(),
  githubUrl: text('github_url').notNull(),
  demoUrl: text('demo_url').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  publishedAt: timestamp('published_at'),
  promotionId: serial('promotion_id').references(() => promotions.id),
  adaProjectId: serial('ada_project_id').references(() => adaProjects.id),
});
