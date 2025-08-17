import { relations, sql } from "drizzle-orm";
import { index, integer, primaryKey, text, sqliteTable, foreignKey } from "drizzle-orm/sqlite-core";
import type { AdapterAccount } from "next-auth/adapters";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
// export const createTable = sqliteTableCreator((name) => `blog_${name}`);

// === ENUM

export const ROLES_ENUM = {
  ADMIN: "admin",
  USER: "user",
} as const;
export const POST_STATUS_ENUM = {
  DRAFT: "draft",
  PUBLISHED: "published",
};
export const REACTION_ENUM = {
  LIKE: "like",
  DISLIKE: "dislike",
};

const roleTuple = Object.values(ROLES_ENUM) as [string, ...string[]];
const POST_STATUS_TUPLE = Object.values(POST_STATUS_ENUM) as [string, ...string[]];
const reactionTuple = Object.values(REACTION_ENUM) as [string, ...string[]];

const commonColumns = {
  createdAt: integer({
    mode: "timestamp",
  })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer({
    mode: "timestamp",
  })
    .$onUpdateFn(() => new Date())
    .notNull(),
  updateCounter: integer()
    .default(0)
    .$onUpdate(() => sql`updateCounter + 1`),
};

export const users = sqliteTable(
  "user",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name", { length: 255 }),
    email: text("email", { length: 255 }).notNull(),
    role: text("role", { enum: roleTuple }).default(ROLES_ENUM.USER).notNull(),
    image: text("image", { length: 255 }),
    location: text("location", { length: 255 }),
    ...commonColumns,
  },
  (table) => [index("email_idx").on(table.email)]
);

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = sqliteTable(
  "account",
  {
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: text("type", { length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider", { length: 255 }).notNull(),
    providerAccountId: text("provider_account_id", { length: 255 }).notNull(),
    name: text("name", { length: 255 }).notNull(),
    image: text("image", { length: 255 }),
    password: text("password", { length: 300 }),
    ...commonColumns,
    // refresh_token: text("refresh_token"),
    // access_token: text("access_token"),
    // expires_at: integer("expires_at"),
    // token_type: text("token_type", { length: 255 }),
    // scope: text("scope", { length: 255 }),
    // id_token: text("id_token"),
    // session_state: text("session_state", { length: 255 })
  },
  (t) => [
    primaryKey({
      columns: [t.provider, t.providerAccountId],
    }),
    index("account_user_id_idx").on(t.userId),
  ]
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const categorys = sqliteTable("category", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }).notNull(),
  description: text("description", { length: 512 }),
  ...commonColumns,
});

export const categorySelectSchema = createSelectSchema(categorys).omit({
  updateCounter: true,
});
export const categoryInsertSchema = createInsertSchema(categorys);

export const posts = sqliteTable(
  "post",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title", { length: 512 }).notNull(),
    slug: text("slug", { length: 512 }).notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content").notNull(),
    imageUrl: text("image_url", { length: 512 }),
    status: text("status", { enum: POST_STATUS_TUPLE }).default(POST_STATUS_ENUM.DRAFT),
    viewCount: integer("view_count").default(0).notNull(),
    likeCount: integer("like_count").default(0).notNull(),
    createdById: text("created_by_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    categoryId: text("category_id", { length: 255 }).references(() => categorys.id),
    ...commonColumns,
  },
  (t) => [index("created_by_idx").on(t.createdById)]
);

export const postRelations = relations(posts, ({ one }) => ({
  category: one(categorys, {
    fields: [posts.categoryId],
    references: [categorys.id],
  }),
  author: one(users, {
    fields: [posts.createdById],
    references: [users.id],
  }),
}));

export const postReactions = sqliteTable("post_reactions", {
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id),
  type: text("type", { enum: reactionTuple }).default(""),
  ...commonColumns,
});

export const postInsertSchema = createInsertSchema(posts).omit({
  updateCounter: true,
  createdById: true,
});
export const postUpdateSchema = createUpdateSchema(posts).omit({
  createdAt: true,
  updatedAt: true,
  updateCounter: true,
});
export const postSelectSchema = createSelectSchema(posts).omit({
  updateCounter: true,
});

// 评论表
export const comments = sqliteTable(
  "comments",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
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
      .references(() => users.id),
    commentId: text("comment_id")
      .notNull()
      .references(() => comments.id),
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
