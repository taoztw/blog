import { relations } from "drizzle-orm";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { user } from "./auth";
import { commonColumns } from "./common";

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
      .references(() => user.id),
    content: text("content").notNull(),
    imageUrl: text("image_url", { length: 512 }),
    ...commonColumns,
  },
  (t) => [index("journal_author_idx").on(t.authorId)]
);

// Relations
export const journalRelations = relations(journals, ({ one }) => ({
  author: one(user, {
    fields: [journals.authorId],
    references: [user.id],
  }),
}));

// Zod Schemas
export const journalInsertSchema = createInsertSchema(journals).omit({
  authorId: true,
  createdAt: true,
  updatedAt: true,
});

export const journalUpdateSchema = createUpdateSchema(journals).omit({
  createdAt: true,
  updatedAt: true,
  authorId: true,
});

export const journalSelectSchema = createSelectSchema(journals);
