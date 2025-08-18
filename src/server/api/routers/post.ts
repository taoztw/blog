import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { posts, postInsertSchema, postUpdateSchema, categorys, users } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike, like, lt, or, sql } from "drizzle-orm";
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

  getByPage: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search } = input;
      const offset = (page - 1) * limit;

      const where = search
        ? or(
            like(sql`LOWER(${posts.title})`, `%${search.toLowerCase()}%`),
            like(sql`LOWER(${posts.excerpt})`, `%${search.toLowerCase()}%`),
            like(sql`LOWER(${categorys.name})`, `%${search.toLowerCase()}%`)
          )
        : undefined;

      // 主查询+关联
      const items = await ctx.db
        .select({
          id: posts.id,
          title: posts.title,
          excerpt: posts.excerpt,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          imageUrl: posts.imageUrl,
          status: posts.status,
          viewCount: posts.viewCount,
          likeCount: posts.likeCount,
          author: {
            id: users.id,
            name: users.name,
            email: users.email,
            image: users.image,
          },
          category: {
            id: categorys.id,
            name: categorys.name,
          },
        })
        .from(posts)
        .leftJoin(categorys, eq(posts.categoryId, categorys.id))
        .leftJoin(users, eq(posts.createdById, users.id))
        .where(where)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .leftJoin(categorys, eq(posts.categoryId, categorys.id))
        .leftJoin(users, eq(posts.createdById, users.id))
        .where(where);

      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return { items, page, totalPages };
    }),
});
