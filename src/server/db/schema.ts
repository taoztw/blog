/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
// export const createTable = sqliteTableCreator((name) => `blog_${name}`);

// Re-export all schemas from the schemas directory
export * from "./schemas/enums";
export * from "./schemas/common";
export * from "./schemas/users";
export * from "./schemas/categories";
export * from "./schemas/tags";
export * from "./schemas//posts";
export * from "./schemas/comments";
export * from "./schemas/projects";
export * from "./schemas/questions";
export * from "./schemas/journals";
export * from "./schemas/relations";
