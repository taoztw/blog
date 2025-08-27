import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  posts,
  postInsertSchema,
  postUpdateSchema,
  categorys,
  users,
  postReactions,
  postViews,
  comments,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, inArray, like, lt, or, sql } from "drizzle-orm";
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

      // 这里直接用聚合函数一次性统计
      const items = await ctx.db
        .select({
          ...getTableColumns(posts), // 所有 posts 列
          author: users,
          category: categorys,
          viewCount: ctx.db.$count(postViews, eq(postViews.postId, posts.id)),
          // likeCount: ctx.db.$count(
          //   postReactions,
          //   and(eq(postReactions.postId, posts.id), eq(postReactions.type, "like"))
          // ),
          likeCount: sql<number>`
        COALESCE(SUM(${postReactions.num}), 0)
      `.mapWith(Number),
          commentCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),
        })
        .from(posts)
        .leftJoin(users, eq(posts.createdById, users.id))
        .leftJoin(categorys, eq(posts.categoryId, categorys.id))
        // 额外 join，才能统计浏览、点赞、评论
        .leftJoin(postViews, eq(postViews.postId, posts.id))
        .leftJoin(postReactions, eq(postReactions.postId, posts.id))
        .leftJoin(comments, eq(comments.postId, posts.id))
        .where(where)
        .groupBy(posts.id, users.id, categorys.id) // 分组聚合
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      // 总数
      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .leftJoin(categorys, eq(posts.categoryId, categorys.id))
        .where(where);

      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return { items, page, totalPages };
    }),
  getOne: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const userId = ctx.session?.user.id;

    const userPostReactions = ctx.db.$with("postReactions").as(
      ctx.db
        .select({
          postId: postReactions.postId,
          type: postReactions.type,
        })
        .from(postReactions)
        .where(inArray(postReactions.userId, userId ? [userId] : []))
    );

    const [post] = await ctx.db
      .with(userPostReactions)
      .select({
        ...getTableColumns(posts),
        user: users,
        category: categorys,
        viewCount: ctx.db.$count(postViews, eq(postViews.postId, posts.id)),
        likeCount: ctx.db.$count(postReactions, and(eq(postReactions.postId, posts.id))),
        //     likeCount: sql<number>`
        //   COALESCE(SUM(${postReactions.num}), 0)
        // `.mapWith(Number),
        commentCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),
        userReaction: userPostReactions.type,
      })
      .from(posts)
      .innerJoin(users, eq(posts.createdById, users.id))
      .innerJoin(categorys, eq(posts.categoryId, categorys.id))
      .leftJoin(userPostReactions, eq(userPostReactions.postId, posts.id))
      .where(eq(posts.id, input.id));

    if (!post) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
    }

    return post;
  }),
  createView: publicProcedure.input(z.object({ postId: z.string() })).mutation(async ({ ctx, input }) => {
    const { postId } = input;
    const ip = ctx.ip;

    const userId = ctx.session?.user.id ?? null;
    await ctx.db.insert(postViews).values({ postId, ip, userId });

    return { message: "View recorded" };
  }),
  postLike: publicProcedure.input(z.object({ postId: z.string(), count: z.int() })).mutation(async ({ ctx, input }) => {
    const { postId, count } = input;
    const ip = ctx.ip;
    const userId = ctx.session?.user.id ?? null;

    await ctx.db.insert(postReactions).values({ postId, userId, ip, num: count });

    return { message: "Post reaction updated" };
  }),
});
