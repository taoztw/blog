import { relations } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";
import { categorys } from "./categories";
import { commonColumns } from "./common";
import { PROJECT_STATUS_ENUM, PROJECT_STATUS_TUPLE } from "./enums";
import { tags } from "./tags";

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
    categoryId: text("category_id", { length: 255 })
      .notNull()
      .references(() => categorys.id),
    status: text("status", { enum: PROJECT_STATUS_TUPLE }).default(PROJECT_STATUS_ENUM.DRAFT),
    githubUrl: text("github_url", { length: 512 }),
    demoUrl: text("demo_url", { length: 512 }),
    blogUrl: text("blog_url", { length: 512 }),
    sortOrder: integer("sort_order").default(0),
    createdById: text("created_by_id", { length: 255 })
      .notNull()
      .references(() => user.id),
    ...commonColumns,
  },
  (t) => [
    index("project_created_by_idx").on(t.createdById),
    index("project_category_idx").on(t.categoryId),
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
  author: one(user, {
    fields: [projects.createdById],
    references: [user.id],
  }),
  category: one(categorys, {
    fields: [projects.categoryId],
    references: [categorys.id],
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
  createdById: true,
});

export const projectInsertWithTagsSchema = projectInsertSchema.extend({
  tagIds: z.array(z.string()).optional(),
});

export const projectUpdateSchema = createUpdateSchema(projects).omit({
  createdAt: true,
  updatedAt: true,
});

export const projectUpdateWithTagsSchema = projectUpdateSchema.extend({
  tagIds: z.array(z.string()).optional(),
});

export const projectSelectSchema = createSelectSchema(projects);
