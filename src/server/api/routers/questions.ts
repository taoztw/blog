import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  QUESTION_STATUS_ENUM,
  questionInsertSchema,
  questionInsertWithTagsSchema,
  questions,
  questionTags,
  questionUpdateSchema,
  questionUpdateWithTagsSchema,
  questionViews,
  tags,
  user,
  VOTE_TYPE_ENUM,
  votes,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, inArray, like, or, sql } from "drizzle-orm";
import z from "zod";

export const questionRouter = createTRPCRouter({
  // Create question
  create: protectedProcedure.input(questionInsertSchema).mutation(async ({ ctx, input }) => {
    const validate = questionInsertSchema.safeParse(input);
    if (!validate.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid question data" });
    }

    const [insertedQuestion] = await ctx.db
      .insert(questions)
      .values({
        ...validate.data,
        authorId: ctx.session.user.id,
      })
      .returning();

    if (!insertedQuestion) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create question" });
    }

    return {
      message: "Question created successfully",
      question: insertedQuestion,
    };
  }),

  // Create question with tags
  createWithTags: protectedProcedure.input(questionInsertWithTagsSchema).mutation(async ({ ctx, input }) => {
    const { tagIds, ...questionData } = input;
    const validate = questionInsertSchema.safeParse(questionData);
    if (!validate.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid question data" });
    }

    const [insertedQuestion] = await ctx.db
      .insert(questions)
      .values({
        ...validate.data,
        authorId: ctx.session.user.id,
      })
      .returning();

    if (!insertedQuestion) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create question" });
    }

    if (tagIds && tagIds.length > 0) {
      const tagValues = tagIds.map((tagId) => ({
        questionId: insertedQuestion.id,
        tagId,
      }));
      await ctx.db.insert(questionTags).values(tagValues);
    }

    return {
      message: "Question created successfully",
      question: insertedQuestion,
    };
  }),

  // Update question
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: questionUpdateSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const validate = questionUpdateSchema.safeParse(data);
      if (!validate.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid question data" });
      }

      const [updatedQuestion] = await ctx.db
        .update(questions)
        .set(validate.data)
        .where(eq(questions.id, id))
        .returning();

      if (!updatedQuestion) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      }

      return {
        message: "Question updated successfully",
        question: updatedQuestion,
      };
    }),

  // Update question with tags
  updateWithTags: protectedProcedure
    .input(z.object({ id: z.string(), data: questionUpdateWithTagsSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const { tagIds, ...questionData } = data;
      const validate = questionUpdateSchema.safeParse(questionData);
      if (!validate.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid question data" });
      }

      const [updatedQuestion] = await ctx.db
        .update(questions)
        .set(validate.data)
        .where(eq(questions.id, id))
        .returning();

      if (!updatedQuestion) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
      }

      if (tagIds !== undefined) {
        await ctx.db.delete(questionTags).where(eq(questionTags.questionId, id));
        if (tagIds.length > 0) {
          const tagValues = tagIds.map((tagId) => ({
            questionId: id,
            tagId,
          }));
          await ctx.db.insert(questionTags).values(tagValues);
        }
      }

      return {
        message: "Question updated successfully",
        question: updatedQuestion,
      };
    }),

  // Delete question
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const [deletedQuestion] = await ctx.db.delete(questions).where(eq(questions.id, input.id)).returning();

    if (!deletedQuestion) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
    }

    return {
      message: "Question deleted successfully",
      question: deletedQuestion,
    };
  }),

  // Get questions by page with filters
  getByPage: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        tagId: z.string().optional(),
        status: z.enum(["pending", "approved", "rejected"]).optional(),
        sortBy: z.enum(["newest", "popular", "unanswered", "frequent"]).default("newest"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, tagId, status, sortBy } = input;
      const offset = (page - 1) * limit;

      const conditions = [];

      // Only show approved questions for public users
      if (!status) {
        conditions.push(eq(questions.status, QUESTION_STATUS_ENUM.APPROVED));
      } else {
        conditions.push(eq(questions.status, status));
      }

      if (search) {
        conditions.push(
          or(
            like(sql`LOWER(${questions.title})`, `%${search.toLowerCase()}%`),
            like(sql`LOWER(${questions.content})`, `%${search.toLowerCase()}%`)
          )!
        );
      }

      let baseQuery = ctx.db
        .select({
          ...getTableColumns(questions),
          author: user,
          viewCount: ctx.db.$count(questionViews, eq(questionViews.questionId, questions.id)),
        })
        .from(questions)
        .leftJoin(user, eq(questions.authorId, user.id))
        .leftJoin(questionViews, eq(questionViews.questionId, questions.id));

      if (tagId) {
        baseQuery = baseQuery.leftJoin(questionTags, eq(questionTags.questionId, questions.id));
        conditions.push(eq(questionTags.tagId, tagId));
      }

      const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

      // Determine sort order
      let orderBy;
      switch (sortBy) {
        case "popular":
          orderBy = [sql`${questions.views} DESC`, desc(questions.createdAt)];
          break;
        case "unanswered":
          orderBy = [sql`${questions.answers} ASC`, desc(questions.createdAt)];
          break;
        case "frequent":
          orderBy = [sql`${questions.answers} DESC`, desc(questions.createdAt)];
          break;
        default: // newest
          orderBy = [desc(questions.createdAt)];
      }

      const items = await baseQuery
        .where(whereCondition)
        .groupBy(questions.id, user.id)
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset);

      // Get tags for all questions
      const questionIds = items.map((item) => item.id);
      const questionTagsData =
        questionIds.length > 0
          ? await ctx.db
              .select({
                questionId: questionTags.questionId,
                tag: tags,
              })
              .from(questionTags)
              .innerJoin(tags, eq(questionTags.tagId, tags.id))
              .where(inArray(questionTags.questionId, questionIds))
          : [];

      const tagsByQuestionId = questionTagsData.reduce(
        (acc, { questionId, tag }) => {
          if (!acc[questionId]) {
            acc[questionId] = [];
          }
          acc[questionId].push(tag);
          return acc;
        },
        {} as Record<string, (typeof tags.$inferSelect)[]>
      );

      const itemsWithTags = items.map((item) => ({
        ...item,
        tags: tagsByQuestionId[item.id] || [],
      }));

      // Get total count
      const totalResult = tagId
        ? await ctx.db
            .select({ count: sql<number>`count(DISTINCT ${questions.id})` })
            .from(questions)
            .leftJoin(questionTags, eq(questionTags.questionId, questions.id))
            .where(whereCondition)
        : await ctx.db
            .select({ count: sql<number>`count(DISTINCT ${questions.id})` })
            .from(questions)
            .where(whereCondition);
      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return { items: itemsWithTags, page, totalPages, total };
    }),

  // Get single question by ID
  getOne: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const userId = ctx.session?.user.id;

    const userVotes = ctx.db.$with("userVotes").as(
      ctx.db
        .select({
          actionId: votes.actionId,
          actionType: votes.actionType,
          voteType: votes.voteType,
        })
        .from(votes)
        .where(userId ? eq(votes.authorId, userId) : sql`1=0`)
    );

    const [question] = await ctx.db
      .with(userVotes)
      .select({
        ...getTableColumns(questions),
        author: user,
        viewCount: ctx.db.$count(questionViews, eq(questionViews.questionId, questions.id)),
        userVote: userVotes.voteType,
      })
      .from(questions)
      .leftJoin(user, eq(questions.authorId, user.id))
      .leftJoin(userVotes, and(eq(userVotes.actionId, questions.id), eq(userVotes.actionType, "question")))
      .where(eq(questions.id, input.id));

    if (!question) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
    }

    // Get tags
    const questionTagsData = await ctx.db
      .select({
        tag: tags,
      })
      .from(questionTags)
      .innerJoin(tags, eq(questionTags.tagId, tags.id))
      .where(eq(questionTags.questionId, input.id));

    const questionTags_array = questionTagsData.map(({ tag }) => tag);

    return {
      ...question,
      tags: questionTags_array,
    };
  }),

  // Create view
  createView: publicProcedure.input(z.object({ questionId: z.string() })).mutation(async ({ ctx, input }) => {
    const { questionId } = input;
    const ip = "";
    const userId = ctx.session?.user.id ?? null;

    // Check if this IP/user already viewed this question
    const existingView = await ctx.db
      .select()
      .from(questionViews)
      .where(and(eq(questionViews.questionId, questionId), eq(questionViews.ip, ip)))
      .limit(1);

    if (existingView.length === 0) {
      await ctx.db.insert(questionViews).values({ questionId, ip, userId });
      // Increment view count
      await ctx.db
        .update(questions)
        .set({ views: sql`${questions.views} + 1` })
        .where(eq(questions.id, questionId));
    }

    return { message: "View recorded" };
  }),

  // Vote on question
  vote: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        voteType: z.enum(["upvote", "downvote"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { questionId, voteType } = input;
      const userId = ctx.session.user.id;

      // Check existing vote
      const existingVote = await ctx.db
        .select()
        .from(votes)
        .where(and(eq(votes.authorId, userId), eq(votes.actionId, questionId), eq(votes.actionType, "question")))
        .limit(1);

      if (existingVote.length > 0) {
        const currentVote = existingVote[0]!;

        // If same vote, remove it
        if (currentVote.voteType === voteType) {
          await ctx.db
            .delete(votes)
            .where(and(eq(votes.authorId, userId), eq(votes.actionId, questionId), eq(votes.actionType, "question")));

          // Decrement count
          await ctx.db
            .update(questions)
            .set({
              [voteType === VOTE_TYPE_ENUM.UPVOTE ? "upvotes" : "downvotes"]: sql`${
                voteType === VOTE_TYPE_ENUM.UPVOTE ? questions.upvotes : questions.downvotes
              } - 1`,
            })
            .where(eq(questions.id, questionId));

          return { message: "Vote removed" };
        } else {
          // Change vote
          await ctx.db
            .update(votes)
            .set({ voteType })
            .where(and(eq(votes.authorId, userId), eq(votes.actionId, questionId), eq(votes.actionType, "question")));

          // Update counts
          const incrementField = voteType === VOTE_TYPE_ENUM.UPVOTE ? "upvotes" : "downvotes";
          const decrementField = voteType === VOTE_TYPE_ENUM.UPVOTE ? "downvotes" : "upvotes";

          await ctx.db
            .update(questions)
            .set({
              [incrementField]: sql`${voteType === VOTE_TYPE_ENUM.UPVOTE ? questions.upvotes : questions.downvotes} + 1`,
              [decrementField]: sql`${voteType === VOTE_TYPE_ENUM.UPVOTE ? questions.downvotes : questions.upvotes} - 1`,
            })
            .where(eq(questions.id, questionId));

          return { message: "Vote changed" };
        }
      } else {
        // New vote
        await ctx.db.insert(votes).values({
          authorId: userId,
          actionId: questionId,
          actionType: "question",
          voteType,
        });

        // Increment count
        await ctx.db
          .update(questions)
          .set({
            [voteType === VOTE_TYPE_ENUM.UPVOTE ? "upvotes" : "downvotes"]: sql`${
              voteType === VOTE_TYPE_ENUM.UPVOTE ? questions.upvotes : questions.downvotes
            } + 1`,
          })
          .where(eq(questions.id, questionId));

        return { message: "Vote recorded" };
      }
    }),

  // Approve question (admin only)
  approve: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    // Check if user is admin
    if (ctx.session.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can approve questions" });
    }

    const [approvedQuestion] = await ctx.db
      .update(questions)
      .set({ status: QUESTION_STATUS_ENUM.APPROVED })
      .where(eq(questions.id, input.id))
      .returning();

    if (!approvedQuestion) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
    }

    return {
      message: "Question approved successfully",
      question: approvedQuestion,
    };
  }),

  // Reject question (admin only)
  reject: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    // Check if user is admin
    if (ctx.session.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only admins can reject questions" });
    }

    const [rejectedQuestion] = await ctx.db
      .update(questions)
      .set({ status: QUESTION_STATUS_ENUM.REJECTED })
      .where(eq(questions.id, input.id))
      .returning();

    if (!rejectedQuestion) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Question not found" });
    }

    return {
      message: "Question rejected successfully",
      question: rejectedQuestion,
    };
  }),
});
