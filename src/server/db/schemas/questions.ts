import { relations } from "drizzle-orm";
import { index, integer, text, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { QUESTION_STATUS_TUPLE, QUESTION_STATUS_ENUM, VOTE_TYPE_TUPLE } from "./enums";
import { commonColumns } from "./common";
import { users } from "./users";
import { tags } from "./tags";

// Questions table
export const questions = sqliteTable(
  "question",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title", { length: 512 }).notNull(),
    content: text("content").notNull(),
    authorId: text("author_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    views: integer("views").default(0).notNull(),
    upvotes: integer("upvotes").default(0).notNull(),
    downvotes: integer("downvotes").default(0).notNull(),
    answers: integer("answers").default(0).notNull(),
    status: text("status", { enum: QUESTION_STATUS_TUPLE }).default(QUESTION_STATUS_ENUM.PENDING),
    ...commonColumns,
  },
  (t) => [index("question_author_idx").on(t.authorId), index("question_status_idx").on(t.status)]
);

// Answers table
export const answers = sqliteTable(
  "answer",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    authorId: text("author_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    questionId: text("question_id", { length: 255 })
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    upvotes: integer("upvotes").default(0).notNull(),
    downvotes: integer("downvotes").default(0).notNull(),
    ...commonColumns,
  },
  (t) => [index("answer_question_idx").on(t.questionId), index("answer_author_idx").on(t.authorId)]
);

// Question Tags junction table
export const questionTags = sqliteTable(
  "question_tags",
  {
    questionId: text("question_id", { length: 255 })
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    tagId: text("tag_id", { length: 255 })
      .notNull()
      .references(() => tags.id),
    ...commonColumns,
  },
  (table) => [
    primaryKey({
      columns: [table.questionId, table.tagId],
    }),
  ]
);

// Votes table for questions and answers
export const votes = sqliteTable(
  "vote",
  {
    id: text("id", { length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    authorId: text("author_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    actionId: text("action_id", { length: 255 }).notNull(),
    actionType: text("action_type", { enum: ["question", "answer"] }).notNull(),
    voteType: text("vote_type", { enum: VOTE_TYPE_TUPLE }).notNull(),
    ...commonColumns,
  },
  (t) => [index("vote_action_idx").on(t.actionId, t.actionType), index("vote_author_idx").on(t.authorId)]
);

// Question Views tracking
export const questionViews = sqliteTable("question_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questionId: text("question_id")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id),
  ip: text("ip", { length: 255 }).notNull(),
  ...commonColumns,
});

// Relations
export const questionRelations = relations(questions, ({ one, many }) => ({
  author: one(users, {
    fields: [questions.authorId],
    references: [users.id],
  }),
  tags: many(questionTags),
  answers: many(answers),
  views: many(questionViews),
}));

export const answerRelations = relations(answers, ({ one }) => ({
  author: one(users, {
    fields: [answers.authorId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

export const questionTagRelations = relations(questionTags, ({ one }) => ({
  question: one(questions, {
    fields: [questionTags.questionId],
    references: [questions.id],
  }),
  tag: one(tags, {
    fields: [questionTags.tagId],
    references: [tags.id],
  }),
}));

export const questionViewRelations = relations(questionViews, ({ one }) => ({
  question: one(questions, {
    fields: [questionViews.questionId],
    references: [questions.id],
  }),
  user: one(users, {
    fields: [questionViews.userId],
    references: [users.id],
  }),
}));

export const voteRelations = relations(votes, ({ one }) => ({
  author: one(users, {
    fields: [votes.authorId],
    references: [users.id],
  }),
}));

// Zod Schemas
export const questionInsertSchema = createInsertSchema(questions).omit({
  updateCounter: true,
  authorId: true,
  views: true,
  upvotes: true,
  downvotes: true,
  answers: true,
  createdAt: true,
  updatedAt: true,
});

export const questionInsertWithTagsSchema = questionInsertSchema.extend({
  tagIds: z.array(z.string()).optional(),
});

export const questionUpdateSchema = createUpdateSchema(questions).omit({
  createdAt: true,
  updatedAt: true,
  updateCounter: true,
  authorId: true,
});

export const questionUpdateWithTagsSchema = questionUpdateSchema.extend({
  tagIds: z.array(z.string()).optional(),
});

export const questionSelectSchema = createSelectSchema(questions).omit({
  updateCounter: true,
});

export const answerInsertSchema = createInsertSchema(answers).omit({
  updateCounter: true,
  authorId: true,
  upvotes: true,
  downvotes: true,
  createdAt: true,
  updatedAt: true,
});

export const answerUpdateSchema = createUpdateSchema(answers).omit({
  createdAt: true,
  updatedAt: true,
  updateCounter: true,
  authorId: true,
  questionId: true,
});

export const answerSelectSchema = createSelectSchema(answers).omit({
  updateCounter: true,
});

export const voteInsertSchema = createInsertSchema(votes).omit({
  updateCounter: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
});

export const voteSelectSchema = createSelectSchema(votes).omit({
  updateCounter: true,
});
