import { z } from "zod";

import { signUpSchema } from "@/lib/validations";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { accounts, users } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";

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
});
