import { commentInsertSchema, commentReactions, comments, users } from "@/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import z from "zod";
import { and, count, desc, eq, getTableColumns, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { db } from "@/server/db";

export const commentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        parentId: z.string().nullish(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user.id;
      const { postId, parentId, content } = input;
      // 数据库中选择当前评论的父级评论
      const [existingCommnet] = await ctx.db
        .select()
        .from(comments)
        .where(inArray(comments.id, parentId ? [parentId] : []));
      if (parentId && !existingCommnet) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (existingCommnet?.parentId && parentId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "不能回复二级评论" });
      }

      const newComment = await ctx.db.insert(comments).values({ postId, parentId, content, userId }).returning().get();
      return newComment;
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const userId = ctx.session?.user.id;

      const [deletedComment] = await ctx.db
        .delete(comments)
        .where(and(eq(comments.id, id), eq(comments.userId, userId)))
        .returning();

      if (!deletedComment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found or you are not the author" });
      }

      return deletedComment;
    }),
  getMany: publicProcedure
    .input(
      z.object({
        postId: z.string(),
        parentId: z.string().optional(),
        cursor: z.object({ id: z.string(), updatedAt: z.date() }).nullish(), // for pagination
        limit: z.number().min(1).max(100).default(10), // for pagination
      })
    )
    .query(async ({ ctx, input }) => {
      const { postId, parentId, cursor, limit = 10 } = input;
      const userId = ctx.session?.user.id;

      const userReactions = ctx.db.$with("comment_reactions").as(
        ctx.db
          .select({
            commentId: commentReactions.commentId,
            type: commentReactions.type,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : []))
      );
      const replies = ctx.db.$with("replies").as(
        ctx.db
          .select({
            parentId: comments.parentId,
            count: count(comments.id).as("count"),
          })
          .from(comments)
          .where(isNotNull(comments.parentId))
          .groupBy(comments.parentId)
      );

      const [totalData, commentsList] = await Promise.all([
        ctx.db
          .select({
            count: count(),
          })
          .from(comments)
          .where(eq(comments.postId, postId)),

        ctx.db
          .with(userReactions, replies)
          .select({
            ...getTableColumns(comments),
            viewerReaction: userReactions.type,
            user: users,
            replyCount: replies.count,
            likeCount: ctx.db.$count(
              commentReactions,
              and(eq(commentReactions.commentId, comments.id), eq(commentReactions.type, "like"))
            ),
            dislikeCount: ctx.db.$count(
              commentReactions,
              and(eq(commentReactions.commentId, comments.id), eq(commentReactions.type, "dislike"))
            ),
          })
          .from(comments)
          .where(
            and(
              eq(comments.postId, postId),
              parentId ? eq(comments.parentId, parentId) : isNull(comments.parentId),
              cursor
                ? or(
                    lt(comments.updatedAt, cursor.updatedAt),
                    and(
                      eq(comments.updatedAt, cursor.updatedAt), // 处理updatedAt相同的情况，通过id进行排序
                      lt(comments.id, cursor.id)
                    )
                  )
                : undefined
            )
          )
          .innerJoin(users, eq(comments.userId, users.id))
          .orderBy(desc(comments.updatedAt), desc(comments.id))
          .leftJoin(userReactions, eq(userReactions.commentId, comments.id))
          .leftJoin(replies, eq(comments.id, replies.parentId))
          .limit(limit + 1),
      ]);
      const hasMore = commentsList.length > limit;
      const items = hasMore ? commentsList.slice(0, -1) : commentsList;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore && lastItem ? { id: lastItem.id, updateAt: lastItem.updatedAt } : null;
      return {
        items,
        totalCount: totalData[0]?.count ?? 0,
        nextCursor,
      };
    }),
});
