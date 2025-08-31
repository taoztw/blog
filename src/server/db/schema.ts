import { relations, sql } from "drizzle-orm";
import { index, integer, primaryKey, text, sqliteTable, foreignKey } from "drizzle-orm/sqlite-core";
import type { AdapterAccount } from "next-auth/adapters";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";

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

export const PROJECT_STATUS_ENUM = {
  DRAFT: "draft",
  PUBLISHED: "published",
};

export const PROJECT_TYPE_ENUM = {
  FRONTEND: "frontend",
  BACKEND: "backend", 
  MOBILE: "mobile",
  TOOL: "tool",
  AI: "ai",
  OTHER: "other",
};

const roleTuple = Object.values(ROLES_ENUM) as [string, ...string[]];
const POST_STATUS_TUPLE = Object.values(POST_STATUS_ENUM) as [string, ...string[]];
const PROJECT_STATUS_TUPLE = Object.values(PROJECT_STATUS_ENUM) as [string, ...string[]];
const PROJECT_TYPE_TUPLE = Object.values(PROJECT_TYPE_ENUM) as [string, ...string[]];
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

export const userSelectSchema = createSelectSchema(users).omit({
  updateCounter: true,
});

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

// 英语单词拼错了,... 其他文件都需要改，先不改了
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

export const tags = sqliteTable("tag", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name", { length: 255 }).notNull().unique(),
  description: text("description", { length: 512 }),
  color: text("color", { length: 7 }), // hex color code
  ...commonColumns,
});

export const tagSelectSchema = createSelectSchema(tags).omit({
  updateCounter: true,
});
export const tagInsertSchema = createInsertSchema(tags);


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
    createdById: text("created_by_id", { length: 255 })
      .notNull()
      .references(() => users.id),
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
  userId: text("user_id").references(() => users.id),
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

export const postRelations = relations(posts, ({ one, many }) => ({
  category: one(categorys, {
    fields: [posts.categoryId],
    references: [categorys.id],
  }),
  author: one(users, {
    fields: [posts.createdById],
    references: [users.id],
  }),
  tags: many(postTags),
}));

export const tagRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
  projects: many(projectTags),
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

export const postReactions = sqliteTable("post_reactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ip: text("ip", { length: 255 }).notNull(),
  userId: text("user_id").references(() => users.id),
  postId: text("post_id")
    .notNull()
    .references(() => posts.id),
  num: integer("num").default(0),
  type: text("type", { enum: reactionTuple }).default(""),
  ...commonColumns,
});

export const postInsertSchema = createInsertSchema(posts).omit({
  updateCounter: true,
  createdById: true,
});

export const postInsertWithTagsSchema = postInsertSchema.extend({
  tagIds: z.array(z.string()).optional(),
});

export const postUpdateSchema = createUpdateSchema(posts).omit({
  createdAt: true,
  updatedAt: true,
  updateCounter: true,
});

export const postUpdateWithTagsSchema = postUpdateSchema.extend({
  tagIds: z.array(z.string()).optional(),
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

export const commentInsertSchema = createInsertSchema(comments).omit({
  updateCounter: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});
export const commentSelectSchema = createSelectSchema(comments).omit({
  updateCounter: true,
});
export const commentUpdateSchema = createUpdateSchema(comments).omit({
  createdAt: true,
  updatedAt: true,
  updateCounter: true,
  userId: true,
  postId: true,
  parentId: true,
});

export const commentReactions = sqliteTable(
  "comment_reactions",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
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

// Projects 表
export const projects = sqliteTable(
  "project",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title", { length: 512 }).notNull(),
    description: text("description").notNull(),
    imageUrl: text("image_url", { length: 512 }),
    type: text("type", { enum: PROJECT_TYPE_TUPLE }).notNull(),
    status: text("status", { enum: PROJECT_STATUS_TUPLE }).default(PROJECT_STATUS_ENUM.DRAFT),
    githubUrl: text("github_url", { length: 512 }),
    demoUrl: text("demo_url", { length: 512 }),
    blogUrl: text("blog_url", { length: 512 }),
    sortOrder: integer("sort_order").default(0),
    createdById: text("created_by_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    ...commonColumns,
  },
  (t) => [
    index("project_created_by_idx").on(t.createdById),
    index("project_type_idx").on(t.type),
    index("project_status_idx").on(t.status),
  ]
);

export const projectTags = sqliteTable(
  "project_tags",
  {
    projectId: text("project_id", { length: 255 })
      .notNull()
      .references(() => projects.id),
    tagId: text("tag_id", { length: 255 })
      .notNull()
      .references(() => tags.id),
    ...commonColumns,
  },
  (table) => [
    primaryKey({
      columns: [table.projectId, table.tagId],
    }),
  ]
);

export const projectRelations = relations(projects, ({ one, many }) => ({
  author: one(users, {
    fields: [projects.createdById],
    references: [users.id],
  }),
  tags: many(projectTags),
}));

export const projectTagRelations = relations(projectTags, ({ one }) => ({
  project: one(projects, {
    fields: [projectTags.projectId],
    references: [projects.id],
  }),
  tag: one(tags, {
    fields: [projectTags.tagId],
    references: [tags.id],
  }),
}));

export const projectInsertSchema = createInsertSchema(projects).omit({
  updateCounter: true,
  createdById: true,
});

export const projectInsertWithTagsSchema = projectInsertSchema.extend({
  tagIds: z.array(z.string()).optional(),
});

export const projectUpdateSchema = createUpdateSchema(projects).omit({
  createdAt: true,
  updatedAt: true,
  updateCounter: true,
});

export const projectUpdateWithTagsSchema = projectUpdateSchema.extend({
  tagIds: z.array(z.string()).optional(),
});

export const projectSelectSchema = createSelectSchema(projects).omit({
  updateCounter: true,
});
