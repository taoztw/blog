import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { categoryInsertSchema, categorys, categorySelectSchema, posts } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, or, sql } from "drizzle-orm";
import z from "zod";

export const categoryRouter = createTRPCRouter({
  create: protectedProcedure.input(categoryInsertSchema).mutation(async ({ ctx, input }) => {
    const validateFields = categoryInsertSchema.safeParse(input);
    if (!validateFields.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input data" });
    }

    const [insertedCategory] = await ctx.db.insert(categorys).values(validateFields.data).returning();

    if (!insertedCategory) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create category" });
    }

    console.log("Inserted category:", insertedCategory);
    return {
      message: "Category created successfully",
      category: insertedCategory,
    };
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const { id } = input;
    const [deletedCategory] = await ctx.db.delete(categorys).where(eq(categorys.id, id)).returning();

    if (!deletedCategory) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
    }
    return {
      message: "Category deleted successfully",
      category: deletedCategory,
    };
  }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: categoryInsertSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const validateFields = categoryInsertSchema.safeParse(data);
      if (!validateFields.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input data" });
      }

      const [updatedCategory] = await ctx.db
        .update(categorys)
        .set(validateFields.data)
        .where(eq(categorys.id, id))
        .returning();

      if (!updatedCategory) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
      }

      return {
        message: "Category updated successfully",
        category: updatedCategory,
      };
    }),
  getMany: publicProcedure
    .input(
      z.object({
        cursor: z.object({ id: z.string(), createdAt: z.date() }).nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const data = await ctx.db
        .select()
        .from(categorys)
        .where(
          cursor
            ? or(
                lt(categorys.createdAt, cursor.createdAt),
                and(
                  eq(categorys.createdAt, cursor.createdAt), // 处理createdAt相同的情况，通过id进行排序
                  lt(categorys.id, cursor.id)
                )
              )
            : undefined
        )
        .orderBy(desc(categorys.createdAt))
        .limit(limit + 1);

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;

      const lastItem = items[items.length - 1];
      const nextCursor = hasMore ? { id: lastItem!.id, createdAt: lastItem!.createdAt } : null;

      return {
        items,
        nextCursor,
      };
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.select().from(categorys).orderBy(desc(categorys.createdAt));
    return data;
  }),

  // Get categories with post counts
  getWithPostCounts: publicProcedure.query(async ({ ctx }) => {
    const categoriesWithCounts = await ctx.db
      .select({
        id: categorys.id,
        name: categorys.name,
        description: categorys.description,
        postCount: ctx.db.$count(posts, and(eq(posts.categoryId, categorys.id), eq(posts.status, "published"))),
      })
      .from(categorys)
      .leftJoin(posts, eq(posts.categoryId, categorys.id))
      .groupBy(categorys.id)
      .having(sql`COUNT(${posts.id}) > 0`)
      .orderBy(desc(sql`COUNT(${posts.id})`), categorys.name);

    return categoriesWithCounts;
  }),
});
