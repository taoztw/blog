import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
	/**
	 * Specify your server-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars.
	 */
	server: {
		LOCAL_DB_PATH: z.string().optional(),
		AUTH_SECRET: process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
		// AUTH_DISCORD_ID: z.string(),
		// AUTH_DISCORD_SECRET: z.string(),
		AUTH_GITHUB_ID: z.string(),
		AUTH_GITHUB_SECRET: z.string(),
		AUTH_GOOGLE_ID: z.string(),
		AUTH_GOOGLE_SECRET: z.string(),
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
		// cloudflare
		CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
		CLOUDFLARE_D1_DATABASE_ID: z.string().optional(),
		CLOUDFLARE_TOKEN: z.string().optional(),
		// HTTP Proxy
		HTTP_PROXY: z.string()
	},

	/**
	 * Specify your client-side environment variables schema here. This way you can ensure the app
	 * isn't built with invalid env vars. To expose them to the client, prefix them with
	 * `NEXT_PUBLIC_`.
	 */
	client: {
		// NEXT_PUBLIC_CLIENTVAR: z.string(),
	},

	/**
	 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
	 * middlewares) or client-side so we need to destruct manually.
	 */
	runtimeEnv: {
		LOCAL_DB_PATH: process.env.LOCAL_DB_PATH,
		AUTH_SECRET: process.env.AUTH_SECRET,
		// AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
		// AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
		NODE_ENV: process.env.NODE_ENV,
		AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
		AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
		AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
		AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
		// cloudflare
		CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
		CLOUDFLARE_D1_DATABASE_ID: process.env.CLOUDFLARE_D1_DATABASE_ID,
		CLOUDFLARE_TOKEN: process.env.CLOUDFLARE_TOKEN,
		// http代理
		HTTP_PROXY: process.env.HTTP_PROXY
	},
	/**
	 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
	 * useful for Docker builds.
	 */
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
	/**
	 * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
	 * `SOME_VAR=''` will throw an error.
	 */
	emptyStringAsUndefined: true
});
