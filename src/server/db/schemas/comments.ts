import { foreignKey, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { user } from "./auth";
import { commonColumns } from "./common";
import { reactionTuple } from "./enums";
import { posts } from "./posts";

export const comments = sqliteTable(
  "comments",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => user.id),
    postId: text("post_id", { length: 255 })
      .notNull()
      .references(() => posts.id),
    parentId: text("parent_id", { length: 255 }),
    content: text("content").notNull(),
    ...commonColumns,
  },
  (table) => [
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "comments_parent_id_fk",
    }),
  ]
);

export const commentReactions = sqliteTable(
  "comment_reactions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    commentId: text("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    type: text("type", { enum: reactionTuple }).default(""),
    ...commonColumns,
  },
  (table) => [
    primaryKey({
      name: "comment_reactions_pk",
      columns: [table.userId, table.commentId],
    }),
  ]
);

export const commentInsertSchema = createInsertSchema(comments).omit({
  createdAt: true,
  updatedAt: true,
  userId: true,
});

export const commentSelectSchema = createSelectSchema(comments);

export const commentUpdateSchema = createUpdateSchema(comments).omit({
  createdAt: true,
  updatedAt: true,
  userId: true,
  postId: true,
  parentId: true,
});
