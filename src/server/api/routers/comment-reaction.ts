import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { commentReactions } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export const commentReactionRouter = createTRPCRouter({
  like: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { commentId } = input;

      const [existingCommentReaction] = await ctx.db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.userId, userId),
            eq(commentReactions.type, "like")
          )
        );

      if (existingCommentReaction) {
        const [deleteCommentReaction] = await ctx.db
          .delete(commentReactions)
          .where(and(eq(commentReactions.commentId, commentId), eq(commentReactions.userId, userId)))
          .returning();

        return deleteCommentReaction;
      }
      const newCommentReaction = await ctx.db
        .insert(commentReactions)
        .values({ commentId, userId, type: "like" })
        .onConflictDoUpdate({
          target: [commentReactions.commentId, commentReactions.userId],
          set: { type: "like" },
        })
        .returning()
        .get();
      return newCommentReaction;
    }),
  dislike: protectedProcedure.input(z.object({ commentId: z.string() })).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const { commentId } = input;

    const [existingCommentReactionsDislike] = await ctx.db
      .select()
      .from(commentReactions)
      .where(
        and(
          eq(commentReactions.userId, userId),
          eq(commentReactions.commentId, commentId),
          eq(commentReactions.type, "dislike")
        )
      );

    // 不返回错误 防止trpc重试
    if (existingCommentReactionsDislike) {
      const [deleteCommentReaction] = await ctx.db
        .delete(commentReactions)
        .where(and(eq(commentReactions.userId, userId), eq(commentReactions.commentId, commentId)))
        .returning();
      return deleteCommentReaction;
    }

    const [createdCommentReactionsDislike] = await ctx.db
      .insert(commentReactions)
      .values({ userId, commentId, type: "dislike" })
      .onConflictDoUpdate({
        target: [commentReactions.commentId, commentReactions.userId],
        set: {
          type: "dislike",
        },
      })
      .returning();

    return createdCommentReactionsDislike;
  }),
});
