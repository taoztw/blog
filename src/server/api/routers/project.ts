import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  projects,
  projectInsertSchema,
  projectInsertWithTagsSchema,
  projectUpdateSchema,
  projectUpdateWithTagsSchema,
  projectTags,
  tags,
  users,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, like, or, sql } from "drizzle-orm";
import z from "zod";

export const projectRouter = createTRPCRouter({
  // 🔹 创建项目
  create: protectedProcedure.input(projectInsertWithTagsSchema).mutation(async ({ ctx, input }) => {
    const validate = projectInsertWithTagsSchema.safeParse(input);
    if (!validate.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid project data" });
    }

    const { tagIds, ...projectData } = validate.data;

    const [insertedProject] = await ctx.db
      .insert(projects)
      .values({
        ...projectData,
        createdById: ctx.session.user.id,
      })
      .returning();

    if (!insertedProject) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create project" });
    }

    // 如果有标签，创建关联关系
    if (tagIds && tagIds.length > 0) {
      const tagRelations = tagIds.map((tagId) => ({
        projectId: insertedProject.id,
        tagId,
      }));

      await ctx.db.insert(projectTags).values(tagRelations);
    }

    return {
      message: "Project created successfully",
      project: insertedProject,
    };
  }),

  // 🔹 删除项目
  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    const [deletedProject] = await ctx.db.delete(projects).where(eq(projects.id, input.id)).returning();

    if (!deletedProject) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
    }

    return {
      message: "Project deleted successfully",
      project: deletedProject,
    };
  }),

  // 🔹 更新项目
  update: protectedProcedure
    .input(z.object({ id: z.string(), data: projectUpdateWithTagsSchema }))
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const validate = projectUpdateWithTagsSchema.safeParse(data);
      if (!validate.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid project data" });
      }

      const { tagIds, ...projectData } = validate.data;

      const [updatedProject] = await ctx.db.update(projects).set(projectData).where(eq(projects.id, id)).returning();

      if (!updatedProject) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      // 更新标签关联关系
      if (tagIds !== undefined) {
        // 删除旧的关联关系
        await ctx.db.delete(projectTags).where(eq(projectTags.projectId, id));

        // 添加新的关联关系
        if (tagIds.length > 0) {
          const tagRelations = tagIds.map((tagId) => ({
            projectId: id,
            tagId,
          }));

          await ctx.db.insert(projectTags).values(tagRelations);
        }
      }

      return {
        message: "Project updated successfully",
        project: updatedProject,
      };
    }),

  // 🔹 分页获取项目
  getByPage: publicProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
        type: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, type, status } = input;
      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            like(sql`LOWER(${projects.title})`, `%${search.toLowerCase()}%`),
            like(sql`LOWER(${projects.description})`, `%${search.toLowerCase()}%`)
          )
        );
      }

      if (type && type !== "all") {
        conditions.push(eq(projects.type, type));
      }

      if (status) {
        conditions.push(eq(projects.status, status));
      }

      const whereCondition = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : and(...conditions)) : undefined;

      const items = await ctx.db.query.projects.findMany({
        where: whereCondition,
        orderBy: [desc(projects.sortOrder), desc(projects.createdAt)],
        limit,
        offset,
        with: {
          author: true,
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      // Get total count
      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(projects)
        .where(whereCondition);

      const total = totalResult[0]?.count ?? 0;
      const totalPages = Math.ceil(total / limit);

      return { items, page, totalPages, total };
    }),

  // 🔹 获取单个项目
  getOne: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const project = await ctx.db.query.projects.findFirst({
      where: eq(projects.id, input.id),
      with: {
        author: true,
        tags: {
          with: {
            tag: true,
          },
        },
      },
    });

    if (!project) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
    }

    return project;
  }),

  // 🔹 获取所有项目（用于前端展示）
  getAll: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search, type } = input;

      // Build where conditions
      const conditions = [eq(projects.status, "published")];

      if (search) {
        conditions.push(
          or(
            like(sql`LOWER(${projects.title})`, `%${search.toLowerCase()}%`),
            like(sql`LOWER(${projects.description})`, `%${search.toLowerCase()}%`)
          )!
        );
      }

      if (type && type !== "all") {
        conditions.push(eq(projects.type, type));
      }

      const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

      const items = await ctx.db.query.projects.findMany({
        where: whereCondition,
        orderBy: [desc(projects.sortOrder), desc(projects.createdAt)],
        with: {
          author: true,
          tags: {
            with: {
              tag: true,
            },
          },
        },
      });

      return items;
    }),

  // 🔹 更新排序
  updateSortOrder: protectedProcedure
    .input(z.object({ id: z.string(), sortOrder: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { id, sortOrder } = input;

      const [updatedProject] = await ctx.db
        .update(projects)
        .set({ sortOrder })
        .where(eq(projects.id, id))
        .returning();

      if (!updatedProject) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
      }

      return {
        message: "Sort order updated successfully",
        project: updatedProject,
      };
    }),

  // 🔹 获取所有标签
  getAllTags: publicProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.select().from(tags).orderBy(tags.name);
    return items;
  }),

  // 🔹 创建标签
  createTag: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      color: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [inserted] = await ctx.db
        .insert(tags)
        .values(input)
        .returning();

      if (!inserted) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create tag" });
      }

      return {
        message: "Tag created successfully",
        tag: inserted,
      };
    }),
});