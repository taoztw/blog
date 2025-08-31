import { z } from "zod";

import { signUpSchema } from "@/lib/validations";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { accounts, users, ROLES_ENUM } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { and, eq, count, sql } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  signUp: publicProcedure.input(signUpSchema).mutation(async ({ ctx, input }) => {
    const validateFields = signUpSchema.safeParse(input);
    if (!validateFields.success) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input data" });
    }
    const { email, name, password } = validateFields.data;
    console.log("Sign up input:", validateFields.data);
    // 检查账户是否已存在
    const [existingAccount] = await ctx.db
      .select()
      .from(accounts)
      .where(and(eq(accounts.providerAccountId, email), eq(accounts.provider, "credentials")));
    if (existingAccount) throw new TRPCError({ code: "CONFLICT", message: "Account already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    // 创建新用户 并且返回用户

    const [insertUser] = await ctx.db.insert(users).values({ email, name, image: "", location: "" }).returning();

    if (!insertUser) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });

    // 创建新账户
    await ctx.db.insert(accounts).values({
      userId: insertUser.id,
      type: "email",
      provider: "credentials",
      providerAccountId: email,
      name,
      image: "",
      password: hashedPassword,
    });

    return {
      message: "User signed up successfully",
    };
  }),

  // Admin only procedures
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(10),
        search: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== ROLES_ENUM.ADMIN) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const { page, pageSize, search } = input;
      const offset = (page - 1) * pageSize;

      let whereClause = search
        ? sql`lower(${users.name}) like lower(${`%${search}%`}) or lower(${users.email}) like lower(${`%${search}%`})`
        : undefined;

      const [totalUsers, usersList] = await Promise.all([
        ctx.db.select({ count: count() }).from(users).where(whereClause),
        ctx.db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            image: users.image,
            location: users.location,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
          })
          .from(users)
          .where(whereClause)
          .limit(pageSize)
          .offset(offset)
          .orderBy(users.createdAt),
      ]);

      return {
        users: usersList,
        total: totalUsers[0]?.count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((totalUsers[0]?.count || 0) / pageSize),
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.role !== ROLES_ENUM.ADMIN) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const [user] = await ctx.db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          image: users.image,
          location: users.location,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, input.id));

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const userAccounts = await ctx.db
        .select({
          provider: accounts.provider,
          type: accounts.type,
          createdAt: accounts.createdAt,
        })
        .from(accounts)
        .where(eq(accounts.userId, input.id));

      return {
        ...user,
        accounts: userAccounts,
      };
    }),

  updateRole: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.enum([ROLES_ENUM.ADMIN, ROLES_ENUM.USER]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== ROLES_ENUM.ADMIN) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      if (ctx.session.user.id === input.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot change your own role" });
      }

      const [updatedUser] = await ctx.db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.id))
        .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

      if (!updatedUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return updatedUser;
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== ROLES_ENUM.ADMIN) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }

    const [totalUsers, adminUsers, regularUsers] = await Promise.all([
      ctx.db.select({ count: count() }).from(users),
      ctx.db.select({ count: count() }).from(users).where(eq(users.role, ROLES_ENUM.ADMIN)),
      ctx.db.select({ count: count() }).from(users).where(eq(users.role, ROLES_ENUM.USER)),
    ]);

    return {
      total: totalUsers[0]?.count || 0,
      admins: adminUsers[0]?.count || 0,
      users: regularUsers[0]?.count || 0,
    };
  }),

  deleteUser: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== ROLES_ENUM.ADMIN) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      if (ctx.session.user.id === input.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete your own account" });
      }

      // First, delete all associated accounts
      await ctx.db.delete(accounts).where(eq(accounts.userId, input.id));

      // Then delete the user
      const deletedUser = await ctx.db.delete(users).where(eq(users.id, input.id)).returning();

      if (!deletedUser.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      return { message: "User deleted successfully" };
    }),
});
