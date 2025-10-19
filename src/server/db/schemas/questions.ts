import { relations } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { user } from "./auth";
import { commonColumns } from "./common";
import { QUESTION_STATUS_ENUM, QUESTION_STATUS_TUPLE, VOTE_TYPE_TUPLE } from "./enums";
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
      .references(() => user.id),
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
      .references(() => user.id),
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
      .references(() => user.id),
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
  userId: text("user_id").references(() => user.id),
  ip: text("ip", { length: 255 }).notNull(),
  ...commonColumns,
});

// Relations
export const questionRelations = relations(questions, ({ one, many }) => ({
  author: one(user, {
    fields: [questions.authorId],
    references: [user.id],
  }),
  tags: many(questionTags),
  answers: many(answers),
  views: many(questionViews),
}));

export const answerRelations = relations(answers, ({ one }) => ({
  author: one(user, {
    fields: [answers.authorId],
    references: [user.id],
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
  user: one(user, {
    fields: [questionViews.userId],
    references: [user.id],
  }),
}));

export const voteRelations = relations(votes, ({ one }) => ({
  author: one(user, {
    fields: [votes.authorId],
    references: [user.id],
  }),
}));

// Zod Schemas
export const questionInsertSchema = createInsertSchema(questions).omit({
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
  authorId: true,
});

export const questionUpdateWithTagsSchema = questionUpdateSchema.extend({
  tagIds: z.array(z.string()).optional(),
});

export const questionSelectSchema = createSelectSchema(questions);

export const answerInsertSchema = createInsertSchema(answers).omit({
  authorId: true,
  upvotes: true,
  downvotes: true,
  createdAt: true,
  updatedAt: true,
});

export const answerUpdateSchema = createUpdateSchema(answers).omit({
  createdAt: true,
  updatedAt: true,
  authorId: true,
  questionId: true,
});

export const answerSelectSchema = createSelectSchema(answers);

export const voteInsertSchema = createInsertSchema(votes).omit({
  authorId: true,
  createdAt: true,
  updatedAt: true,
});

export const voteSelectSchema = createSelectSchema(votes);
