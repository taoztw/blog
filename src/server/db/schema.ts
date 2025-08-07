import { relations, sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";
import type { AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `blog_${name}`);

export const ROLES_ENUM = {
  ADMIN: "admin",
  USER: "user",
} as const;
export const POST_STATUS_ENUM = {
  DRAFT: "draft",
  PUBLISHED: "published",
};

const roleTuple = Object.values(ROLES_ENUM) as [string, ...string[]];
const POST_STATUS_TUPLE = Object.values(POST_STATUS_ENUM) as [string, ...string[]];

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

export const categorys = createTable("category", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 255 }).notNull(),
  description: text("description", { length: 512 }),
  ...commonColumns,
});

export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title", { length: 512 }).notNull(),
    content: text("content").notNull(),
    excerpt: text("excerpt"),
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

// 评论表

export const users = createTable(
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

export const accounts = createTable(
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
