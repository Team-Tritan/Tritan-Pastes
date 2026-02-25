CREATE TABLE "pastes" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"password_hash" text,
	"has_password" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
