CREATE TABLE "published_test" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"data" jsonb NOT NULL,
	"published_by" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
