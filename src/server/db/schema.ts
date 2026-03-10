/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
// export const createTable = sqliteTableCreator((name) => `blog_${name}`);

// Re-export all schemas from the schemas directory
export * from "./schemas/auth";
export * from "./schemas/categories";
export * from "./schemas/comments";
export * from "./schemas/common";
export * from "./schemas/enums";
export * from "./schemas/journal-comments";
export * from "./schemas/journals";
export * from "./schemas/posts";
export * from "./schemas/projects";
export * from "./schemas/questions";
export * from "./schemas/relations";
export * from "./schemas/statistics";
export * from "./schemas/tags";
