import { relations } from "drizzle-orm";
import { categorys } from "./categories";
import { posts, postTags } from "./posts";
import { projects, projectTags } from "./projects";
import { tags } from "./tags";

export const categoryRelations = relations(categorys, ({ many }) => ({
  posts: many(posts),
  projects: many(projects),
}));

export const tagRelations = relations(tags, ({ many }) => ({
  posts: many(postTags),
  projects: many(projectTags),
}));
