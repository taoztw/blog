import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  answers,
  answerInsertSchema,
  answerUpdateSchema,
  questions,
  votes,
  users,
  VOTE_TYPE_ENUM,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import z from "zod";

export const answerRouter = createTRPCRouter({
  // Create answer
  create: protectedProcedure.input(answerInsertSchema).mutation(async ({ ctx, input }) => {
    const validate = answerInsertSchema.safeParse(input);
    if (!validate.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid answer data" });
    }

    const [insertedAnswer] = await ctx.db
      .insert(answers)
      .values({
        ...validate.data,
        authorId: ctx.session.user.id,
      })
      .returning();

    if (!insertedAnswer) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create answer" });
    }

    // Increment answer count on question
    await ctx.db
      .update(questions)
      .set({ answers: sql`${questions.answers} + 1` })
      .where(eq(questions.id, validate.data.questionId));

    return {
      message: "Answer created successfully",
      answer: insertedAnswer,
    };
  }),

  // Update answer
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: answerUpdateSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const validate = answerUpdateSchema.safeParse(data);
      if (!validate.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid answer data" });
      }

      const [updatedAnswer] = await ctx.db.update(answers).set(validate.data).where(eq(answers.id, id)).returning();

      if (!updatedAnswer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Answer not found" });
      }

      return {
        message: "Answer updated successfully",
        answer: updatedAnswer,
      };
    }),

  // Delete answer
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const [deletedAnswer] = await ctx.db.delete(answers).where(eq(answers.id, input.id)).returning();

    if (!deletedAnswer) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Answer not found" });
    }

    // Decrement answer count on question
    await ctx.db
      .update(questions)
      .set({ answers: sql`${questions.answers} - 1` })
      .where(eq(questions.id, deletedAnswer.questionId));

    return {
      message: "Answer deleted successfully",
      answer: deletedAnswer,
    };
  }),

  // Get answers for a question
  getByQuestion: publicProcedure
    .input(
      z.object({
        questionId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sortBy: z.enum(["newest", "oldest", "popular"]).default("popular"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { questionId, page, limit, sortBy } = input;
      const offset = (page - 1) * limit;
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

      // Determine sort order
      let orderBy;
      switch (sortBy) {
        case "oldest":
          orderBy = [answers.createdAt];
          break;
        case "popular":
          orderBy = [sql`${answers.upvotes} - ${answers.downvotes} DESC`, desc(answers.createdAt)];
          break;
        default: // newest
          orderBy = [desc(answers.createdAt)];
      }

      const items = await ctx.db
        .with(userVotes)
        .select({
          ...getTableColumns(answers),
          author: users,
          userVote: userVotes.voteType,
        })
        .from(answers)
        .leftJoin(users, eq(answers.authorId, users.id))
        .leftJoin(userVotes, and(eq(userVotes.actionId, answers.id), eq(userVotes.actionType, "answer")))
        .where(eq(answers.questionId, questionId))
        .orderBy(...orderBy)
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(answers)
        .where(eq(answers.questionId, questionId));

      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return { items, page, totalPages, total };
    }),

  // Vote on answer
  vote: protectedProcedure
    .input(
      z.object({
        answerId: z.string(),
        voteType: z.enum(["upvote", "downvote"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { answerId, voteType } = input;
      const userId = ctx.session.user.id;

      // Check existing vote
      const existingVote = await ctx.db
        .select()
        .from(votes)
        .where(and(eq(votes.authorId, userId), eq(votes.actionId, answerId), eq(votes.actionType, "answer")))
        .limit(1);

      if (existingVote.length > 0) {
        const currentVote = existingVote[0]!;

        // If same vote, remove it
        if (currentVote.voteType === voteType) {
          await ctx.db
            .delete(votes)
            .where(and(eq(votes.authorId, userId), eq(votes.actionId, answerId), eq(votes.actionType, "answer")));

          // Decrement count
          await ctx.db
            .update(answers)
            .set({
              [voteType === VOTE_TYPE_ENUM.UPVOTE ? "upvotes" : "downvotes"]: sql`${
                voteType === VOTE_TYPE_ENUM.UPVOTE ? answers.upvotes : answers.downvotes
              } - 1`,
            })
            .where(eq(answers.id, answerId));

          return { message: "Vote removed" };
        } else {
          // Change vote
          await ctx.db
            .update(votes)
            .set({ voteType })
            .where(and(eq(votes.authorId, userId), eq(votes.actionId, answerId), eq(votes.actionType, "answer")));

          // Update counts
          const incrementField = voteType === VOTE_TYPE_ENUM.UPVOTE ? "upvotes" : "downvotes";
          const decrementField = voteType === VOTE_TYPE_ENUM.UPVOTE ? "downvotes" : "upvotes";

          await ctx.db
            .update(answers)
            .set({
              [incrementField]: sql`${voteType === VOTE_TYPE_ENUM.UPVOTE ? answers.upvotes : answers.downvotes} + 1`,
              [decrementField]: sql`${voteType === VOTE_TYPE_ENUM.UPVOTE ? answers.downvotes : answers.upvotes} - 1`,
            })
            .where(eq(answers.id, answerId));

          return { message: "Vote changed" };
        }
      } else {
        // New vote
        await ctx.db.insert(votes).values({
          authorId: userId,
          actionId: answerId,
          actionType: "answer",
          voteType,
        });

        // Increment count
        await ctx.db
          .update(answers)
          .set({
            [voteType === VOTE_TYPE_ENUM.UPVOTE ? "upvotes" : "downvotes"]: sql`${
              voteType === VOTE_TYPE_ENUM.UPVOTE ? answers.upvotes : answers.downvotes
            } + 1`,
          })
          .where(eq(answers.id, answerId));

        return { message: "Vote recorded" };
      }
    }),
});
