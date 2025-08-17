import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { posts, postInsertSchema, postUpdateSchema } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, lt, or } from "drizzle-orm";
import z from "zod";

export const postRouter = createTRPCRouter({
  // 🔹 创建文章
  create: protectedProcedure.input(postInsertSchema).mutation(async ({ ctx, input }) => {
    const validate = postInsertSchema.safeParse(input);
    if (!validate.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid post data" });
    }

    const [insertedPost] = await ctx.db
      .insert(posts)
      .values({
        ...validate.data,
        createdById: ctx.session.user.id, // 从登录用户取
      })
      .returning();

    if (!insertedPost) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create post" });
    }

    return {
      message: "Post created successfully",
      post: insertedPost,
    };
  }),

  // 🔹 删除文章
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const [deletedPost] = await ctx.db.delete(posts).where(eq(posts.id, input.id)).returning();

    if (!deletedPost) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
    }

    return {
      message: "Post deleted successfully",
      post: deletedPost,
    };
  }),

  // 🔹 更新文章
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: postUpdateSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const validate = postUpdateSchema.safeParse(data);
      if (!validate.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid post data" });
      }

      const [updatedPost] = await ctx.db.update(posts).set(validate.data).where(eq(posts.id, id)).returning();

      if (!updatedPost) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      return {
        message: "Post updated successfully",
        post: updatedPost,
      };
    }),

  // 🔹 分页获取文章（带游标）
  getMany: publicProcedure
    .input(
      z.object({
        cursor: z.object({ id: z.string(), updateAt: z.date() }).nullish(),
        limit: z.number().min(1).max(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;

      console.log("Fetching posts with cursor:", cursor, "and limit:", limit);
      const data = await ctx.db.query.posts.findMany({
        where: cursor
          ? or(lt(posts.updatedAt, cursor.updateAt), and(eq(posts.updatedAt, cursor.updateAt), lt(posts.id, cursor.id)))
          : undefined,
        orderBy: [desc(posts.createdAt)],
        limit: limit + 1,
        with: {
          author: {
            columns: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          category: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      });

      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data;
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore ? { id: lastItem!.id, updateAt: lastItem!.updatedAt } : null;

      return {
        items,
        nextCursor,
      };
    }),
});
