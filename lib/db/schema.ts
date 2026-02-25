import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const pastes = pgTable("pastes", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  passwordHash: text("password_hash"),
  hasPassword: boolean("has_password").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export type Paste = typeof pastes.$inferSelect;
export type NewPaste = typeof pastes.$inferInsert;
