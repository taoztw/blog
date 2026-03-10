import { journalComments, user } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, isNull, sql } from "drizzle-orm";
import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const journalCommentsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        journalId: z.string(),
        parentId: z.string().nullish(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { journalId, parentId, content } = input;

      const newComment = await ctx.db
        .insert(journalComments)
        .values({ journalId, parentId: parentId ?? null, content, userId })
        .returning()
        .get();

      return newComment;
    }),

  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [deleted] = await ctx.db
        .delete(journalComments)
        .where(and(eq(journalComments.id, input.id), eq(journalComments.userId, userId)))
        .returning();

      if (!deleted) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return deleted;
    }),

  getMany: publicProcedure
    .input(z.object({ journalId: z.string(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .select({
          ...getTableColumns(journalComments),
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
          replyCount:
            sql<number>`(SELECT COUNT(*) FROM journal_comments r WHERE r.parent_id = ${journalComments.id})`,
        })
        .from(journalComments)
        .leftJoin(user, eq(journalComments.userId, user.id))
        .where(
          and(
            eq(journalComments.journalId, input.journalId),
            isNull(journalComments.parentId)
          )
        )
        .orderBy(desc(journalComments.createdAt))
        .limit(input.limit);

      const [totalResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(journalComments)
        .where(eq(journalComments.journalId, input.journalId));

      return { items, total: totalResult?.count ?? 0 };
    }),

  getReplies: publicProcedure
    .input(z.object({ parentId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select({
          ...getTableColumns(journalComments),
          user: {
            id: user.id,
            name: user.name,
            image: user.image,
          },
        })
        .from(journalComments)
        .leftJoin(user, eq(journalComments.userId, user.id))
        .where(eq(journalComments.parentId, input.parentId))
        .orderBy(desc(journalComments.createdAt));
    }),
});
