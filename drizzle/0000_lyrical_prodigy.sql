CREATE TABLE "ada_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "ada_projects_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "promotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "student_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"image" text,
	"slug" text NOT NULL,
	"github_url" text NOT NULL,
	"demo_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp,
	"promotion_id" serial NOT NULL,
	"ada_project_id" serial NOT NULL,
	CONSTRAINT "student_projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "student_projects" ADD CONSTRAINT "student_projects_promotion_id_promotions_id_fk" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_projects" ADD CONSTRAINT "student_projects_ada_project_id_ada_projects_id_fk" FOREIGN KEY ("ada_project_id") REFERENCES "public"."ada_projects"("id") ON DELETE no action ON UPDATE no action;