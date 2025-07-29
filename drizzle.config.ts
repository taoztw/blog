import type { Config } from "drizzle-kit";

import { env } from "@/env";

export default {
	schema: "./src/server/db/schema.ts",
	out: "./migrations",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: env.CLOUDFLARE_ACCOUNT_ID ?? "sk_invalid",
		databaseId: env.CLOUDFLARE_D1_DATABASE_ID ?? "sk_invalid",
		token: env.CLOUDFLARE_TOKEN ?? "sk_invalid"
	},
	tablesFilter: ["blog_*"]
} satisfies Config;
