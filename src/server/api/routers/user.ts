import { z } from "zod";

import { signInSchema } from "@/lib/validations";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { signIn } from "@/server/auth";
import { accounts, users } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
	create: publicProcedure.input(signInSchema).mutation(async ({ ctx, input }) => {
		const validateFields = signInSchema.safeParse(input);
		if (!validateFields.success) {
			throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid input data" });
		}
		const { email, password } = validateFields.data;

		// 查看是否已存在用户
		const [existingUser] = await ctx.db.select().from(users).where(eq(users.email, email));
		if (!existingUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
		// 查看是否存在Account
		const [existingAccount] = await ctx.db
			.select()
			.from(accounts)
			.where(and(eq(accounts.providerAccountId, email), eq(accounts.provider, "credentials")));
		if (!existingAccount) throw new TRPCError({ code: "NOT_FOUND", message: "Account not found" });

		await signIn("credentials", { email, password, redirect: false });

		return {
			message: "User signed in successfully"
		};
	})
});
