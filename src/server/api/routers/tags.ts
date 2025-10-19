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
      },
      {
        name: "React",
        description: "React 库相关内容",
        color: "#61DAFB",
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
      },
      {
        name: "Python",
        description: "Python 编程语言",
        color: "#3776AB",
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
      },
      {
        name: "Git",
        description: "Git 版本控制系统",
        color: "#F05032",
      },
      {
        name: "TypeScript",
        description: "TypeScript 编程语言",
        color: "#3178C6",
      },
      {
        name: "Node.js",
        description: "Node.js 运行时环境",
        color: "#339933",
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

        // 创建标签
        const [insertedTag] = await ctx.db.insert(tags).values(tagData).returning();

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
});
