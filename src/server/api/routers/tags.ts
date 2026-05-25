import { pickRandomInkColor } from "@/lib/ink-palette";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { posts, postTags, tagInsertSchema, tags } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import z from "zod";

export const tagRouter = createTRPCRouter({
  create: protectedProcedure.input(tagInsertSchema).mutation(async ({ ctx, input }) => {
    const validateFields = tagInsertSchema.safeParse(input);
    if (!validateFields.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input data" });
    }

    const [insertedTag] = await ctx.db.insert(tags).values(validateFields.data).returning();

    if (!insertedTag) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create tag" });
    }

    console.log("Inserted tag:", insertedTag);
    return {
      message: "Tag created successfully",
      tag: insertedTag,
    };
  }),
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const { id } = input;
    const [deletedTag] = await ctx.db.delete(tags).where(eq(tags.id, id)).returning();

    if (!deletedTag) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Tag not found" });
    }
    return {
      message: "Tag deleted successfully",
      tag: deletedTag,
    };
  }),
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: tagInsertSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const validateFields = tagInsertSchema.safeParse(data);
      if (!validateFields.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input data" });
      }

      const [updatedTag] = await ctx.db.update(tags).set(validateFields.data).where(eq(tags.id, id)).returning();

      if (!updatedTag) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tag not found" });
      }

      return {
        message: "Tag updated successfully",
        tag: updatedTag,
      };
    }),
  getMany: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit } = input;
      const offset = (page - 1) * limit;

      // 获取总数
      const [totalResult] = await ctx.db.select({ count: sql<number>`count(*)` }).from(tags);
      const total = totalResult?.count ?? 0;

      // 获取分页数据
      const items = await ctx.db
        .select()
        .from(tags)
        .orderBy(desc(tags.createdAt), desc(tags.id)) // 使用组合排序确保稳定性
        .limit(limit)
        .offset(offset);

      const totalPages = Math.ceil(total / limit);

      return {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const data = await ctx.db.select().from(tags).orderBy(desc(tags.createdAt));
    return data;
  }),
  batchCreate: protectedProcedure.input(z.array(tagInsertSchema)).mutation(async ({ ctx, input }) => {
    if (input.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "No tags provided" });
    }

    // 限制单次最多创建50个标签
    if (input.length > 50) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Too many tags. Maximum 50 tags per batch.",
      });
    }

    const results: {
      successful: any[];
      failed: string[];
      errors: string[];
    } = {
      successful: [],
      failed: [],
      errors: [],
    };

    // 依次创建每个标签，遇到错误时记录并继续
    for (let i = 0; i < input.length; i++) {
      const tagData = input[i];

      try {
        // 验证标签数据
        const validated = tagInsertSchema.safeParse(tagData);
        if (!validated.success) {
          const error = `Invalid data for tag "${tagData?.name || "unknown"}": ${validated.error.message}`;
          console.log(`[Tag Creation Error ${i + 1}]:`, error);
          results.failed.push(tagData?.name || `Tag ${i + 1}`);
          results.errors.push(error);
          continue;
        }

        // 检查标签名是否已存在
        const existingTag = await ctx.db
          .select({ name: tags.name })
          .from(tags)
          .where(eq(tags.name, validated.data.name))
          .limit(1);

        if (existingTag.length > 0) {
          const error = `Tag "${validated.data.name}" already exists`;
          console.log(`[Tag Creation Error ${i + 1}]:`, error);
          results.failed.push(validated.data.name);
          results.errors.push(error);
          continue;
        }

        // 创建标签
        const [insertedTag] = await ctx.db.insert(tags).values(validated.data).returning();

        if (insertedTag) {
          console.log(`[Tag Creation Success ${i + 1}]:`, `Created tag "${insertedTag.name}"`);
          results.successful.push(insertedTag);
        } else {
          const error = `Failed to create tag "${validated.data.name}"`;
          console.log(`[Tag Creation Error ${i + 1}]:`, error);
          results.failed.push(validated.data.name);
          results.errors.push(error);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const tagName = tagData?.name || `Tag ${i + 1}`;
        console.log(`[Tag Creation Error ${i + 1}]:`, `Failed to create tag "${tagName}": ${errorMessage}`);
        results.failed.push(tagName);
        results.errors.push(`${tagName}: ${errorMessage}`);
      }
    }

    // 构建响应消息
    let message = `Batch creation completed. `;
    if (results.successful.length > 0) {
      message += `${results.successful.length} tags created successfully. `;
    }
    if (results.failed.length > 0) {
      message += `${results.failed.length} tags failed.`;
    }

    console.log(`[Batch Creation Summary]:`, {
      total: input.length,
      successful: results.successful.length,
      failed: results.failed.length,
      failedTags: results.failed,
    });

    return {
      message,
      totalRequested: input.length,
      successCount: results.successful.length,
      failCount: results.failed.length,
      successfulTags: results.successful,
      failedTags: results.failed,
      errors: results.errors,
    };
  }),

  // Get tags with post counts for tag cloud
  getWithPostCounts: publicProcedure.query(async ({ ctx }) => {
    const tagsWithCounts = await ctx.db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color,
        icon: tags.icon,
        postCount: ctx.db.$count(postTags, and(eq(postTags.tagId, tags.id), eq(posts.status, "published"))),
      })
      .from(tags)
      .leftJoin(postTags, eq(postTags.tagId, tags.id))
      .leftJoin(posts, eq(posts.id, postTags.postId))
      .groupBy(tags.id)
      .having(sql`COUNT(${postTags.postId}) > 0`)
      .orderBy(desc(sql`COUNT(${postTags.postId})`), tags.name);

    return tagsWithCounts;
  }),

  // Initialize default tags
  initializeDefaults: protectedProcedure.mutation(async ({ ctx }) => {
    const defaultTags = [
      {
        name: "Next.js",
        description: "Next.js 框架相关内容",
        color: "#000000",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><circle cx="64" cy="64" r="64"/><path fill="url(#a)" d="M106.317 112.014 49.167 38.4H38.4v51.179h8.614v-40.24l52.767 67.98a64.31 64.31 0 0 0 6.536-5.305Z"/><path fill="url(#b)" d="M81.778 38.4h8.533v51.2h-8.533z"/><defs><linearGradient id="a" x1="109" x2="144.5" y1="116.5" y2="160.5" gradientTransform="scale(.71111)" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><linearGradient id="b" x1="121" x2="120.799" y1="54" y2="106.875" gradientTransform="scale(.71111)" gradientUnits="userSpaceOnUse"><stop stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs></svg>',
      },
      {
        name: "React",
        description: "React 库相关内容",
        color: "#61DAFB",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g fill="#61DAFB"><circle cx="64" cy="64" r="11.4"/><path d="M107.3 45.2c-2.2-.8-4.5-1.6-6.9-2.3.6-2.4 1.1-4.8 1.5-7.1 2.1-13.2-.2-22.5-6.6-26.1-1.9-1.1-4-1.6-6.4-1.6-7 0-15.9 5.2-24.9 13.9-9-8.7-17.9-13.9-24.9-13.9-2.4 0-4.5.5-6.4 1.6-6.4 3.7-8.7 13-6.6 26.1.4 2.3.9 4.7 1.5 7.1-2.4.7-4.7 1.4-6.9 2.3C8.2 50 1.4 56.6 1.4 64s6.9 14 19.3 18.8c2.2.8 4.5 1.6 6.9 2.3-.6 2.4-1.1 4.8-1.5 7.1-2.1 13.2.2 22.5 6.6 26.1 1.9 1.1 4 1.6 6.4 1.6 7.1 0 16-5.2 24.9-13.9 9 8.7 17.9 13.9 24.9 13.9 2.4 0 4.5-.5 6.4-1.6 6.4-3.7 8.7-13 6.6-26.1-.4-2.3-.9-4.7-1.5-7.1 2.4-.7 4.7-1.4 6.9-2.3 12.5-4.8 19.3-11.4 19.3-18.8s-6.8-14-19.3-18.8zM92.5 14.7c4.1 2.4 5.5 9.8 3.8 20.3-.3 2.1-.8 4.3-1.4 6.6-5.2-1.2-10.7-2-16.5-2.5-3.4-4.8-6.9-9.1-10.4-13 7.4-7.3 14.9-12.3 21-12.3 1.3 0 2.5.3 3.5.9zM81.3 74c-1.8 3.2-3.9 6.4-6.1 9.6-3.7.3-7.4.4-11.2.4-3.9 0-7.6-.1-11.2-.4-2.2-3.2-4.2-6.4-6-9.6-1.9-3.3-3.7-6.7-5.3-10 1.6-3.3 3.4-6.7 5.3-10 1.8-3.2 3.9-6.4 6.1-9.6 3.7-.3 7.4-.4 11.2-.4 3.9 0 7.6.1 11.2.4 2.2 3.2 4.2 6.4 6 9.6 1.9 3.3 3.7 6.7 5.3 10-1.7 3.3-3.4 6.6-5.3 10zm8.3-3.3c1.5 3.5 2.7 6.9 3.8 10.3-3.4.8-7 1.4-10.8 1.9 1.2-1.9 2.5-3.9 3.6-6 1.2-2.1 2.3-4.2 3.4-6.2zM64 97.8c-2.4-2.6-4.7-5.4-6.9-8.3 2.3.1 4.6.2 6.9.2 2.3 0 4.6-.1 6.9-.2-2.2 2.9-4.5 5.7-6.9 8.3zm-18.6-15c-3.8-.5-7.4-1.1-10.8-1.9 1.1-3.3 2.3-6.8 3.8-10.3 1.1 2 2.2 4.1 3.4 6.1 1.2 2.2 2.4 4.1 3.6 6.1zm-7-25.5c-1.5-3.5-2.7-6.9-3.8-10.3 3.4-.8 7-1.4 10.8-1.9-1.2 1.9-2.5 3.9-3.6 6-1.2 2.1-2.3 4.2-3.4 6.2zM64 30.2c2.4 2.6 4.7 5.4 6.9 8.3-2.3-.1-4.6-.2-6.9-.2-2.3 0-4.6.1-6.9.2 2.2-2.9 4.5-5.7 6.9-8.3zm22.2 21-3.6-6c3.8.5 7.4 1.1 10.8 1.9-1.1 3.3-2.3 6.8-3.8 10.3-1.1-2.1-2.2-4.2-3.4-6.2zM31.7 35c-1.7-10.5-.3-17.9 3.8-20.3 1-.6 2.2-.9 3.5-.9 6 0 13.5 4.9 21 12.3-3.5 3.8-7 8.2-10.4 13-5.8.5-11.3 1.4-16.5 2.5-.6-2.3-1-4.5-1.4-6.6zM7 64c0-4.7 5.7-9.7 15.7-13.4 2-.8 4.2-1.5 6.4-2.1 1.6 5 3.6 10.3 6 15.6-2.4 5.3-4.5 10.5-6 15.5C15.3 75.6 7 69.6 7 64zm28.5 49.3c-4.1-2.4-5.5-9.8-3.8-20.3.3-2.1.8-4.3 1.4-6.6 5.2 1.2 10.7 2 16.5 2.5 3.4 4.8 6.9 9.1 10.4 13-7.4 7.3-14.9 12.3-21 12.3-1.3 0-2.5-.3-3.5-.9zM96.3 93c1.7 10.5.3 17.9-3.8 20.3-1 .6-2.2.9-3.5.9-6 0-13.5-4.9-21-12.3 3.5-3.8 7-8.2 10.4-13 5.8-.5 11.3-1.4 16.5-2.5.6 2.3 1 4.5 1.4 6.6zm9-15.6c-2 .8-4.2 1.5-6.4 2.1-1.6-5-3.6-10.3-6-15.6 2.4-5.3 4.5-10.5 6-15.5 13.8 4 22.1 10 22.1 15.6 0 4.7-5.8 9.7-15.7 13.4z"/></g></svg>',
      },
      {
        name: "大语言模型",
        description: "LLM - Large Language Model 相关内容",
        color: "#FF6B6B",
      },
      {
        name: "JavaScript",
        description: "JavaScript 编程语言",
        color: "#F7DF1E",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z"/><path fill="#323330" d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.346-6.152 2.932-8.176 2.313-2.059-1.06-3.107-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z"/></svg>',
      },
      {
        name: "Python",
        description: "Python 编程语言",
        color: "#3776AB",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><linearGradient id="python-original-a" gradientUnits="userSpaceOnUse" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stop-color="#5A9FD4"/><stop offset="1" stop-color="#306998"/></linearGradient><linearGradient id="python-original-b" gradientUnits="userSpaceOnUse" x1="209.474" y1="1098.811" x2="173.62" y2="1149.537" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stop-color="#FFD43B"/><stop offset="1" stop-color="#FFE873"/></linearGradient><path fill="url(#python-original-a)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" transform="translate(0 10.26)"/><path fill="url(#python-original-b)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" transform="translate(0 10.26)"/></svg>',
      },
      {
        name: "Linux",
        description: "Linux 操作系统相关",
        color: "#FCC624",
      },
      {
        name: "Docker",
        description: "Docker 容器技术",
        color: "#2496ED",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill-rule="evenodd" clip-rule="evenodd" fill="#3A4D54" d="M73.8 50.8h11.3v11.5H73.8z"/><path fill-rule="evenodd" clip-rule="evenodd" fill="#00596E" d="M73.8 50.8h11.3v11.5H73.8zM38.7 50.8H50v11.5H38.7zM25.9 50.8h11.3v11.5H25.9zM51.6 50.8h11.3v11.5H51.6zM51.6 39h11.3v11.5H51.6zM51.6 27.1h11.3v11.5H51.6zM73.8 39h11.3v11.5H73.8zM62.9 39h11.3v11.5H62.9z"/><path fill="#23B8EB" d="M109.2 55.4c-2.7-1.8-8.9-2.5-13.7-1.6-0.6-4.6-3.2-8.6-7.8-12.2l-2.7-1.8-1.8 2.7c-2.3 3.5-3.5 8.3-3.1 13 .1 1.7.7 4.8 2.5 7.5-1.7 1-5.2 2.3-9.7 2.2H.7c-.8 4.7-.8 19.3 11 30.5 8.9 8.5 22.2 12.8 39.5 12.8 37.6 0 65.4-17.3 78.4-48.8 5.1.1 16.1.1 21.8-10.8.1-.2.5-1 1.5-3.2l.6-1.1-2.5-1.7z"/></svg>',
      },
      {
        name: "Git",
        description: "Git 版本控制系统",
        color: "#F05032",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#F34F29" d="M124.737 58.378L69.621 3.264c-3.172-3.174-8.32-3.174-11.497 0L46.68 14.71l14.518 14.518c3.375-1.139 7.243-.375 9.932 2.314 2.703 2.706 3.461 6.607 2.294 9.993l13.992 13.993c3.385-1.167 7.292-.413 9.994 2.295 3.78 3.777 3.78 9.9 0 13.679a9.673 9.673 0 01-13.683 0 9.677 9.677 0 01-2.105-10.521L68.574 47.933l-.002 34.341a9.708 9.708 0 012.559 1.828c3.778 3.777 3.778 9.898 0 13.683-3.779 3.777-9.904 3.777-13.679 0-3.778-3.784-3.778-9.905 0-13.683a9.65 9.65 0 013.167-2.11V47.333a9.581 9.581 0 01-3.167-2.111c-2.862-2.86-3.551-7.06-2.083-10.576L41.056 20.333 3.264 58.123a8.133 8.133 0 000 11.5l55.117 55.114c3.174 3.174 8.32 3.174 11.499 0l54.858-54.858a8.135 8.135 0 00-.001-11.501z"/></svg>',
      },
      {
        name: "TypeScript",
        description: "TypeScript 编程语言",
        color: "#3178C6",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#fff" d="M22.67 47h99.67v73.67H22.67z"/><path fill="#007acc" d="M1.5 63.91v62.5h125v-125H1.5zm100.73-5a15.56 15.56 0 017.82 4.5 20.58 20.58 0 013 4c0 .16-5.4 3.81-8.69 5.85-.12.08-.6-.44-1.13-1.23a7.09 7.09 0 00-5.87-3.53c-3.79-.26-6.23 1.73-6.21 5a4.58 4.58 0 00.54 2.34c.83 1.73 2.38 2.76 7.24 4.86 8.95 3.85 12.78 6.39 15.16 10 2.66 4 3.25 10.46 1.45 15.24-2 5.2-6.9 8.73-13.83 9.9a38.32 38.32 0 01-9.52-.1 23 23 0 01-12.72-6.63c-1.15-1.27-3.39-4.58-3.25-4.82a9.34 9.34 0 011.15-.73L82 101l3.59-2.08.75 1.11a16.78 16.78 0 004.74 4.54c4 2.1 9.46 1.81 12.16-.62a5.43 5.43 0 00.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48 16.48 0 01-3.43-6.25 25 25 0 01-.22-8c1.33-6.23 6-10.58 12.82-11.87a31.66 31.66 0 019.49.26zm-29.34 5.24v5.12H56.66v46.23H45.15V69.26H28.88v-5a49.19 49.19 0 01.12-5.17C29.08 59 39 59 51 59h21.83z"/></svg>',
      },
      {
        name: "Node.js",
        description: "Node.js 运行时环境",
        color: "#339933",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#83CD29" d="M112.771 30.334L68.674 4.729c-2.781-1.584-6.402-1.584-9.205 0L14.901 30.334C12.031 31.985 10 35.088 10 38.407v51.142c0 3.319 2.084 6.423 4.954 8.083l11.775 6.688c5.628 2.772 7.617 2.772 10.178 2.772 8.333 0 13.093-5.039 13.093-13.828v-50.49c0-.713-.371-1.774-1.071-1.774h-5.623C42.594 41 41 42.061 41 42.773v50.49c0 3.896-3.524 7.773-10.11 4.48L18.723 90.73c-.424-.23-.723-.693-.723-1.181V38.407c0-.482.555-.966.982-1.213l44.424-25.561c.415-.235 1.025-.235 1.439 0l43.882 25.555c.42.253.272.722.272 1.219v51.142c0 .488.183.963-.232 1.198l-44.086 25.576c-.378.227-.847.227-1.261 0l-11.307-6.749c-.341-.198-.746-.269-1.073-.086-3.146 1.783-3.726 2.02-6.677 3.043-.726.253-1.797.692.41 1.929l14.798 8.754a9.294 9.294 0 004.647 1.246c1.642 0 3.25-.426 4.667-1.246l43.885-25.582c2.87-1.672 4.23-4.764 4.23-8.083V38.407c0-3.319-1.36-6.414-4.229-8.073zM77.91 81.445c-11.726 0-14.309-3.235-15.17-9.066-.1-.628-.633-1.379-1.272-1.379h-5.731c-.71 0-1.279.86-1.279 1.566 0 7.466 4.059 16.512 23.453 16.512 14.039 0 22.088-5.455 22.088-15.109 0-9.572-6.467-12.084-20.082-13.886-13.762-1.819-15.16-2.738-15.16-5.962 0-2.658 1.184-6.203 11.374-6.203 9.105 0 12.461 1.954 13.842 8.091.118.577.645 1.006 1.235 1.006h5.78c.354 0 .694-.143.943-.396.24-.272.367-.613.335-.979-.893-10.568-7.926-15.485-22.135-15.485-12.645 0-20.198 5.334-20.198 14.29 0 9.698 7.503 12.378 19.622 13.577 14.505 1.422 15.633 3.542 15.633 6.395 0 4.955-3.978 7.066-13.309 7.066z"/></svg>',
      },
      {
        name: "数据库",
        description: "数据库相关技术",
        color: "#4479A1",
      },
      {
        name: "云计算",
        description: "云计算和云服务",
        color: "#FF9900",
      },
    ];

    const results: {
      successful: any[];
      failed: string[];
      errors: string[];
    } = {
      successful: [],
      failed: [],
      errors: [],
    };

    for (const tagData of defaultTags) {
      try {
        // 检查标签是否已存在
        const existingTag = await ctx.db
          .select({ name: tags.name })
          .from(tags)
          .where(eq(tags.name, tagData.name))
          .limit(1);

        if (existingTag.length > 0) {
          results.failed.push(tagData.name);
          results.errors.push(`标签 "${tagData.name}" 已存在`);
          continue;
        }

        // 创建标签 — 颜色从墨色调色板随机分配,与品牌色解耦
        const [insertedTag] = await ctx.db
          .insert(tags)
          .values({ ...tagData, color: pickRandomInkColor() })
          .returning();

        if (insertedTag) {
          results.successful.push(insertedTag);
        } else {
          results.failed.push(tagData.name);
          results.errors.push(`创建标签 "${tagData.name}" 失败`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        results.failed.push(tagData.name);
        results.errors.push(`${tagData.name}: ${errorMessage}`);
      }
    }

    return {
      message: `初始化完成。成功创建 ${results.successful.length} 个标签，失败 ${results.failed.length} 个`,
      totalRequested: defaultTags.length,
      successCount: results.successful.length,
      failCount: results.failed.length,
      successfulTags: results.successful,
      failedTags: results.failed,
      errors: results.errors,
    };
  }),

  // 重新随机所有标签的颜色 (从墨色调色板抽取)
  recolorAll: protectedProcedure.mutation(async ({ ctx }) => {
    const allTags = await ctx.db.select({ id: tags.id }).from(tags);
    for (const t of allTags) {
      await ctx.db.update(tags).set({ color: pickRandomInkColor() }).where(eq(tags.id, t.id));
    }
    return { count: allTags.length };
  }),
});
