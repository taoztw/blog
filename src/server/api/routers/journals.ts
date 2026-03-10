import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { journalComments, journalInsertSchema, journals, journalUpdateSchema, user } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import z from "zod";

export const journalRouter = createTRPCRouter({
  // Create journal
  create: protectedProcedure.input(journalInsertSchema).mutation(async ({ ctx, input }) => {
    const validate = journalInsertSchema.safeParse(input);
    if (!validate.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid journal data" });
    }

    const [insertedJournal] = await ctx.db
      .insert(journals)
      .values({
        ...validate.data,
        authorId: ctx.session.user.id,
      })
      .returning();

    if (!insertedJournal) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create journal" });
    }

    return {
      message: "Journal created successfully",
      journal: insertedJournal,
    };
  }),

  // Update journal
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: journalUpdateSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const validate = journalUpdateSchema.safeParse(data);
      if (!validate.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid journal data" });
      }

      const [updatedJournal] = await ctx.db.update(journals).set(validate.data).where(eq(journals.id, id)).returning();

      if (!updatedJournal) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Journal not found" });
      }

      return {
        message: "Journal updated successfully",
        journal: updatedJournal,
      };
    }),

  // Delete journal
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const [deletedJournal] = await ctx.db.delete(journals).where(eq(journals.id, input.id)).returning();

    if (!deletedJournal) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Journal not found" });
    }

    return {
      message: "Journal deleted successfully",
      journal: deletedJournal,
    };
  }),

  // Get journals by page
  getByPage: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        authorId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, authorId } = input;
      const offset = (page - 1) * limit;

      const whereCondition = authorId ? eq(journals.authorId, authorId) : undefined;

      const items = await ctx.db
        .select({
          ...getTableColumns(journals),
          author: user,
          commentCount:
            sql<number>`(SELECT COUNT(*) FROM ${journalComments} WHERE ${journalComments.journalId} = ${journals.id})`,
        })
        .from(journals)
        .leftJoin(user, eq(journals.authorId, user.id))
        .where(whereCondition)
        .orderBy(desc(journals.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count
      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(journals)
        .where(whereCondition);

      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return { items, page, totalPages, total };
    }),

  // Get single journal by ID
  getOne: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const [journal] = await ctx.db
      .select({
        ...getTableColumns(journals),
        author: user,
      })
      .from(journals)
      .leftJoin(user, eq(journals.authorId, user.id))
      .where(eq(journals.id, input.id));

    if (!journal) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Journal not found" });
    }

    return journal;
  }),
});
