import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  categorys,
  comments,
  postInsertSchema,
  postInsertWithTagsSchema,
  postReactions,
  posts,
  postTags,
  postUpdateSchema,
  postUpdateWithTagsSchema,
  postViews,
  statistics,
  tags,
  user,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, inArray, like, lt, or, sql } from "drizzle-orm";
import z from "zod";

export const postRouter = createTRPCRouter({
  // 🔹 创建草稿（编辑器用）
  createDraft: protectedProcedure.mutation(async ({ ctx }) => {
    const draftSlug = `draft-${crypto.randomUUID().slice(0, 8)}`;
    const [insertedPost] = await ctx.db
      .insert(posts)
      .values({
        title: "",
        slug: draftSlug,
        excerpt: "",
        content: "",
        status: "draft",
        createdById: ctx.session.user.id,
      })
      .returning();

    if (!insertedPost) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create draft" });
    }

    return { post: insertedPost };
  }),

  // 🔹 获取文章（编辑器用，不要求分类）
  getOneForEdit: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: eq(posts.id, input.id),
        with: {
          category: { columns: { id: true, name: true } },
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      return {
        ...post,
        tags: post.tags.map((pt) => pt.tag),
      };
    }),

  // 🔹 创建文章
  create: protectedProcedure.input(postInsertSchema).mutation(async ({ ctx, input }) => {
    const validate = postInsertSchema.safeParse(input);
    if (!validate.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid post data" });
    }

    // Check if slug already exists
    const existingPost = await ctx.db.query.posts.findFirst({
      where: eq(posts.slug, validate.data.slug),
    });

    if (existingPost) {
      throw new TRPCError({ code: "CONFLICT", message: "A post with this slug already exists" });
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
    await Promise.all([
      ctx.db.delete(comments).where(eq(comments.postId, input.id)),
      ctx.db.delete(postReactions).where(eq(postReactions.postId, input.id)),
      ctx.db.delete(postViews).where(eq(postViews.postId, input.id)),
      ctx.db.delete(postTags).where(eq(postTags.postId, input.id)),
    ]);

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

      // Check if slug is being updated and if it already exists
      if (validate.data.slug) {
        const existingPost = await ctx.db.query.posts.findFirst({
          where: and(eq(posts.slug, validate.data.slug), sql`${posts.id} != ${id}`),
        });

        if (existingPost) {
          throw new TRPCError({ code: "CONFLICT", message: "A post with this slug already exists" });
        }
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

  // 🔹 创建文章（带标签）
  createWithTags: protectedProcedure.input(postInsertWithTagsSchema).mutation(async ({ ctx, input }) => {
    const { tagIds, ...postData } = input;
    const validate = postInsertSchema.safeParse(postData);
    if (!validate.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid post data" });
    }

    // Check if slug already exists
    const existingPost = await ctx.db.query.posts.findFirst({
      where: eq(posts.slug, validate.data.slug),
    });

    if (existingPost) {
      throw new TRPCError({ code: "CONFLICT", message: "A post with this slug already exists" });
    }

    // Create post
    const [insertedPost] = await ctx.db
      .insert(posts)
      .values({
        ...validate.data,
        createdById: ctx.session.user.id,
      })
      .returning();

    if (!insertedPost) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create post" });
    }

    // Add tags if provided
    if (tagIds && tagIds.length > 0) {
      const tagValues = tagIds.map((tagId) => ({
        postId: insertedPost.id,
        tagId,
      }));
      await ctx.db.insert(postTags).values(tagValues);
    }

    return {
      message: "Post created successfully",
      post: insertedPost,
    };
  }),

  // 🔹 更新文章（带标签）
  updateWithTags: protectedProcedure
    .input(z.object({ id: z.string(), data: postUpdateWithTagsSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const { tagIds, ...postData } = data;
      const validate = postUpdateSchema.safeParse(postData);
      if (!validate.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid post data" });
      }

      // Check if slug is being updated and if it already exists
      if (validate.data.slug) {
        const existingPost = await ctx.db.query.posts.findFirst({
          where: and(eq(posts.slug, validate.data.slug), sql`${posts.id} != ${id}`),
        });

        if (existingPost) {
          throw new TRPCError({ code: "CONFLICT", message: "A post with this slug already exists" });
        }
      }

      // Update post
      const [updatedPost] = await ctx.db.update(posts).set(validate.data).where(eq(posts.id, id)).returning();

      if (!updatedPost) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
      }

      // Update tags if provided
      if (tagIds !== undefined) {
        // Remove existing tags
        await ctx.db.delete(postTags).where(eq(postTags.postId, id));

        // Add new tags
        if (tagIds.length > 0) {
          const tagValues = tagIds.map((tagId) => ({
            postId: id,
            tagId,
          }));
          await ctx.db.insert(postTags).values(tagValues);
        }
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
          author: user,
          category: categorys,
          viewCount: ctx.db.$count(postViews, eq(postViews.postId, posts.id)),
          likeCount: sql<number>`
        COALESCE(SUM(${postReactions.num}), 0)
      `.mapWith(Number),
          commentCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),
        })
        .from(posts)
        .leftJoin(user, eq(posts.createdById, user.id))
        .leftJoin(categorys, eq(posts.categoryId, categorys.id))
        // 额外 join，才能统计浏览、点赞、评论
        .leftJoin(postViews, eq(postViews.postId, posts.id))
        .leftJoin(postReactions, eq(postReactions.postId, posts.id))
        .leftJoin(comments, eq(comments.postId, posts.id))
        .where(where)
        .groupBy(posts.id, user.id, categorys.id) // 分组聚合
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      // Get tags for all posts
      const postIds = items.map((item) => item.id);
      const postTagsData =
        postIds.length > 0
          ? await ctx.db
              .select({
                postId: postTags.postId,
                tag: tags,
              })
              .from(postTags)
              .innerJoin(tags, eq(postTags.tagId, tags.id))
              .where(inArray(postTags.postId, postIds))
          : [];

      // Group tags by postId
      const tagsByPostId = postTagsData.reduce(
        (acc, { postId, tag }) => {
          if (!acc[postId]) {
            acc[postId] = [];
          }
          acc[postId].push(tag);
          return acc;
        },
        {} as Record<string, (typeof tags.$inferSelect)[]>
      );

      // Add tags to items
      const itemsWithTags = items.map((item) => ({
        ...item,
        tags: tagsByPostId[item.id] || [],
      }));

      // 总数
      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .leftJoin(categorys, eq(posts.categoryId, categorys.id))
        .where(where);

      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return { items: itemsWithTags, page, totalPages, total };
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
        user: user,
        category: categorys,
        viewCount: ctx.db.$count(postViews, eq(postViews.postId, posts.id)),
        likeCount: ctx.db.$count(postReactions, and(eq(postReactions.postId, posts.id))),
        commentCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),
        userReaction: userPostReactions.type,
      })
      .from(posts)
      .innerJoin(user, eq(posts.createdById, user.id))
      .innerJoin(categorys, eq(posts.categoryId, categorys.id))
      .leftJoin(userPostReactions, eq(userPostReactions.postId, posts.id))
      .where(eq(posts.id, input.id));

    if (!post) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
    }

    // Get tags for this post
    const postTagsData = await ctx.db
      .select({
        tag: tags,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, input.id));

    const postTags_array = postTagsData.map(({ tag }) => tag);

    return {
      ...post,
      tags: postTags_array,
    };
  }),
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ ctx, input }) => {
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
        user: user,
        category: categorys,
        viewCount: ctx.db.$count(postViews, eq(postViews.postId, posts.id)),
        likeCount: ctx.db.$count(postReactions, and(eq(postReactions.postId, posts.id))),
        commentCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),
        userReaction: userPostReactions.type,
      })
      .from(posts)
      .innerJoin(user, eq(posts.createdById, user.id))
      .innerJoin(categorys, eq(posts.categoryId, categorys.id))
      .leftJoin(userPostReactions, eq(userPostReactions.postId, posts.id))
      .where(and(eq(posts.slug, input.slug), eq(posts.status, "published")));

    if (!post) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
    }

    // Get tags for this post
    const postTagsData = await ctx.db
      .select({
        tag: tags,
      })
      .from(postTags)
      .innerJoin(tags, eq(postTags.tagId, tags.id))
      .where(eq(postTags.postId, post.id));

    const postTags_array = postTagsData.map(({ tag }) => tag);

    return {
      ...post,
      tags: postTags_array,
    };
  }),
  createView: publicProcedure.input(z.object({ postId: z.string() })).mutation(async ({ ctx, input }) => {
    const { postId } = input;
    const ip = "";

    const userId = ctx.session?.user.id ?? null;
    await ctx.db.insert(postViews).values({ postId, ip, userId });

    return { message: "View recorded" };
  }),
  postLike: publicProcedure.input(z.object({ postId: z.string(), count: z.int() })).mutation(async ({ ctx, input }) => {
    const { postId, count } = input;
    const ip = "";
    const userId = ctx.session?.user.id ?? null;

    await ctx.db.insert(postReactions).values({ postId, userId, ip, num: count });

    return { message: "Post reaction updated" };
  }),

  // Get popular posts by view count
  getPopular: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(5) }))
    .query(async ({ ctx, input }) => {
      const { limit } = input;

      const popularPosts = await ctx.db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          excerpt: posts.excerpt,
          createdAt: posts.createdAt,
          viewCount: ctx.db.$count(postViews, eq(postViews.postId, posts.id)),
          category: categorys,
        })
        .from(posts)
        .leftJoin(categorys, eq(posts.categoryId, categorys.id))
        .leftJoin(postViews, eq(postViews.postId, posts.id))
        .where(eq(posts.status, "published"))
        .groupBy(posts.id, categorys.id)
        .orderBy(sql`COUNT(${postViews.id}) DESC`, desc(posts.createdAt))
        .limit(limit);

      // Get tags for all popular posts
      const postIds = popularPosts.map((post) => post.id);
      const postTagsData =
        postIds.length > 0
          ? await ctx.db
              .select({
                postId: postTags.postId,
                tag: tags,
              })
              .from(postTags)
              .innerJoin(tags, eq(postTags.tagId, tags.id))
              .where(inArray(postTags.postId, postIds))
          : [];

      // Group tags by postId
      const tagsByPostId = postTagsData.reduce(
        (acc, { postId, tag }) => {
          if (!acc[postId]) {
            acc[postId] = [];
          }
          acc[postId].push(tag);
          return acc;
        },
        {} as Record<string, (typeof tags.$inferSelect)[]>
      );

      // Add tags to popular posts
      const popularPostsWithTags = popularPosts.map((post) => ({
        ...post,
        tags: tagsByPostId[post.id] || [],
      }));

      return popularPostsWithTags;
    }),

  // Get posts with tag and category filters
  getByPageWithFilters: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        tagName: z.string().optional(),
        categoryName: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, tagName, categoryName } = input;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [eq(posts.status, "published")];

      if (search) {
        conditions.push(
          or(
            like(sql`LOWER(${posts.title})`, `%${search.toLowerCase()}%`),
            like(sql`LOWER(${posts.excerpt})`, `%${search.toLowerCase()}%`),
            like(sql`LOWER(${categorys.name})`, `%${search.toLowerCase()}%`)
          )!
        );
      }

      if (categoryName) {
        conditions.push(eq(categorys.name, categoryName));
      }

      // First get posts without tags to avoid duplicates
      let baseQuery = ctx.db
        .select({
          ...getTableColumns(posts),
          author: user,
          category: categorys,
          viewCount: ctx.db.$count(postViews, eq(postViews.postId, posts.id)),
          likeCount: sql<number>`COALESCE(SUM(${postReactions.num}), 0)`.mapWith(Number),
          commentCount: ctx.db.$count(comments, eq(comments.postId, posts.id)),
        })
        .from(posts)
        .leftJoin(user, eq(posts.createdById, user.id))
        .leftJoin(categorys, eq(posts.categoryId, categorys.id))
        .leftJoin(postViews, eq(postViews.postId, posts.id))
        .leftJoin(postReactions, eq(postReactions.postId, posts.id))
        .leftJoin(comments, eq(comments.postId, posts.id));

      // Add tag filter condition if provided
      if (tagName) {
        baseQuery = baseQuery
          .leftJoin(postTags, eq(postTags.postId, posts.id))
          .leftJoin(tags, eq(postTags.tagId, tags.id));
        conditions.push(eq(tags.name, tagName));
      }

      const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

      // Get items
      const items = await baseQuery
        .where(whereCondition)
        .groupBy(posts.id, user.id, categorys.id)
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      // Get tags for all posts
      const postIds = items.map((item) => item.id);
      const postTagsData =
        postIds.length > 0
          ? await ctx.db
              .select({
                postId: postTags.postId,
                tag: tags,
              })
              .from(postTags)
              .innerJoin(tags, eq(postTags.tagId, tags.id))
              .where(inArray(postTags.postId, postIds))
          : [];

      // Group tags by postId
      const tagsByPostId = postTagsData.reduce(
        (acc, { postId, tag }) => {
          if (!acc[postId]) {
            acc[postId] = [];
          }
          acc[postId].push(tag);
          return acc;
        },
        {} as Record<string, (typeof tags.$inferSelect)[]>
      );

      // Add tags to items
      const itemsWithTags = items.map((item) => ({
        ...item,
        tags: tagsByPostId[item.id] || [],
      }));

      // Get total count with the same join structure
      let countQuery = ctx.db
        .select({ count: sql<number>`count(DISTINCT ${posts.id})` })
        .from(posts)
        .leftJoin(categorys, eq(posts.categoryId, categorys.id));

      if (tagName) {
        countQuery = countQuery
          .leftJoin(postTags, eq(postTags.postId, posts.id))
          .leftJoin(tags, eq(postTags.tagId, tags.id));
      }

      const totalResult = await countQuery.where(whereCondition);
      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return { items: itemsWithTags, page, totalPages, total };
    }),

  // Get recent posts for homepage
  getRecent: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(10).default(5) }))
    .query(async ({ ctx, input }) => {
      const { limit } = input;

      const recentPosts = await ctx.db
        .select({
          id: posts.id,
          title: posts.title,
          slug: posts.slug,
          createdAt: posts.createdAt,
        })
        .from(posts)
        .where(eq(posts.status, "published"))
        .orderBy(desc(posts.createdAt))
        .limit(limit);

      return recentPosts;
    }),

  // Get statistics (total posts count and total views) with 1-hour cache
  getStatistics: publicProcedure.query(async ({ ctx }) => {
    const CACHE_ID = "global_stats";
    const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds

    // Try to get cached statistics
    const [cachedStats] = await ctx.db.select().from(statistics).where(eq(statistics.id, CACHE_ID)).limit(1);

    const now = new Date();

    // Check if cache is valid (less than 1 hour old)
    if (cachedStats && now.getTime() - cachedStats.lastUpdated.getTime() < CACHE_DURATION_MS) {
      return {
        totalPosts: cachedStats.totalPosts,
        totalViews: cachedStats.totalViews,
        lastUpdated: cachedStats.lastUpdated,
        fromCache: true,
      };
    }

    // Cache is stale or doesn't exist, calculate fresh statistics
    const [postCountResult] = await ctx.db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(posts)
      .where(eq(posts.status, "published"));

    const totalPosts = Number(postCountResult?.count ?? 0);

    const [viewCountResult] = await ctx.db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(postViews);

    const totalViews = Number(viewCountResult?.count ?? 0);

    // Update or insert cache
    if (cachedStats) {
      await ctx.db
        .update(statistics)
        .set({
          totalPosts,
          totalViews,
          lastUpdated: now,
        })
        .where(eq(statistics.id, CACHE_ID));
    } else {
      await ctx.db.insert(statistics).values({
        id: CACHE_ID,
        totalPosts,
        totalViews,
        lastUpdated: now,
      });
    }

    return {
      totalPosts,
      totalViews,
      lastUpdated: now,
      fromCache: false,
    };
  }),
});
