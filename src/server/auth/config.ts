import { signInSchema } from "@/lib/validations";
import { db } from "@/server/db";
import { accounts, users } from "@/server/db/schema";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import slugify from "slugify";

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	providers: [
		GitHub,
		Google,
		Credentials({
			async authorize(credentials) {
				const validateFields = signInSchema.safeParse(credentials);
				if (validateFields.success) {
					const { email, password } = validateFields.data;
					const [existingAccount] = await db.select().from(accounts).where(eq(accounts.providerAccountId, email));
					if (!existingAccount) return null;

					const [existingUser] = await db.select().from(users).where(eq(users.email, email));
					if (!existingUser) return null;

					if (!existingAccount.password) return null;
					const isValidPassword = await bcrypt.compare(password, existingAccount.password);

					if (isValidPassword) {
						return {
							id: existingUser.id,
							name: existingUser.name,
							email: existingUser.email,
							image: existingUser.image
						};
					}
				}
				return null;
			}
		})
	],
	callbacks: {
		async session({ session, token }) {
			session.user.id = token.sub as string;
			return session;
		},
		async jwt({ token, account }) {
			if (account) {
				const providerAccountId = account.type === "credentials" ? token.email : account.providerAccountId;
				if (providerAccountId) {
					const [existingAccount] = await db
						.select()
						.from(accounts)
						.where(eq(accounts.providerAccountId, providerAccountId));
					const userId = existingAccount?.userId;
					if (userId) token.sub = userId.toString();
				}
			}
			return token;
		},
		async signIn({ user, profile, account }) {
			if (account?.type === "credentials") {
				return true; // Allow sign-in with credentials
			}
			if (!account || !user) return false;

			const name = account.provider === "github" ? (profile?.login as string) : (user.name?.toLowerCase() as string);
			const email = user.email!;
			const image = user.image!;

			const slugifiedUsername = slugify(name, {
				lower: true,
				strict: true,
				trim: true
			});

			let _userId: string | undefined = undefined;
			// 根据email查询user信息，如果不存在则创建一个新的user
			const [existingUser] = await db.select().from(users).where(eq(users.email, email));
			if (!existingUser) {
				const userId = await db
					.insert(users)
					.values({
						name: slugifiedUsername,
						email,
						image
					})
					.$returningId();
				_userId = userId[0]?.id;
			} else {
				_userId = existingUser.id;
				await db
					.update(users)
					.set({
						name: slugifiedUsername,
						image
					})
					.where(eq(users.email, email));
			}

			// 是否存在Account，如果不存在则创建一个新的Account
			const [existingAccount] = await db.select().from(accounts).where(eq(accounts.providerAccountId, user.email!));
			if (!existingAccount) {
				await db.insert(accounts).values({
					userId: _userId!,
					type: account.type,
					provider: account.provider,
					providerAccountId: account.providerAccountId,
					name: slugifiedUsername,
					image
				});
			}

			return true;
		}
	}
} satisfies NextAuthConfig;
