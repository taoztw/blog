import { relations } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";
import { categorys } from "./categories";
import { commonColumns } from "./common";
import { POST_STATUS_ENUM, POST_STATUS_TUPLE, reactionTuple } from "./enums";
import { tags } from "./tags";

export const posts = sqliteTable(
  "post",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title", { length: 512 }).notNull(),
    slug: text("slug", { length: 512 }).notNull().unique(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    imageUrl: text("image_url", { length: 512 }),
    status: text("status", { enum: POST_STATUS_TUPLE }).default(POST_STATUS_ENUM.DRAFT),
    createdById: text("created_by_id", { length: 255 })
      .notNull()
      .references(() => user.id),
    categoryId: text("category_id", { length: 255 }).references(() => categorys.id),
    ...commonColumns,
  },
  (t) => [index("created_by_idx").on(t.createdById)]
);

export const postViews = sqliteTable("post_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id),
  userId: text("user_id").references(() => user.id),
  ip: text("ip", { length: 255 }).notNull(),
  ...commonColumns,
});

export const postTags = sqliteTable(
  "post_tags",
  {
    postId: text("post_id", { length: 255 })
      .notNull()
      .references(() => posts.id),
    tagId: text("tag_id", { length: 255 })
      .notNull()
      .references(() => tags.id),
    ...commonColumns,
  },
  (table) => [
    primaryKey({
      columns: [table.postId, table.tagId],
    }),
  ]
);

export const postReactions = sqliteTable("post_reactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ip: text("ip", { length: 255 }).notNull(),
  userId: text("user_id").references(() => user.id),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id),
  num: integer("num").default(0),
  type: text("type", { enum: reactionTuple }).default(""),
  ...commonColumns,
});

export const postRelations = relations(posts, ({ one, many }) => ({
  category: one(categorys, {
    fields: [posts.categoryId],
    references: [categorys.id],
  }),
  author: one(user, {
    fields: [posts.createdById],
    references: [user.id],
  }),
  tags: many(postTags),
}));

export const postTagRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const postInsertSchema = createInsertSchema(posts).omit({
  createdById: true,
});

export const postInsertWithTagsSchema = postInsertSchema.extend({
  tagIds: z.array(z.string()).optional(),
});

export const postUpdateSchema = createUpdateSchema(posts).omit({
  createdAt: true,
  updatedAt: true,
});

export const postUpdateWithTagsSchema = postUpdateSchema.extend({
  tagIds: z.array(z.string()).optional(),
});

export const postSelectSchema = createSelectSchema(posts);
