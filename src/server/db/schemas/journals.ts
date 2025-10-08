import { relations } from "drizzle-orm";
import { index, text, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { commonColumns } from "./common";
import { users } from "./users";

// Journals table
export const journals = sqliteTable(
  "journal",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    authorId: text("author_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    imageUrl: text("image_url", { length: 512 }),
    ...commonColumns,
  },
  (t) => [index("journal_author_idx").on(t.authorId)]
);

// Relations
export const journalRelations = relations(journals, ({ one }) => ({
  author: one(users, {
    fields: [journals.authorId],
    references: [users.id],
  }),
}));

// Zod Schemas
export const journalInsertSchema = createInsertSchema(journals).omit({
  updateCounter: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
});

export const journalUpdateSchema = createUpdateSchema(journals).omit({
  createdAt: true,
  updatedAt: true,
  updateCounter: true,
  authorId: true,
});

export const journalSelectSchema = createSelectSchema(journals).omit({
  updateCounter: true,
});
