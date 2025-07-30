import fs from "node:fs";
import path from "node:path";
import type { Config } from "drizzle-kit";

import { env } from "@/env";

function getLocalD1DB() {
	try {
		const basePath = path.resolve(".wrangler/state/v3/d1");
		const dbFile = fs.readdirSync(basePath, { encoding: "utf-8", recursive: true }).find(f => f.endsWith(".sqlite"));

		if (!dbFile) {
			throw new Error(`.sqlite file not found in ${basePath}`);
		}

		const url = path.resolve(basePath, dbFile);
		return url;
	} catch (err) {
		console.error(err);

		return null;
	}
}

export default {
	schema: "./src/server/db/schema.ts",
	out: "./migrations",
	dialect: "sqlite",
	...(process.env.NODE_ENV === "production"
		? {
				driver: "d1-http",
				dbCredentials: {
					accountId: env.CLOUDFLARE_ACCOUNT_ID ?? "sk_invalid",
					databaseId: env.CLOUDFLARE_D1_DATABASE_ID ?? "sk_invalid",
					token: env.CLOUDFLARE_TOKEN ?? "sk_invalid"
				}
		  }
		: {
				dbCredentials: {
					url: getLocalD1DB()
				}
		  }),

	tablesFilter: ["blog_*"]
} satisfies Config;
